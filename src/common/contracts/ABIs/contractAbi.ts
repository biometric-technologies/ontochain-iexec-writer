import { InterfaceAbi } from 'ethers';

export const HASHES_SAVER_ABI: InterfaceAbi = [
  { type: 'constructor', inputs: [] },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'tuple',
        name: '',
        internalType: 'struct HashStorage.HashStruct',
        components: [
          { type: 'string' },
          { type: 'uint256' },
          { type: 'string' },
        ],
      },
    ],
    name: 'getHashInfo',
    inputs: [{ type: 'string', name: 'hash', internalType: 'string' }],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      { type: 'string', name: 'hash', internalType: 'string' },
      { type: 'uint256', name: 'timestamp', internalType: 'uint256' },
      { type: 'string', name: 'loanId', internalType: 'string' },
    ],
    name: 'hashes',
    inputs: [{ type: 'string', name: '', internalType: 'string' }],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [{ type: 'address', name: '', internalType: 'address' }],
    name: 'owner',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'saveHashes',
    inputs: [
      {
        type: 'tuple[]',
        name: '_hashes',
        internalType: 'struct HashStorage.HashStruct[]',
        components: [
          { type: 'string' },
          { type: 'uint256' },
          { type: 'string' },
        ],
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'transferOwnership',
    inputs: [{ type: 'address', name: 'newOwner', internalType: 'address' }],
  },
  {
    type: 'event',
    name: 'NewHash',
    inputs: [
      {
        type: 'tuple[]',
        name: 'hash',
        indexed: false,
        components: [
          { type: 'string' },
          { type: 'uint256' },
          { type: 'string' },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [{ type: 'address', name: 'owner', internalType: 'address' }],
  },
];
