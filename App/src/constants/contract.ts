// Testnet deployment (PerkOS). Override via NEXT_PUBLIC_CONTRACT_ADDRESS for other networks.
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "ST16EWRC01S1SFWGBP63MW47VY8P3AYFA8VGEBGE5";
export const AGENT_REGISTRY_CONTRACT = `${CONTRACT_ADDRESS}.agent-registry`;
export const AGENTIC_COMMERCE_CONTRACT = `${CONTRACT_ADDRESS}.agentic-commerce`;
