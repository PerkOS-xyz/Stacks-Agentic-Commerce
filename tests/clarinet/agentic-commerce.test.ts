import { describe, expect, it } from "vitest";
import { Clarinet, Chain, types } from "clarinet";

describe("Agentic Commerce", () => {
  let chain: Chain;
  let accounts: Map<string, any>;

  beforeAll(() => {
    chain = new Clarinet.Chain({ model: require("./models/agentic-commerce") });
    accounts = chain.accounts;
  });

  it("should create a job", () => {
    const block = chain.blockTrace([
      {
        contractCall: {
          contract: "agentic-commerce",
          function: "create-job",
          args: [
            types.principal(accounts.get("account1")!.address),
            types.principal(accounts.get("account1")!.address),
            types.uint(100000),
            types.ascii("Test job"),
          ],
        },
      },
    ]);

    expect(block.receipts[0].result).toMatch(/(ok u1|err)/);
  });

  it("should set budget", () => {
    const block = chain.blockTrace([
      {
        contractCall: {
          contract: "agentic-commerce",
          function: "set-budget",
          args: [types.uint(1), types.uint(1000)],
        },
      },
    ]);

    expect(block.receipts[0].result).toBe("(ok true)");
  });
});
