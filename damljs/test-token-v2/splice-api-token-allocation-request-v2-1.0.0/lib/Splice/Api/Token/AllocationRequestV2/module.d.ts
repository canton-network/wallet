// Generated from ../../../../Splice/Api/Token/AllocationRequestV2/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439 from '@daml.js/splice-api-token-allocation-v2-1.0.0';
import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type AllocationRequest = damlTypes.Interface<'#splice-api-token-allocation-request-v2:Splice.Api.Token.AllocationRequestV2:AllocationRequest'> & AllocationRequestView
export declare interface AllocationRequestInterface {
  AllocationRequest_Accept:
    damlTypes.Choice<AllocationRequest, AllocationRequest_Accept, AllocationRequest_AcceptResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<AllocationRequest, undefined>>;
  AllocationRequest_Reject:
    damlTypes.Choice<AllocationRequest, AllocationRequest_Reject, AllocationRequest_RejectResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<AllocationRequest, undefined>>;
  AllocationRequest_Withdraw:
    damlTypes.Choice<AllocationRequest, AllocationRequest_Withdraw, AllocationRequest_WithdrawResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<AllocationRequest, undefined>>;
  Archive:
    damlTypes.Choice<AllocationRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<AllocationRequest, undefined>>;
}
export declare const AllocationRequest:
  damlTypes.InterfaceCompanion<AllocationRequest, undefined, '#splice-api-token-allocation-request-v2:Splice.Api.Token.AllocationRequestV2:AllocationRequest'> &
  damlTypes.FromTemplate<AllocationRequest, unknown> &
  AllocationRequestInterface

export declare type AllocationRequestAction =
  | { tag: 'ARA_Accept'; value: {} }
  | { tag: 'ARA_Reject'; value: {} }
  | { tag: 'ARA_Custom'; value: AllocationRequestAction.ARA_Custom }


export declare const AllocationRequestAction:
  damlTypes.Serializable<AllocationRequestAction> & {
    ARA_Custom: damlTypes.Serializable<AllocationRequestAction.ARA_Custom>;
  }

export namespace AllocationRequestAction {
  type ARA_Custom = {
    id: string,
  }
}

export declare type AllocationRequestView = {
  originalRequestCid: damlTypes.Optional<damlTypes.ContractId<AllocationRequest>>,
  settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo,
  allocations: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification[],
  requestedAt: damlTypes.Time,
  settleAt: damlTypes.Optional<damlTypes.Time>,
  availableActions: damlTypes.Map<AllocationRequestAction, damlTypes.Party[][]>,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const AllocationRequestView:
  damlTypes.Serializable<AllocationRequestView>

export declare type AllocationRequest_Accept = {
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const AllocationRequest_Accept:
  damlTypes.Serializable<AllocationRequest_Accept>

export declare type AllocationRequest_AcceptResult = {
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const AllocationRequest_AcceptResult:
  damlTypes.Serializable<AllocationRequest_AcceptResult>

export declare type AllocationRequest_Reject = {
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const AllocationRequest_Reject:
  damlTypes.Serializable<AllocationRequest_Reject>

export declare type AllocationRequest_RejectResult = {
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const AllocationRequest_RejectResult:
  damlTypes.Serializable<AllocationRequest_RejectResult>

export declare type AllocationRequest_Withdraw = {
  actors: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const AllocationRequest_Withdraw:
  damlTypes.Serializable<AllocationRequest_Withdraw>

export declare type AllocationRequest_WithdrawResult = {
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const AllocationRequest_WithdrawResult:
  damlTypes.Serializable<AllocationRequest_WithdrawResult>
