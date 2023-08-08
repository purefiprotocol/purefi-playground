import { polygonMumbai, zkSyncTestnet } from 'wagmi/chains';

const CONTRACTS_DICTIONARY = {
  [polygonMumbai.id]: {
    address: '0x6353c96305637D2FC9a8de8ef56881790D9cb730',
    tokenAddress: '0x70892902C0BfFdEEAac711ec48F14c00b0fa7E3A', // tUFI
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'previousOwner',
            type: 'address',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'newOwner',
            type: 'address',
          },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '_to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: '_purefidata',
            type: 'bytes',
          },
        ],
        name: 'buyForWithAGEKYC',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '_to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: '_purefidata',
            type: 'bytes',
          },
        ],
        name: 'buyForWithAML',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '_to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: '_purefidata',
            type: 'bytes',
          },
        ],
        name: 'buyForWithCOUNTRYAGEKYC',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '_to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: '_purefidata',
            type: 'bytes',
          },
        ],
        name: 'buyForWithCOUNTRYKYC',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '_to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: '_purefidata',
            type: 'bytes',
          },
        ],
        name: 'buyForWithKYC',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '_to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: '_purefidata',
            type: 'bytes',
          },
        ],
        name: 'buyForWithKYCAML',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '_to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: '_purefidata',
            type: 'bytes',
          },
        ],
        name: 'buyForWithKYCPurefi1',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '_to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: '_purefidata',
            type: 'bytes',
          },
        ],
        name: 'buyForWithKYCPurefi2',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '_to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: '_purefidata',
            type: 'bytes',
          },
        ],
        name: 'buyForWithOptionalKYCAML',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'initialize',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'owner',
        outputs: [
          {
            internalType: 'address',
            name: '',
            type: 'address',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '_verifier',
            type: 'address',
          },
        ],
        name: 'setVerifier',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'newOwner',
            type: 'address',
          },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'version',
        outputs: [
          {
            internalType: 'uint32',
            name: '',
            type: 'uint32',
          },
        ],
        stateMutability: 'pure',
        type: 'function',
      },
    ],
  },
  // [zkSyncTestnet.id]: {
  //   address: '0x4F54a9914683221c768F8A05C26B13219fDD5d54',
  //   tokenAddress: '0xB477a7AB4d39b689fEa0fDEd737F97C76E4b0b93', // tUFI
  //   abi: [
  //     {
  //       anonymous: false,
  //       inputs: [
  //         {
  //           indexed: true,
  //           internalType: 'address',
  //           name: 'previousOwner',
  //           type: 'address',
  //         },
  //         {
  //           indexed: true,
  //           internalType: 'address',
  //           name: 'newOwner',
  //           type: 'address',
  //         },
  //       ],
  //       name: 'OwnershipTransferred',
  //       type: 'event',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: '_to',
  //           type: 'address',
  //         },
  //         {
  //           internalType: 'bytes',
  //           name: '_purefidata',
  //           type: 'bytes',
  //         },
  //       ],
  //       name: 'buyForWithAGEKYC',
  //       outputs: [],
  //       stateMutability: 'payable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: '_to',
  //           type: 'address',
  //         },
  //         {
  //           internalType: 'bytes',
  //           name: '_purefidata',
  //           type: 'bytes',
  //         },
  //       ],
  //       name: 'buyForWithAML',
  //       outputs: [],
  //       stateMutability: 'payable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: '_to',
  //           type: 'address',
  //         },
  //         {
  //           internalType: 'bytes',
  //           name: '_purefidata',
  //           type: 'bytes',
  //         },
  //       ],
  //       name: 'buyForWithCOUNTRYAGEKYC',
  //       outputs: [],
  //       stateMutability: 'payable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: '_to',
  //           type: 'address',
  //         },
  //         {
  //           internalType: 'bytes',
  //           name: '_purefidata',
  //           type: 'bytes',
  //         },
  //       ],
  //       name: 'buyForWithCOUNTRYKYC',
  //       outputs: [],
  //       stateMutability: 'payable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: '_to',
  //           type: 'address',
  //         },
  //         {
  //           internalType: 'bytes',
  //           name: '_purefidata',
  //           type: 'bytes',
  //         },
  //       ],
  //       name: 'buyForWithKYC',
  //       outputs: [],
  //       stateMutability: 'payable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: '_to',
  //           type: 'address',
  //         },
  //         {
  //           internalType: 'bytes',
  //           name: '_purefidata',
  //           type: 'bytes',
  //         },
  //       ],
  //       name: 'buyForWithKYCAML',
  //       outputs: [],
  //       stateMutability: 'payable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: '_to',
  //           type: 'address',
  //         },
  //         {
  //           internalType: 'bytes',
  //           name: '_purefidata',
  //           type: 'bytes',
  //         },
  //       ],
  //       name: 'buyForWithKYCPurefi1',
  //       outputs: [],
  //       stateMutability: 'payable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: '_to',
  //           type: 'address',
  //         },
  //         {
  //           internalType: 'bytes',
  //           name: '_purefidata',
  //           type: 'bytes',
  //         },
  //       ],
  //       name: 'buyForWithKYCPurefi2',
  //       outputs: [],
  //       stateMutability: 'payable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: '_to',
  //           type: 'address',
  //         },
  //         {
  //           internalType: 'bytes',
  //           name: '_purefidata',
  //           type: 'bytes',
  //         },
  //       ],
  //       name: 'buyForWithOptionalKYCAML',
  //       outputs: [],
  //       stateMutability: 'payable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [],
  //       name: 'initialize',
  //       outputs: [],
  //       stateMutability: 'nonpayable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [],
  //       name: 'owner',
  //       outputs: [
  //         {
  //           internalType: 'address',
  //           name: '',
  //           type: 'address',
  //         },
  //       ],
  //       stateMutability: 'view',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [],
  //       name: 'renounceOwnership',
  //       outputs: [],
  //       stateMutability: 'nonpayable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: '_verifier',
  //           type: 'address',
  //         },
  //       ],
  //       name: 'setVerifier',
  //       outputs: [],
  //       stateMutability: 'nonpayable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: 'newOwner',
  //           type: 'address',
  //         },
  //       ],
  //       name: 'transferOwnership',
  //       outputs: [],
  //       stateMutability: 'nonpayable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [],
  //       name: 'version',
  //       outputs: [
  //         {
  //           internalType: 'uint32',
  //           name: '',
  //           type: 'uint32',
  //         },
  //       ],
  //       stateMutability: 'pure',
  //       type: 'function',
  //     },
  //   ],
  // },
};

export { CONTRACTS_DICTIONARY };
