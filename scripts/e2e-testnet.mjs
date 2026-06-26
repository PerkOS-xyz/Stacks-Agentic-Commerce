// End-to-end integration test against the DEPLOYED testnet contracts.
// Plays a real job: client (deployer) funds escrow, provider submits, evaluator completes.
// Verifies on-chain: escrow STX movement, job status machine, reputation update, rating,
// and the validation-registry auth guard. Reads the gitignored .env for the deployer key.
import { readFileSync, writeFileSync } from "node:fs";
import {
  makeContractCall, makeSTXTokenTransfer, broadcastTransaction, fetchNonce,
  fetchCallReadOnlyFunction, cvToValue, getAddressFromPrivateKey, randomPrivateKey,
  Cl, PostConditionMode,
} from "@stacks/transactions";
import { STACKS_TESTNET as network } from "@stacks/network";

const API = "https://api.testnet.hiro.so";
const C = "agentic-commerce", R = "reputation-registry", V = "validation-registry";
const BUDGET = 1_000_000n; // 1 STX escrow
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { (cond ? pass++ : fail++); console.log(`  ${cond ? "✓" : "✗ FAIL"} ${name}${extra ? " — " + extra : ""}`); };

const env = Object.fromEntries(readFileSync(".env", "utf8").split("\n").filter(l => l && !l.startsWith("#") && l.includes("=")).map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const clientKey = env.DEPLOYER_PRIVATE_KEY;
const client = env.DEPLOYER_ADDRESS;

// ephemeral actors
const provKey = randomPrivateKey(), provider = getAddressFromPrivateKey(provKey, "testnet");
const evalKey = randomPrivateKey(), evaluator = getAddressFromPrivateKey(evalKey, "testnet");
console.log("client(deployer):", client);
console.log("provider:", provider);
console.log("evaluator:", evaluator, "\n");

async function waitFor(txid, label) {
  for (let i = 0; i < 40; i++) {
    const r = await fetch(`${API}/extended/v1/tx/${txid}`);
    const d = r.ok ? await r.json() : {};
    if (d.tx_status === "success") return d;
    if (String(d.tx_status || "").startsWith("abort")) { console.log(`  ✗ ${label} aborted: ${d.tx_result?.repr}`); return d; }
    await sleep(10000);
  }
  console.log(`  ! ${label} timed out`); return null;
}
async function send(tx, label) {
  const res = await broadcastTransaction({ transaction: tx, network });
  if (res.error) { console.log(`  ✗ broadcast ${label}: ${res.error} ${res.reason || ""}`); throw new Error(label); }
  return waitFor(res.txid, label);
}
async function pub(contract, fn, args, key, nonce, label) {
  const tx = await makeContractCall({ contractAddress: client, contractName: contract, functionName: fn, functionArgs: args, senderKey: key, network, nonce, fee: 200000n, postConditionMode: PostConditionMode.Allow });
  return send(tx, label);
}
async function read(contract, fn, args) {
  const cv = await fetchCallReadOnlyFunction({ contractAddress: client, contractName: contract, functionName: fn, functionArgs: args, network, senderAddress: client });
  return cv;
}
async function stxBalance(addr) {
  const r = await fetch(`${API}/extended/v1/address/${addr}/balances`);
  return BigInt((await r.json()).stx.balance);
}

let n = await fetchNonce({ address: client, network });

console.log("STEP 0 — fund ephemeral actors (fees):");
await send(await makeSTXTokenTransfer({ recipient: provider, amount: 3_000_000n, senderKey: clientKey, network, nonce: n++, fee: 200000n }), "fund provider");
await send(await makeSTXTokenTransfer({ recipient: evaluator, amount: 3_000_000n, senderKey: clientKey, network, nonce: n++, fee: 200000n }), "fund evaluator");
console.log("  ✓ funded\n");

console.log("STEP 1 — create-job (client):");
const created = await pub(C, "create-job", [Cl.none(), Cl.principal(evaluator), Cl.uint(900000), Cl.stringAscii("E2E: summarize a document")], clientKey, n++, "create-job");
check("create-job ok", created?.tx_result?.repr?.startsWith("(ok u"), created?.tx_result?.repr);
const jobId = Number(cvToValue(await read(C, "get-job-count", [])).value);
console.log("  job id =", jobId);

console.log("STEP 2 — set-budget + fund-job (escrow):");
await pub(C, "set-budget", [Cl.uint(jobId), Cl.uint(BUDGET)], clientKey, n++, "set-budget");
const provBefore = await stxBalance(provider);
await pub(C, "fund-job", [Cl.uint(jobId)], clientKey, n++, "fund-job");
const escrow = cvToValue(await read(C, "get-escrow-balance", [Cl.uint(jobId)])).value;
check("escrow holds the budget", String(escrow) === String(BUDGET), `escrow=${escrow}`);
const st2 = cvToValue(await read(C, "get-job", [Cl.uint(jobId)])).value.status.value;
check("status = FUNDED (1)", String(st2) === "1", `status=${st2}`);

console.log("STEP 3 — assign-provider + submit-work:");
await pub(C, "assign-provider", [Cl.uint(jobId), Cl.principal(provider)], clientKey, n++, "assign-provider");
await pub(C, "submit-work", [Cl.uint(jobId), Cl.bufferFromAscii("deliverable-hash")], provKey, 0, "submit-work");
const st3 = cvToValue(await read(C, "get-job", [Cl.uint(jobId)])).value.status.value;
check("status = SUBMITTED (2)", String(st3) === "2", `status=${st3}`);

console.log("STEP 4 — complete-job (evaluator) -> payout + reputation:");
await pub(C, "complete-job", [Cl.uint(jobId)], evalKey, 0, "complete-job");
const st4 = cvToValue(await read(C, "get-job", [Cl.uint(jobId)])).value.status.value;
check("status = COMPLETED (3)", String(st4) === "3", `status=${st4}`);
const escrow2 = cvToValue(await read(C, "get-escrow-balance", [Cl.uint(jobId)])).value;
check("escrow cleared", String(escrow2) === "0", `escrow=${escrow2}`);
const provAfter = await stxBalance(provider);
check("provider received the escrow STX", provAfter - provBefore >= BUDGET - 250000n, `delta=${provAfter - provBefore}`);
const rep = cvToValue(await read(R, "get-reputation", [Cl.principal(provider)])).value;
check("reputation completed-jobs = 1", String(rep["completed-jobs"].value) === "1", `completed=${rep["completed-jobs"].value}`);

console.log("STEP 5 — rate-agent (client rates provider):");
await pub(R, "rate-agent", [Cl.principal(provider), Cl.uint(5), Cl.uint(jobId), Cl.stringAscii("excellent on-chain work")], clientKey, n++, "rate-agent");
const rep2 = cvToValue(await read(R, "get-reputation", [Cl.principal(provider)])).value;
check("rating recorded (avg 5)", String(rep2["average-score"].value) === "5" && String(rep2["rating-count"].value) === "1", `avg=${rep2["average-score"].value}`);

console.log("STEP 6 — validation auth guard (non-protocol-caller verify must fail):");
const vg = await pub(V, "verify-agent", [Cl.principal(provider), Cl.bufferFromHex("ab".repeat(32)), Cl.list([Cl.stringAscii("trading")])], clientKey, n++, "verify-agent(guard)");
check("verify-agent rejected (err u101)", vg?.tx_result?.repr === "(err u101)", vg?.tx_result?.repr);

console.log(`\n========== E2E RESULT: ${pass} passed, ${fail} failed ==========`);
writeFileSync("/private/tmp/claude-501/-Users-osx-Projects-Stacks/9ce56664-604b-4571-86cd-771a7ab5ffd1/scratchpad/e2e-result.json", JSON.stringify({ pass, fail, jobId, provider, evaluator }, null, 2));
process.exit(fail === 0 ? 0 : 1);
