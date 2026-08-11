// Generated from ../../../../../Splice/Testing/Tokens/TestTokenV2/Allocation/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439 from '@daml.js/splice-api-token-allocation-v2-1.0.0';
import * as pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520 from '@daml.js/splice-api-token-allocation-instruction-v1-1.0.0';
import * as pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 from '@daml.js/splice-api-token-holding-v2-1.0.0';
import * as pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d from '@daml.js/splice-api-token-allocation-v1-1.0.0';
import * as pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c from '@daml.js/splice-api-token-allocation-instruction-v2-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type AllocationKind =
  | 'CreateV1Allocation'
  | 'CreateV2Allocation'


export declare const AllocationKind:
  damlTypes.Serializable<AllocationKind> & { readonly keys: AllocationKind[] } & { readonly [e in AllocationKind]: e }

export declare type TokenAllocationInstructionV1 = {
  instrV2: TokenAllocationInstructionV2,
}

export declare interface TokenAllocationInstructionV1Interface {
  Archive: 
    damlTypes.Choice<TokenAllocationInstructionV1, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenAllocationInstructionV1, undefined>>;
}
export declare const TokenAllocationInstructionV1:
  damlTypes.Template<TokenAllocationInstructionV1, undefined, '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationInstructionV1'> &
  damlTypes.ToInterface<TokenAllocationInstructionV1, pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstruction | pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationInstruction> &
  TokenAllocationInstructionV1Interface

export declare type TokenAllocationInstructionV2 = {
  originalInstructionCid: damlTypes.Optional<damlTypes.ContractId<pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstruction>>,
  actionAuthorizers: damlTypes.Map<pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionAction, damlTypes.Party[]>,
  availableActions: damlTypes.Map<pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionAction, damlTypes.Party[][]>,
  inputHoldingCids: { [key: string]: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[] },
  settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo,
  allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification,
  admin: damlTypes.Party,
  requestedAt: damlTypes.Time,
  allocateBefore: damlTypes.Optional<damlTypes.Time>,
}

export declare interface TokenAllocationInstructionV2Interface {
  Archive: 
    damlTypes.Choice<TokenAllocationInstructionV2, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenAllocationInstructionV2, undefined>>;
}
export declare const TokenAllocationInstructionV2:
  damlTypes.Template<TokenAllocationInstructionV2, undefined, '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationInstructionV2'> &
  damlTypes.ToInterface<TokenAllocationInstructionV2, pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstruction> &
  TokenAllocationInstructionV2Interface

export declare type TokenAllocationV1 = {
  allocationV2: TokenAllocationV2,
}

export declare interface TokenAllocationV1Interface {
  Archive: 
    damlTypes.Choice<TokenAllocationV1, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenAllocationV1, undefined>>;
}
export declare const TokenAllocationV1:
  damlTypes.Template<TokenAllocationV1, undefined, '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationV1'> &
  damlTypes.ToInterface<TokenAllocationV1, pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation | pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation> &
  TokenAllocationV1Interface

export declare type TokenAllocationV2 = {
  originalAllocationCid: damlTypes.Optional<damlTypes.ContractId<pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation>>,
  actionAuthorizers: damlTypes.Map<pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationAction, damlTypes.Party[]>,
  availableActions: damlTypes.Map<pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationAction, damlTypes.Party[][]>,
  lockedTokens: { [key: string]: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[] },
  settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo,
  allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification,
  requestedAt: damlTypes.Time,
  allocateBefore: damlTypes.Optional<damlTypes.Time>,
  numIterations: damlTypes.Int,
}

export declare interface TokenAllocationV2Interface {
  Archive: 
    damlTypes.Choice<TokenAllocationV2, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenAllocationV2, undefined>>;
}
export declare const TokenAllocationV2:
  damlTypes.Template<TokenAllocationV2, undefined, '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationV2'> &
  damlTypes.ToInterface<TokenAllocationV2, pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation> &
  TokenAllocationV2Interface
