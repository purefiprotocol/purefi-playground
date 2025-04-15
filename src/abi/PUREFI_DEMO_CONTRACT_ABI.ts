import { parseAbi } from 'viem';

const PUREFI_DEMO_CONTRACT_ABI = parseAbi([
  'function deposit(uint256 assets, address receiver,bytes calldata _purefidata) public returns (uint256 shares)',
  'function withdraw(uint256 shares, address receiver, address owner, bytes calldata _purefidata) public returns (uint256 shares)',
  'function whitelist(bytes calldata _purefidata) public returns (bool succeed)',
]);

export { PUREFI_DEMO_CONTRACT_ABI };
