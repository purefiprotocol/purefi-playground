import { SignatureType } from '@purefi/verifier-sdk';

const DEFAULT_SIGN_TYPE = SignatureType.ECDSA;

const SIGN_TYPE_OPTIONS = [
  {
    label: 'ECDSA',
    value: SignatureType.ECDSA,
  },
  {
    label: 'BABYJUBJUB',
    value: SignatureType.BABYJUBJUB,
  },
];

export { SIGN_TYPE_OPTIONS, DEFAULT_SIGN_TYPE };
