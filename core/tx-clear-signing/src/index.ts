// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export { canonicalize, CanonicalizeError } from './canonical-json.ts'
export {
    clearSign,
    HashMismatchError,
    type ClearSigningResult,
} from './clear-sign.ts'
export { parseDescriptorText, type Descriptor } from './descriptor.ts'
export { parseJsonStrict, StrictJsonError } from './strict-json.ts'
export {
    signDescriptor,
    signingMessage,
    verifySignatures,
    type DescriptorSignature,
    type SignatureVerification,
    type TrustedKey,
} from './signature.ts'
export { REFERENCE_SIGNER, TRUSTED_KEYS } from './trusted-keys.ts'
