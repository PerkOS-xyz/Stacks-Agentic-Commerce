// Deploy the 4 Clarity contracts to Stacks testnet via Stacks.js (no clarinet binary needed).
// Reads the deployer key from .env (gitignored). Order matters: reputation-registry must be
// confirmed before agentic-commerce (which calls into it), then the commerce contract is
// whitelisted as a reputation protocol-caller.
import { readFileSync, writeFileSync } from "node:fs";
import {
  makeContractDeploy,
  makeContractCall,
  broadcastTransaction,
  fetchNonce,
  getAddressFromPrivateKey,
  Cl,
  PostConditionMode,
} from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";

const API = "https://api.testnet.hiro.so";
const network = STACKS_TESTNET;
const RESULT_PATH =
  "/private/tmp/claude-501/-Users-osx-Projects-Stacks/9ce56664-604b-4571-86cd-771a7ab5ffd1/scratchpad/deploy-result.json";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const senderKey = env.DEPLOYER_PRIVATE_KEY;
const deployer = env.DEPLOYER_ADDRESS;
console.log("Deployer:", deployer, "(derived:", getAddressFromPrivateKey(senderKey, "testnet") + ")");

const DEPLOY_FEE = 2_000_000n; // 2 STX, generous for testnet
const CALL_FEE = 100_000n;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function txStatus(txid) {
  try {
    const r = await fetch(`${API}/extended/v1/tx/${txid}`);
    if (!r.ok) return "pending";
    return (await r.json()).tx_status;
  } catch {
    return "pending";
  }
}

async function waitFor(txid, label) {
  console.log(`  waiting for ${label} (${txid}) ...`);
  for (let i = 0; i < 180; i++) {
    const s = await txStatus(txid);
    if (s === "success") {
      console.log(`  ✓ ${label} confirmed`);
      return true;
    }
    if (s && String(s).startsWith("abort")) {
      console.log(`  ✗ ${label} failed: ${s}`);
      return false;
    }
    await sleep(10000);
  }
  console.log(`  ! ${label} timed out`);
  return false;
}

async function deploy(name, nonce) {
  const codeBody = readFileSync(`contracts/${name}.clar`, "utf8");
  const tx = await makeContractDeploy({
    contractName: name,
    codeBody,
    senderKey,
    network,
    nonce,
    fee: DEPLOY_FEE,
    clarityVersion: 2,
    postConditionMode: PostConditionMode.Allow,
  });
  const res = await broadcastTransaction({ transaction: tx, network });
  if (res.error) {
    console.log(`  ✗ broadcast ${name}: ${res.error} — ${res.reason || ""}`);
    throw new Error(`${name}: ${res.reason || res.error}`);
  }
  console.log(`  → ${name} broadcast: ${res.txid}`);
  return res.txid;
}

const result = { deployer, network: "testnet", explorerBase: "https://explorer.hiro.so", txids: {}, contracts: {} };

let nonce = await fetchNonce({ address: deployer, network });
console.log("Start nonce:", nonce.toString());

console.log("\nPhase 1 — independent contracts:");
result.txids["agent-registry"] = await deploy("agent-registry", nonce++);
result.txids["reputation-registry"] = await deploy("reputation-registry", nonce++);
result.txids["validation-registry"] = await deploy("validation-registry", nonce++);

await waitFor(result.txids["agent-registry"], "agent-registry");
await waitFor(result.txids["reputation-registry"], "reputation-registry");
await waitFor(result.txids["validation-registry"], "validation-registry");

console.log("\nPhase 2 — agentic-commerce (depends on reputation-registry):");
result.txids["agentic-commerce"] = await deploy("agentic-commerce", nonce++);
await waitFor(result.txids["agentic-commerce"], "agentic-commerce");

console.log("\nPhase 3 — whitelist commerce as reputation protocol-caller:");
const call = await makeContractCall({
  contractAddress: deployer,
  contractName: "reputation-registry",
  functionName: "add-protocol-caller",
  functionArgs: [Cl.contractPrincipal(deployer, "agentic-commerce")],
  senderKey,
  network,
  nonce: nonce++,
  fee: CALL_FEE,
  postConditionMode: PostConditionMode.Allow,
});
const callRes = await broadcastTransaction({ transaction: call, network });
if (callRes.error) {
  console.log(`  ✗ add-protocol-caller: ${callRes.error} — ${callRes.reason || ""}`);
} else {
  result.txids["add-protocol-caller"] = callRes.txid;
  console.log(`  → add-protocol-caller broadcast: ${callRes.txid}`);
  await waitFor(callRes.txid, "add-protocol-caller");
}

for (const c of ["agent-registry", "agentic-commerce", "reputation-registry", "validation-registry"]) {
  result.contracts[c] = `${deployer}.${c}`;
}

writeFileSync(RESULT_PATH, JSON.stringify(result, null, 2));
console.log("\n========== DEPLOY COMPLETE ==========");
for (const c in result.contracts) console.log(" ", result.contracts[c]);
console.log("Result saved to scratchpad/deploy-result.json");
