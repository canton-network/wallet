// Generated from ../../../../../Splice/Testing/Tokens/TestTokenV2/AccountConfig/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439 from '@daml.js/splice-api-token-allocation-v2-1.0.0';
import * as pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099 from '@daml.js/splice-api-token-transfer-instruction-v2-1.0.0';
import * as pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 from '@daml.js/splice-api-token-holding-v2-1.0.0';
import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c from '@daml.js/splice-api-token-allocation-instruction-v2-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type AccountConfig = {
  admin: damlTypes.Party,
  account: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account,
  ownerConfig: PartyConfig,
  providerConfig: PartyConfig,
}

export declare interface AccountConfigInterface {
  Archive: 
    damlTypes.Choice<AccountConfig, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AccountConfig, undefined>>;
  AuthorizeAllocationAction: 
    damlTypes.Choice<AccountConfig, AuthorizeAllocationAction, pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AccountConfig, undefined>>;
  AuthorizeAllocationInstructionAction: 
    damlTypes.Choice<AccountConfig, AuthorizeAllocationInstructionAction, pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AccountConfig, undefined>>;
  AuthorizeTransferInstructionAction: 
    damlTypes.Choice<AccountConfig, AuthorizeTransferInstructionAction, pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AccountConfig, undefined>>;
}
export declare const AccountConfig:
  damlTypes.Template<AccountConfig, undefined, '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.AccountConfig:AccountConfig'> &
  damlTypes.ToInterface<AccountConfig, never> &
  AccountConfigInterface

export declare type AccountProposal = {
  config: AccountConfig,
}

export declare interface AccountProposalInterface {
  AccountProposal_Accept: 
    damlTypes.Choice<AccountProposal, AccountProposal_Accept, AccountProposal_Accept_Result, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AccountProposal, undefined>>;
  AccountProposal_Reject: 
    damlTypes.Choice<AccountProposal, AccountProposal_Reject, AccountProposal_Reject_Result, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AccountProposal, undefined>>;
  AccountProposal_Withdraw: 
    damlTypes.Choice<AccountProposal, AccountProposal_Withdraw, AccountProposal_Withdraw_Result, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AccountProposal, undefined>>;
  Archive: 
    damlTypes.Choice<AccountProposal, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AccountProposal, undefined>>;
}
export declare const AccountProposal:
  damlTypes.Template<AccountProposal, undefined, '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.AccountConfig:AccountProposal'> &
  damlTypes.ToInterface<AccountProposal, never> &
  AccountProposalInterface

export declare type AccountProposal_Accept = {
}

export declare const AccountProposal_Accept:
  damlTypes.Serializable<AccountProposal_Accept>

export declare type AccountProposal_Accept_Result = {
  accountConfig: damlTypes.ContractId<AccountConfig>,
}

export declare const AccountProposal_Accept_Result:
  damlTypes.Serializable<AccountProposal_Accept_Result>

export declare type AccountProposal_Reject = {
}

export declare const AccountProposal_Reject:
  damlTypes.Serializable<AccountProposal_Reject>

export declare type AccountProposal_Reject_Result = {
}

export declare const AccountProposal_Reject_Result:
  damlTypes.Serializable<AccountProposal_Reject_Result>

export declare type AccountProposal_Withdraw = {
}

export declare const AccountProposal_Withdraw:
  damlTypes.Serializable<AccountProposal_Withdraw>

export declare type AccountProposal_Withdraw_Result = {
}

export declare const AccountProposal_Withdraw_Result:
  damlTypes.Serializable<AccountProposal_Withdraw_Result>

export declare type AllocationInstructionState =
  | 'AIS_Init'
  | 'AIS_Withdrawn'
  | 'AIS_Accepted'


export declare const AllocationInstructionState:
  damlTypes.Serializable<AllocationInstructionState> & { readonly keys: AllocationInstructionState[] } & { readonly [e in AllocationInstructionState]: e }

export declare type AllocationState =
  | 'AS_Init'
  | 'AS_Withdrawn'
  | 'AS_Cancelled'
  | 'AS_Settled'


export declare const AllocationState:
  damlTypes.Serializable<AllocationState> & { readonly keys: AllocationState[] } & { readonly [e in AllocationState]: e }

export declare type AuthSpec<actionType> =
  | { tag: 'STAS_Account'; value: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account }
  | { tag: 'STAS_Action'; value: actionType }
  | { tag: 'STAS_Parties'; value: damlTypes.Party[] }


export declare const AuthSpec:
  <actionType>(actionType: damlTypes.Serializable<actionType>) => damlTypes.Serializable<AuthSpec<actionType>>

export declare type AuthorizeAllocationAction = {
  actor: damlTypes.Party,
  authorizer: damlTypes.Party,
  action: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationAction,
  allocationCid: damlTypes.ContractId<pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation>,
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const AuthorizeAllocationAction:
  damlTypes.Serializable<AuthorizeAllocationAction>

export declare type AuthorizeAllocationInstructionAction = {
  actor: damlTypes.Party,
  authorizer: damlTypes.Party,
  action: pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstructionAction,
  instrCid: damlTypes.ContractId<pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationInstruction>,
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const AuthorizeAllocationInstructionAction:
  damlTypes.Serializable<AuthorizeAllocationInstructionAction>

export declare type AuthorizeTransferInstructionAction = {
  actor: damlTypes.Party,
  authorizer: damlTypes.Party,
  action: pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionAction,
  instrCid: damlTypes.ContractId<pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstruction>,
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const AuthorizeTransferInstructionAction:
  damlTypes.Serializable<AuthorizeTransferInstructionAction>

export declare type PartyConfig = {
  canInitiate: boolean,
  mustApprove: boolean,
}

export declare const PartyConfig:
  damlTypes.Serializable<PartyConfig>

export declare type TransferInstructionState =
  | 'TIS_Init'
  | 'TIS_Authorized'
  | 'TIS_Withdrawn'
  | 'TIS_Rejected'
  | 'TIS_Accepted'


export declare const TransferInstructionState:
  damlTypes.Serializable<TransferInstructionState> & { readonly keys: TransferInstructionState[] } & { readonly [e in TransferInstructionState]: e }
