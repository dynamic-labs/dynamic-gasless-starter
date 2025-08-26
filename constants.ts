// Contract addresses
export const CONTRACTS = {
  "84532": {
    USD: "0x10b5Be494C2962A7B318aFB63f0Ee30b959D000b",
  },
} as const;

// Contract ABIs
export const TOKEN_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amountDollars_Max100",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function getContractAddress(
  networkId: string | number,
  contractName: string
): `0x${string}` | undefined {
  const networkContracts = (CONTRACTS as Record<string, any>)[networkId];
  if (networkContracts && contractName in networkContracts) {
    return networkContracts[contractName];
  }

  return undefined;
}
