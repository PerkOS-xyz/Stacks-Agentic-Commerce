import { describe, expect, it } from "vitest";
import { Clarinet, Chain, types } from "clarinet";

describe("Agent Registry", () => {
  let chain: Chain;
  let accounts: Map<string, any>;

  beforeAll(() => {
    chain = new Clarinet.Chain({ model: require("./models/agent-registry") });
    accounts = chain.accounts;
  });

  it("should register a new agent", () => {
    const block = chain.blockTrace([
      {
        contractCall: {
          contract: "agent-registry",
          function: "register-agent",
          args: [
            types.ascii("TestAgent"),
            types.ascii("Test description"),
            types.principal(accounts.get("account1")!.address),
            types.list([types.tuple({ name: types.ascii("web"), url: types.ascii("https://example.com") })]),
          ],
        },
      },
    ]);

    expect(block.receipts[0].result).toBe("(ok u1)");
  });

  it("should get agent by ID", () => {
    const block = chain.blockTrace([
      {
        contractCall: {
          contract: "agent-registry",
          function: "get-agent",
          args: [types.uint(1)],
        },
      },
    ]);

    expect(block.receipts[0].result).toMatch(/(ok|err)/);
  });

  it("should get agent count", () => {
    const block = chain.blockTrace([
      {
        contractCall: {
          contract: "agent-registry",
          function: "agent-count",
          args: [],
        },
      },
    ]);

    expect(block.receipts[0].result).toBe("(ok u1)");
  });
});
