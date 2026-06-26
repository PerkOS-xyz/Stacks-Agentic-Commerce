import { StacksTestnet } from "@stacks/network";
import { publicKeyToString } from "@stacks/common";
import { OpenAPIObject } from "openapi-typescript";

export const NETWORK = new StacksTestnet({ 
  url: "https://testnet.stacks.co" 
});

export async function connectWallet() {
  try {
    const transport = new StacksTestnet();
    const message = "Connect to Stacks-Agentic Commerce";
    
    const response = await window.openStacks.connect(message, {
      onFinish: (data) => {
        console.log("Wallet connected:", data);
      },
      onExit: () => {
        console.log("Wallet connection cancelled");
      }
    });
    
    return response;
  } catch (error) {
    console.error("Wallet connection error:", error);
    throw error;
  }
}

export async function disconnectWallet() {
  try {
    await window.openStacks.disconnect();
    console.log("Wallet disconnected");
  } catch (error) {
    console.error("Wallet disconnection error:", error);
    throw error;
  }
}
