import { StacksNetwork, StacksTestnet, StacksMainnet } from "@stacks/network";

export const NETWORK: StacksNetwork =
  process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet"
    ? new StacksMainnet()
    : new StacksTestnet();
