import { Clarinet, Chain, types } from 'clarinet';

export function models() {
  const model = {
    agent_registry: {
      address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      contracts: {
        'agent-registry': {
          path: 'contracts/agent-registry.clar',
        },
      },
    },
  };
  return model;
}
