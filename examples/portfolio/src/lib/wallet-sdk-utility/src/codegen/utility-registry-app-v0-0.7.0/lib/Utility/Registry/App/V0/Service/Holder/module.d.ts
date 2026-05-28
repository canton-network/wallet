// Generated from Utility/Registry/App/V0/Service/Holder.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520 from '@daml.js/splice-api-token-allocation-instruction-v1-1.0.0';
import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193 from '@daml.js/splice-api-token-allocation-request-v1-1.0.0';
import * as pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b from '@daml.js/splice-api-token-holding-v1-1.0.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d from '@daml.js/splice-api-token-allocation-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab from '@daml.js/utility-registry-v0-0.6.0';

import * as Utility_Registry_App_V0_Configuration_Provider from '../../../../../../Utility/Registry/App/V0/Configuration/Provider/module';
import * as Utility_Registry_App_V0_Service_Enforcement from '../../../../../../Utility/Registry/App/V0/Service/Enforcement/module';

export declare type RejectedHolderServiceRequest_Delete_Result = {
};

export declare const RejectedHolderServiceRequest_Delete_Result:
  damlTypes.Serializable<RejectedHolderServiceRequest_Delete_Result> & {
  }
;


export declare type HolderServiceRequest_Cancel_Result = {
};

export declare const HolderServiceRequest_Cancel_Result:
  damlTypes.Serializable<HolderServiceRequest_Cancel_Result> & {
  }
;


export declare type HolderServiceRequest_Reject_Result = {
  rejectedHolderServiceRequestCid: damlTypes.ContractId<RejectedHolderServiceRequest>;
};

export declare const HolderServiceRequest_Reject_Result:
  damlTypes.Serializable<HolderServiceRequest_Reject_Result> & {
  }
;


export declare type HolderServiceRequest_Accept_Result = {
  holderServiceCid: damlTypes.ContractId<HolderService>;
};

export declare const HolderServiceRequest_Accept_Result:
  damlTypes.Serializable<HolderServiceRequest_Accept_Result> & {
  }
;


export declare type RejectedHolderServiceRequest_Delete = {
};

export declare const RejectedHolderServiceRequest_Delete:
  damlTypes.Serializable<RejectedHolderServiceRequest_Delete> & {
  }
;


export declare type RejectedHolderServiceRequest_Clean = {
  actor: damlTypes.Party;
};

export declare const RejectedHolderServiceRequest_Clean:
  damlTypes.Serializable<RejectedHolderServiceRequest_Clean> & {
  }
;


export declare type RejectedHolderServiceRequest = {
  request: HolderServiceRequest;
  reason: string;
};

export declare interface RejectedHolderServiceRequestInterface {
  RejectedHolderServiceRequest_Clean: damlTypes.Choice<RejectedHolderServiceRequest, RejectedHolderServiceRequest_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedHolderServiceRequest, undefined>>;
  Archive: damlTypes.Choice<RejectedHolderServiceRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedHolderServiceRequest, undefined>>;
  RejectedHolderServiceRequest_Delete: damlTypes.Choice<RejectedHolderServiceRequest, RejectedHolderServiceRequest_Delete, RejectedHolderServiceRequest_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedHolderServiceRequest, undefined>>;
}
export declare const RejectedHolderServiceRequest:
  damlTypes.Template<RejectedHolderServiceRequest, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Holder:RejectedHolderServiceRequest'> &
  damlTypes.ToInterface<RejectedHolderServiceRequest, never> &
  RejectedHolderServiceRequestInterface;

export declare namespace RejectedHolderServiceRequest {
}



export declare type HolderServiceRequest_Cancel = {
};

export declare const HolderServiceRequest_Cancel:
  damlTypes.Serializable<HolderServiceRequest_Cancel> & {
  }
;


export declare type HolderServiceRequest_Reject = {
  reason: string;
};

export declare const HolderServiceRequest_Reject:
  damlTypes.Serializable<HolderServiceRequest_Reject> & {
  }
;


export declare type HolderServiceRequest_Accept = {
  providerConfigurationCid: damlTypes.ContractId<Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration>;
  credentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
};

export declare const HolderServiceRequest_Accept:
  damlTypes.Serializable<HolderServiceRequest_Accept> & {
  }
;


export declare type HolderServiceRequest_Clean = {
  actor: damlTypes.Party;
};

export declare const HolderServiceRequest_Clean:
  damlTypes.Serializable<HolderServiceRequest_Clean> & {
  }
;


export declare type HolderServiceRequest = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  holder: damlTypes.Party;
};

export declare interface HolderServiceRequestInterface {
  HolderServiceRequest_Clean: damlTypes.Choice<HolderServiceRequest, HolderServiceRequest_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderServiceRequest, undefined>>;
  HolderServiceRequest_Accept: damlTypes.Choice<HolderServiceRequest, HolderServiceRequest_Accept, HolderServiceRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderServiceRequest, undefined>>;
  HolderServiceRequest_Reject: damlTypes.Choice<HolderServiceRequest, HolderServiceRequest_Reject, HolderServiceRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderServiceRequest, undefined>>;
  HolderServiceRequest_Cancel: damlTypes.Choice<HolderServiceRequest, HolderServiceRequest_Cancel, HolderServiceRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderServiceRequest, undefined>>;
  Archive: damlTypes.Choice<HolderServiceRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderServiceRequest, undefined>>;
}
export declare const HolderServiceRequest:
  damlTypes.Template<HolderServiceRequest, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Holder:HolderServiceRequest'> &
  damlTypes.ToInterface<HolderServiceRequest, never> &
  HolderServiceRequestInterface;

export declare namespace HolderServiceRequest {
}



export declare type HolderService_RequestUnlock_Result = {
  unlockRequestCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest>;
};

export declare const HolderService_RequestUnlock_Result:
  damlTypes.Serializable<HolderService_RequestUnlock_Result> & {
  }
;


export declare type HolderService_OfferUnlock_Result = {
  unlockOfferCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer>;
};

export declare const HolderService_OfferUnlock_Result:
  damlTypes.Serializable<HolderService_OfferUnlock_Result> & {
  }
;


export declare type HolderService_RequestLock_Result = {
  lockRequestCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest>;
};

export declare const HolderService_RequestLock_Result:
  damlTypes.Serializable<HolderService_RequestLock_Result> & {
  }
;


export declare type HolderService_OfferLock_Result = {
  lockOfferCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer>;
};

export declare const HolderService_OfferLock_Result:
  damlTypes.Serializable<HolderService_OfferLock_Result> & {
  }
;


export declare type HolderService_RequestTransfer_Result = {
  transferRequestCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest>;
};

export declare const HolderService_RequestTransfer_Result:
  damlTypes.Serializable<HolderService_RequestTransfer_Result> & {
  }
;


export declare type HolderService_AcceptTransferOffer_Result = {
  acceptedTransferCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer>;
};

export declare const HolderService_AcceptTransferOffer_Result:
  damlTypes.Serializable<HolderService_AcceptTransferOffer_Result> & {
  }
;


export declare type HolderService_OfferTransfer_Result = {
  transferOfferCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer>;
};

export declare const HolderService_OfferTransfer_Result:
  damlTypes.Serializable<HolderService_OfferTransfer_Result> & {
  }
;


export declare type HolderService_RequestBurn_Result = {
  burnRequestCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest>;
};

export declare const HolderService_RequestBurn_Result:
  damlTypes.Serializable<HolderService_RequestBurn_Result> & {
  }
;


export declare type HolderService_RequestMint_Result = {
  mintRequestCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest>;
};

export declare const HolderService_RequestMint_Result:
  damlTypes.Serializable<HolderService_RequestMint_Result> & {
  }
;


export declare type HolderService_RequestForceTransfer_Result = {
  forceTransferRequestCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest>;
};

export declare const HolderService_RequestForceTransfer_Result:
  damlTypes.Serializable<HolderService_RequestForceTransfer_Result> & {
  }
;


export declare type HolderService_RequestEnforcementService_Result = {
  enforcementServiceRequestCid: damlTypes.ContractId<Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest>;
};

export declare const HolderService_RequestEnforcementService_Result:
  damlTypes.Serializable<HolderService_RequestEnforcementService_Result> & {
  }
;


export declare type HolderService_Terminate_Result = {
};

export declare const HolderService_Terminate_Result:
  damlTypes.Serializable<HolderService_Terminate_Result> & {
  }
;


export declare type HolderService_RejectAllocationRequest = {
  allocationRequestCid: damlTypes.ContractId<pkg6fe848530b2404017c4a12874c956ad7d5c8a419ee9b040f96b5c13172d2e193.Splice.Api.Token.AllocationRequestV1.AllocationRequest>;
};

export declare const HolderService_RejectAllocationRequest:
  damlTypes.Serializable<HolderService_RejectAllocationRequest> & {
  }
;


export declare type HolderService_CreateAllocation = {
  registrar: damlTypes.Party;
  allocationFactoryCid: damlTypes.ContractId<pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory>;
  allocation: pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.AllocationSpecification;
  inputHoldings: damlTypes.ContractId<pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding>[];
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs;
};

export declare const HolderService_CreateAllocation:
  damlTypes.Serializable<HolderService_CreateAllocation> & {
  }
;


export declare type HolderService_RejectUnlockRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Reject;
};

export declare const HolderService_RejectUnlockRequest:
  damlTypes.Serializable<HolderService_RejectUnlockRequest> & {
  }
;


export declare type HolderService_AcceptUnlockRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Accept;
};

export declare const HolderService_AcceptUnlockRequest:
  damlTypes.Serializable<HolderService_AcceptUnlockRequest> & {
  }
;


export declare type HolderService_CancelUnlockRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Cancel;
};

export declare const HolderService_CancelUnlockRequest:
  damlTypes.Serializable<HolderService_CancelUnlockRequest> & {
  }
;


export declare type HolderService_RequestUnlock = {
  registrar: damlTypes.Party;
  holder: damlTypes.Party;
  lockContext: string;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  holdingLabel: string;
  reference: string;
  batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch;
};

export declare const HolderService_RequestUnlock:
  damlTypes.Serializable<HolderService_RequestUnlock> & {
  }
;


export declare type HolderService_RejectUnlockOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Reject;
};

export declare const HolderService_RejectUnlockOffer:
  damlTypes.Serializable<HolderService_RejectUnlockOffer> & {
  }
;


export declare type HolderService_AcceptUnlockOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Accept;
};

export declare const HolderService_AcceptUnlockOffer:
  damlTypes.Serializable<HolderService_AcceptUnlockOffer> & {
  }
;


export declare type HolderService_CancelUnlockOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Cancel;
};

export declare const HolderService_CancelUnlockOffer:
  damlTypes.Serializable<HolderService_CancelUnlockOffer> & {
  }
;


export declare type HolderService_OfferUnlock = {
  registrar: damlTypes.Party;
  locker: damlTypes.Party;
  lockContext: string;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  holdingLabel: string;
  reference: string;
  batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch;
};

export declare const HolderService_OfferUnlock:
  damlTypes.Serializable<HolderService_OfferUnlock> & {
  }
;


export declare type HolderService_RejectLockRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Reject;
};

export declare const HolderService_RejectLockRequest:
  damlTypes.Serializable<HolderService_RejectLockRequest> & {
  }
;


export declare type HolderService_AcceptLockRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Accept;
};

export declare const HolderService_AcceptLockRequest:
  damlTypes.Serializable<HolderService_AcceptLockRequest> & {
  }
;


export declare type HolderService_CancelLockRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Cancel;
};

export declare const HolderService_CancelLockRequest:
  damlTypes.Serializable<HolderService_CancelLockRequest> & {
  }
;


export declare type HolderService_RequestLock = {
  registrar: damlTypes.Party;
  holder: damlTypes.Party;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  context: string;
  reference: string;
  batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch;
};

export declare const HolderService_RequestLock:
  damlTypes.Serializable<HolderService_RequestLock> & {
  }
;


export declare type HolderService_RejectLockOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Reject;
};

export declare const HolderService_RejectLockOffer:
  damlTypes.Serializable<HolderService_RejectLockOffer> & {
  }
;


export declare type HolderService_AcceptLockOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Accept;
};

export declare const HolderService_AcceptLockOffer:
  damlTypes.Serializable<HolderService_AcceptLockOffer> & {
  }
;


export declare type HolderService_CancelLockOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Cancel;
};

export declare const HolderService_CancelLockOffer:
  damlTypes.Serializable<HolderService_CancelLockOffer> & {
  }
;


export declare type HolderService_OfferLock = {
  registrar: damlTypes.Party;
  locker: damlTypes.Party;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  context: string;
  holdingLabel: string;
  reference: string;
  batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch;
};

export declare const HolderService_OfferLock:
  damlTypes.Serializable<HolderService_OfferLock> & {
  }
;


export declare type HolderService_RejectTransferRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Reject;
};

export declare const HolderService_RejectTransferRequest:
  damlTypes.Serializable<HolderService_RejectTransferRequest> & {
  }
;


export declare type HolderService_AcceptTransferRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Accept;
};

export declare const HolderService_AcceptTransferRequest:
  damlTypes.Serializable<HolderService_AcceptTransferRequest> & {
  }
;


export declare type HolderService_CancelTransferRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Cancel;
};

export declare const HolderService_CancelTransferRequest:
  damlTypes.Serializable<HolderService_CancelTransferRequest> & {
  }
;


export declare type HolderService_RequestTransfer = {
  registrar: damlTypes.Party;
  sender: damlTypes.Party;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  receiverLabel: string;
  reference: string;
  batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch;
};

export declare const HolderService_RequestTransfer:
  damlTypes.Serializable<HolderService_RequestTransfer> & {
  }
;


export declare type HolderService_RejectTransferOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Reject;
};

export declare const HolderService_RejectTransferOffer:
  damlTypes.Serializable<HolderService_RejectTransferOffer> & {
  }
;


export declare type HolderService_AcceptTransferOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Accept;
};

export declare const HolderService_AcceptTransferOffer:
  damlTypes.Serializable<HolderService_AcceptTransferOffer> & {
  }
;


export declare type HolderService_CancelTransferOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Cancel;
};

export declare const HolderService_CancelTransferOffer:
  damlTypes.Serializable<HolderService_CancelTransferOffer> & {
  }
;


export declare type HolderService_OfferTransfer = {
  registrar: damlTypes.Party;
  receiver: damlTypes.Party;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  senderLabel: string;
  reference: string;
  batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch;
};

export declare const HolderService_OfferTransfer:
  damlTypes.Serializable<HolderService_OfferTransfer> & {
  }
;


export declare type HolderService_RejectBurnOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Reject;
};

export declare const HolderService_RejectBurnOffer:
  damlTypes.Serializable<HolderService_RejectBurnOffer> & {
  }
;


export declare type HolderService_AcceptBurnOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Accept;
};

export declare const HolderService_AcceptBurnOffer:
  damlTypes.Serializable<HolderService_AcceptBurnOffer> & {
  }
;


export declare type HolderService_CancelBurnRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Cancel;
};

export declare const HolderService_CancelBurnRequest:
  damlTypes.Serializable<HolderService_CancelBurnRequest> & {
  }
;


export declare type HolderService_RequestBurn = {
  registrar: damlTypes.Party;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  holdingLabel: string;
  reference: string;
  batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch;
};

export declare const HolderService_RequestBurn:
  damlTypes.Serializable<HolderService_RequestBurn> & {
  }
;


export declare type HolderService_RejectMintOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Reject;
};

export declare const HolderService_RejectMintOffer:
  damlTypes.Serializable<HolderService_RejectMintOffer> & {
  }
;


export declare type HolderService_AcceptMintOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Accept;
};

export declare const HolderService_AcceptMintOffer:
  damlTypes.Serializable<HolderService_AcceptMintOffer> & {
  }
;


export declare type HolderService_CancelMintRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Cancel;
};

export declare const HolderService_CancelMintRequest:
  damlTypes.Serializable<HolderService_CancelMintRequest> & {
  }
;


export declare type HolderService_RequestMint = {
  registrar: damlTypes.Party;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  reference: string;
  batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch;
  holdingLabel: string;
};

export declare const HolderService_RequestMint:
  damlTypes.Serializable<HolderService_RequestMint> & {
  }
;


export declare type HolderService_CancelForceTransferRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Cancel;
};

export declare const HolderService_CancelForceTransferRequest:
  damlTypes.Serializable<HolderService_CancelForceTransferRequest> & {
  }
;


export declare type HolderService_RequestForceTransfer = {
  requestorRationale: string;
  registrar: damlTypes.Party;
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  reference: string;
  batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch;
  sender: damlTypes.Party;
  senderLabel: string;
  receiver: damlTypes.Party;
  receiverLabel: string;
};

export declare const HolderService_RequestForceTransfer:
  damlTypes.Serializable<HolderService_RequestForceTransfer> & {
  }
;


export declare type HolderService_CancelEnforcementServiceRequest = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest>;
  payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Cancel;
};

export declare const HolderService_CancelEnforcementServiceRequest:
  damlTypes.Serializable<HolderService_CancelEnforcementServiceRequest> & {
  }
;


export declare type HolderService_RequestEnforcementService = {
  registrar: damlTypes.Party;
};

export declare const HolderService_RequestEnforcementService:
  damlTypes.Serializable<HolderService_RequestEnforcementService> & {
  }
;


export declare type HolderService_Terminate = {
};

export declare const HolderService_Terminate:
  damlTypes.Serializable<HolderService_Terminate> & {
  }
;


export declare type HolderService_Clean = {
  actor: damlTypes.Party;
};

export declare const HolderService_Clean:
  damlTypes.Serializable<HolderService_Clean> & {
  }
;


export declare type HolderService = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  holder: damlTypes.Party;
};

export declare interface HolderServiceInterface {
  HolderService_Clean: damlTypes.Choice<HolderService, HolderService_Clean, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_Terminate: damlTypes.Choice<HolderService, HolderService_Terminate, HolderService_Terminate_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RequestEnforcementService: damlTypes.Choice<HolderService, HolderService_RequestEnforcementService, HolderService_RequestEnforcementService_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_CancelEnforcementServiceRequest: damlTypes.Choice<HolderService, HolderService_CancelEnforcementServiceRequest, Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RequestForceTransfer: damlTypes.Choice<HolderService, HolderService_RequestForceTransfer, HolderService_RequestForceTransfer_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_CancelForceTransferRequest: damlTypes.Choice<HolderService, HolderService_CancelForceTransferRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RequestMint: damlTypes.Choice<HolderService, HolderService_RequestMint, HolderService_RequestMint_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_CancelMintRequest: damlTypes.Choice<HolderService, HolderService_CancelMintRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_AcceptMintOffer: damlTypes.Choice<HolderService, HolderService_AcceptMintOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RejectMintOffer: damlTypes.Choice<HolderService, HolderService_RejectMintOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RequestBurn: damlTypes.Choice<HolderService, HolderService_RequestBurn, HolderService_RequestBurn_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_CancelBurnRequest: damlTypes.Choice<HolderService, HolderService_CancelBurnRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_AcceptBurnOffer: damlTypes.Choice<HolderService, HolderService_AcceptBurnOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RejectBurnOffer: damlTypes.Choice<HolderService, HolderService_RejectBurnOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_OfferTransfer: damlTypes.Choice<HolderService, HolderService_OfferTransfer, HolderService_OfferTransfer_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_CancelTransferOffer: damlTypes.Choice<HolderService, HolderService_CancelTransferOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_AcceptTransferOffer: damlTypes.Choice<HolderService, HolderService_AcceptTransferOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RejectTransferOffer: damlTypes.Choice<HolderService, HolderService_RejectTransferOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RequestTransfer: damlTypes.Choice<HolderService, HolderService_RequestTransfer, HolderService_RequestTransfer_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_CancelTransferRequest: damlTypes.Choice<HolderService, HolderService_CancelTransferRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_AcceptTransferRequest: damlTypes.Choice<HolderService, HolderService_AcceptTransferRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RejectTransferRequest: damlTypes.Choice<HolderService, HolderService_RejectTransferRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.TransferRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_OfferLock: damlTypes.Choice<HolderService, HolderService_OfferLock, HolderService_OfferLock_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_CancelLockOffer: damlTypes.Choice<HolderService, HolderService_CancelLockOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_AcceptLockOffer: damlTypes.Choice<HolderService, HolderService_AcceptLockOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RejectLockOffer: damlTypes.Choice<HolderService, HolderService_RejectLockOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RequestLock: damlTypes.Choice<HolderService, HolderService_RequestLock, HolderService_RequestLock_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_CancelLockRequest: damlTypes.Choice<HolderService, HolderService_CancelLockRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_AcceptLockRequest: damlTypes.Choice<HolderService, HolderService_AcceptLockRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RejectLockRequest: damlTypes.Choice<HolderService, HolderService_RejectLockRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.LockRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_OfferUnlock: damlTypes.Choice<HolderService, HolderService_OfferUnlock, HolderService_OfferUnlock_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_CancelUnlockOffer: damlTypes.Choice<HolderService, HolderService_CancelUnlockOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_AcceptUnlockOffer: damlTypes.Choice<HolderService, HolderService_AcceptUnlockOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RejectUnlockOffer: damlTypes.Choice<HolderService, HolderService_RejectUnlockOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockOffer_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RequestUnlock: damlTypes.Choice<HolderService, HolderService_RequestUnlock, HolderService_RequestUnlock_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_CancelUnlockRequest: damlTypes.Choice<HolderService, HolderService_CancelUnlockRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_AcceptUnlockRequest: damlTypes.Choice<HolderService, HolderService_AcceptUnlockRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RejectUnlockRequest: damlTypes.Choice<HolderService, HolderService_RejectUnlockRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.UnlockRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_CreateAllocation: damlTypes.Choice<HolderService, HolderService_CreateAllocation, pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationInstructionResult, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  HolderService_RejectAllocationRequest: damlTypes.Choice<HolderService, HolderService_RejectAllocationRequest, pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ChoiceExecutionMetadata, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
  Archive: damlTypes.Choice<HolderService, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<HolderService, undefined>>;
}
export declare const HolderService:
  damlTypes.Template<HolderService, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Holder:HolderService'> &
  damlTypes.ToInterface<HolderService, never> &
  HolderServiceInterface;

export declare namespace HolderService {
}


