import { Clarinet, Chain, types } from 'clarinet';

export function models() {
  const model = {
    agentic_commerce: {
      address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      contracts: {
        'agentic-commerce': {
          path: 'contracts/agentic-commerce.clar',
        },
      },
    },
  };
  return model;
}
