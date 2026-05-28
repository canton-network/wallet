// Generated from Utility/Registry/App/V0/Service/Registrar.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 from '@daml.js/utility-registry-holding-v0-0.2.1';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab from '@daml.js/utility-registry-v0-0.6.0';

import * as Utility_Registry_App_V0_Configuration_Provider from '../../../../../../Utility/Registry/App/V0/Configuration/Provider/module';
import * as Utility_Registry_App_V0_Configuration_Registrar from '../../../../../../Utility/Registry/App/V0/Configuration/Registrar/module';
import * as Utility_Registry_App_V0_Service_AllocationFactory from '../../../../../../Utility/Registry/App/V0/Service/AllocationFactory/module';
import * as Utility_Registry_App_V0_Service_Enforcement from '../../../../../../Utility/Registry/App/V0/Service/Enforcement/module';

export declare type RegistrarService_ArchiveTransferRule_Result = {
};

export declare const RegistrarService_ArchiveTransferRule_Result:
  damlTypes.Serializable<RegistrarService_ArchiveTransferRule_Result> & {
  }
;


export declare type RegistrarService_CreateTransferRule_Result = {
  transferRuleCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Rule.Transfer.TransferRule>;
};

export declare const RegistrarService_CreateTransferRule_Result:
  damlTypes.Serializable<RegistrarService_CreateTransferRule_Result> & {
  }
;


export declare type RegistrarService_ArchiveAllocationFactory_Result = {
};

export declare const RegistrarService_ArchiveAllocationFactory_Result:
  damlTypes.Serializable<RegistrarService_ArchiveAllocationFactory_Result> & {
  }
;


export declare type RegistrarService_CreateAllocationFactory_Result = {
  allocationFactoryCid: damlTypes.ContractId<Utility_Registry_App_V0_Service_AllocationFactory.AllocationFactory>;
};

export declare const RegistrarService_CreateAllocationFactory_Result:
  damlTypes.Serializable<RegistrarService_CreateAllocationFactory_Result> & {
  }
;


export declare type RejectedRegistrarServiceRequest_Delete_Result = {
};

export declare const RejectedRegistrarServiceRequest_Delete_Result:
  damlTypes.Serializable<RejectedRegistrarServiceRequest_Delete_Result> & {
  }
;


export declare type RegistrarServiceRequest_Cancel_Result = {
};

export declare const RegistrarServiceRequest_Cancel_Result:
  damlTypes.Serializable<RegistrarServiceRequest_Cancel_Result> & {
  }
;


export declare type RegistrarServiceRequest_Reject_Result = {
  rejectedRegistrarServiceRequestCid: damlTypes.ContractId<RejectedRegistrarServiceRequest>;
};

export declare const RegistrarServiceRequest_Reject_Result:
  damlTypes.Serializable<RegistrarServiceRequest_Reject_Result> & {
  }
;


export declare type RegistrarServiceRequest_Accept_Result = {
  registrarServiceCid: damlTypes.ContractId<RegistrarService>;
  transferRuleCid: damlTypes.Optional<damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Rule.Transfer.TransferRule>>;
  allocationFactoryCid: damlTypes.Optional<damlTypes.ContractId<Utility_Registry_App_V0_Service_AllocationFactory.AllocationFactory>>;
};

export declare const RegistrarServiceRequest_Accept_Result:
  damlTypes.Serializable<RegistrarServiceRequest_Accept_Result> & {
  }
;


export declare type RejectedRegistrarServiceRequest_Delete = {
};

export declare const RejectedRegistrarServiceRequest_Delete:
  damlTypes.Serializable<RejectedRegistrarServiceRequest_Delete> & {
  }
;


export declare type RejectedRegistrarServiceRequest = {
  request: RegistrarServiceRequest;
  reason: string;
};

export declare interface RejectedRegistrarServiceRequestInterface {
  Archive: damlTypes.Choice<RejectedRegistrarServiceRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedRegistrarServiceRequest, undefined>>;
  RejectedRegistrarServiceRequest_Delete: damlTypes.Choice<RejectedRegistrarServiceRequest, RejectedRegistrarServiceRequest_Delete, RejectedRegistrarServiceRequest_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedRegistrarServiceRequest, undefined>>;
}
export declare const RejectedRegistrarServiceRequest:
  damlTypes.Template<RejectedRegistrarServiceRequest, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Registrar:RejectedRegistrarServiceRequest'> &
  damlTypes.ToInterface<RejectedRegistrarServiceRequest, never> &
  RejectedRegistrarServiceRequestInterface;

export declare namespace RejectedRegistrarServiceRequest {
}



export declare type RegistrarServiceRequest_Cancel = {
};

export declare const RegistrarServiceRequest_Cancel:
  damlTypes.Serializable<RegistrarServiceRequest_Cancel> & {
  }
;


export declare type RegistrarServiceRequest_Reject = {
  reason: string;
};

export declare const RegistrarServiceRequest_Reject:
  damlTypes.Serializable<RegistrarServiceRequest_Reject> & {
  }
;


export declare type RegistrarServiceRequest_Accept = {
  providerConfigurationCid: damlTypes.ContractId<Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration>;
  credentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
};

export declare const RegistrarServiceRequest_Accept:
  damlTypes.Serializable<RegistrarServiceRequest_Accept> & {
  }
;


export declare type RegistrarServiceRequest = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  createTransferRule: damlTypes.Optional<boolean>;
  createAllocationFactory: damlTypes.Optional<boolean>;
};

export declare interface RegistrarServiceRequestInterface {
  RegistrarServiceRequest_Accept: damlTypes.Choice<RegistrarServiceRequest, RegistrarServiceRequest_Accept, RegistrarServiceRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarServiceRequest, undefined>>;
  RegistrarServiceRequest_Reject: damlTypes.Choice<RegistrarServiceRequest, RegistrarServiceRequest_Reject, RegistrarServiceRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarServiceRequest, undefined>>;
  RegistrarServiceRequest_Cancel: damlTypes.Choice<RegistrarServiceRequest, RegistrarServiceRequest_Cancel, RegistrarServiceRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarServiceRequest, undefined>>;
  Archive: damlTypes.Choice<RegistrarServiceRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarServiceRequest, undefined>>;
}
export declare const RegistrarServiceRequest:
  damlTypes.Template<RegistrarServiceRequest, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Registrar:RegistrarServiceRequest'> &
  damlTypes.ToInterface<RegistrarServiceRequest, never> &
  RegistrarServiceRequestInterface;

export declare namespace RegistrarServiceRequest {
}



export declare type RegistrarService_OfferBurn_Result = {
  burnOfferCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer>;
};

export declare const RegistrarService_OfferBurn_Result:
  damlTypes.Serializable<RegistrarService_OfferBurn_Result> & {
  }
;


export declare type RegistrarService_OfferMint_Result = {
  mintOfferCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer>;
};

export declare const RegistrarService_OfferMint_Result:
  damlTypes.Serializable<RegistrarService_OfferMint_Result> & {
  }
;


export declare type RegistrarService_ArchiveInstrumentConfiguration_Result = {
};

export declare const RegistrarService_ArchiveInstrumentConfiguration_Result:
  damlTypes.Serializable<RegistrarService_ArchiveInstrumentConfiguration_Result> & {
  }
;


export declare type RegistrarService_ArchiveAndCreateInstrumentConfiguration_Result = {
  archiveResult: RegistrarService_ArchiveInstrumentConfiguration_Result;
  createResult: RegistrarService_CreateInstrumentConfiguration_Result;
};

export declare const RegistrarService_ArchiveAndCreateInstrumentConfiguration_Result:
  damlTypes.Serializable<RegistrarService_ArchiveAndCreateInstrumentConfiguration_Result> & {
  }
;


export declare type RegistrarService_ArchiveAndCreateRegistrarConfiguration_Result = {
  archiveResult: RegistrarService_ArchiveRegistrarConfiguration_Result;
  createResult: RegistrarService_CreateRegistrarConfiguration_Result;
};

export declare const RegistrarService_ArchiveAndCreateRegistrarConfiguration_Result:
  damlTypes.Serializable<RegistrarService_ArchiveAndCreateRegistrarConfiguration_Result> & {
  }
;


export declare type RegistrarService_ArchiveRegistrarConfiguration_Result = {
};

export declare const RegistrarService_ArchiveRegistrarConfiguration_Result:
  damlTypes.Serializable<RegistrarService_ArchiveRegistrarConfiguration_Result> & {
  }
;


export declare type RegistrarService_CreateRegistrarConfiguration_Result = {
  registrarConfigurationCid: damlTypes.ContractId<Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration>;
};

export declare const RegistrarService_CreateRegistrarConfiguration_Result:
  damlTypes.Serializable<RegistrarService_CreateRegistrarConfiguration_Result> & {
  }
;


export declare type RegistrarService_CreateInstrumentConfiguration_Result = {
  instrumentConfigurationCid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.Instrument.InstrumentConfiguration>;
};

export declare const RegistrarService_CreateInstrumentConfiguration_Result:
  damlTypes.Serializable<RegistrarService_CreateInstrumentConfiguration_Result> & {
  }
;


export declare type RegistrarService_Terminate_Result = {
};

export declare const RegistrarService_Terminate_Result:
  damlTypes.Serializable<RegistrarService_Terminate_Result> & {
  }
;


export declare type RegistrarService_ArchiveTransferRule = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Rule.Transfer.TransferRule>;
};

export declare const RegistrarService_ArchiveTransferRule:
  damlTypes.Serializable<RegistrarService_ArchiveTransferRule> & {
  }
;


export declare type RegistrarService_CreateTransferRule = {
};

export declare const RegistrarService_CreateTransferRule:
  damlTypes.Serializable<RegistrarService_CreateTransferRule> & {
  }
;


export declare type RegistrarService_ArchiveAllocationFactory = {
  allocationFactoryCid: damlTypes.ContractId<Utility_Registry_App_V0_Service_AllocationFactory.AllocationFactory>;
};

export declare const RegistrarService_ArchiveAllocationFactory:
  damlTypes.Serializable<RegistrarService_ArchiveAllocationFactory> & {
  }
;


export declare type RegistrarService_CreateAllocationFactory = {
};

export declare const RegistrarService_CreateAllocationFactory:
  damlTypes.Serializable<RegistrarService_CreateAllocationFactory> & {
  }
;


export declare type RegistrarService_DeleteExecutedTransfers = {
  cids: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer>[];
  choiceObservers: damlTypes.Party[];
  actor: damlTypes.Party;
};

export declare const RegistrarService_DeleteExecutedTransfers:
  damlTypes.Serializable<RegistrarService_DeleteExecutedTransfers> & {
  }
;


export declare type RegistrarService_DeleteExecutedTransfer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer_Delete;
};

export declare const RegistrarService_DeleteExecutedTransfer:
  damlTypes.Serializable<RegistrarService_DeleteExecutedTransfer> & {
  }
;


export declare type RegistrarService_DeleteFailedTransfers = {
  cids: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer>[];
  choiceObservers: damlTypes.Party[];
  actor: damlTypes.Party;
};

export declare const RegistrarService_DeleteFailedTransfers:
  damlTypes.Serializable<RegistrarService_DeleteFailedTransfers> & {
  }
;


export declare type RegistrarService_DeleteFailedTransfer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer_Delete;
};

export declare const RegistrarService_DeleteFailedTransfer:
  damlTypes.Serializable<RegistrarService_DeleteFailedTransfer> & {
  }
;


export declare type RegistrarService_DeleteRejectedTransfers = {
  cids: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer>[];
  choiceObservers: damlTypes.Party[];
  actor: damlTypes.Party;
};

export declare const RegistrarService_DeleteRejectedTransfers:
  damlTypes.Serializable<RegistrarService_DeleteRejectedTransfers> & {
  }
;


export declare type RegistrarService_DeleteRejectedTransfer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer_Delete;
};

export declare const RegistrarService_DeleteRejectedTransfer:
  damlTypes.Serializable<RegistrarService_DeleteRejectedTransfer> & {
  }
;


export declare type RegistrarService_DeleteExecutedUnlock = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.ExecutedUnlock>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.ExecutedUnlock_Delete;
};

export declare const RegistrarService_DeleteExecutedUnlock:
  damlTypes.Serializable<RegistrarService_DeleteExecutedUnlock> & {
  }
;


export declare type RegistrarService_DeleteFailedUnlock = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.FailedUnlock>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.FailedUnlock_Delete;
};

export declare const RegistrarService_DeleteFailedUnlock:
  damlTypes.Serializable<RegistrarService_DeleteFailedUnlock> & {
  }
;


export declare type RegistrarService_DeleteRejectedUnlock = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.RejectedUnlock>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.RejectedUnlock_Delete;
};

export declare const RegistrarService_DeleteRejectedUnlock:
  damlTypes.Serializable<RegistrarService_DeleteRejectedUnlock> & {
  }
;


export declare type RegistrarService_DeleteExecutedLock = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.ExecutedLock>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.ExecutedLock_Delete;
};

export declare const RegistrarService_DeleteExecutedLock:
  damlTypes.Serializable<RegistrarService_DeleteExecutedLock> & {
  }
;


export declare type RegistrarService_DeleteFailedLock = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.FailedLock>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.FailedLock_Delete;
};

export declare const RegistrarService_DeleteFailedLock:
  damlTypes.Serializable<RegistrarService_DeleteFailedLock> & {
  }
;


export declare type RegistrarService_DeleteRejectedLock = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.RejectedLock>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.RejectedLock_Delete;
};

export declare const RegistrarService_DeleteRejectedLock:
  damlTypes.Serializable<RegistrarService_DeleteRejectedLock> & {
  }
;


export declare type RegistrarService_DeleteExecutedBurn = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.ExecutedBurn>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.ExecutedBurn_Delete;
};

export declare const RegistrarService_DeleteExecutedBurn:
  damlTypes.Serializable<RegistrarService_DeleteExecutedBurn> & {
  }
;


export declare type RegistrarService_DeleteFailedBurn = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.FailedBurn>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.FailedBurn_Delete;
};

export declare const RegistrarService_DeleteFailedBurn:
  damlTypes.Serializable<RegistrarService_DeleteFailedBurn> & {
  }
;


export declare type RegistrarService_DeleteRejectedBurn = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.RejectedBurn>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.RejectedBurn_Delete;
};

export declare const RegistrarService_DeleteRejectedBurn:
  damlTypes.Serializable<RegistrarService_DeleteRejectedBurn> & {
  }
;


export declare type RegistrarService_DeleteExecutedMint = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.ExecutedMint>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.ExecutedMint_Delete;
};

export declare const RegistrarService_DeleteExecutedMint:
  damlTypes.Serializable<RegistrarService_DeleteExecutedMint> & {
  }
;


export declare type RegistrarService_DeleteFailedMint = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.FailedMint>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.FailedMint_Delete;
};

export declare const RegistrarService_DeleteFailedMint:
  damlTypes.Serializable<RegistrarService_DeleteFailedMint> & {
  }
;


export declare type RegistrarService_DeleteRejectedMint = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.RejectedMint>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.RejectedMint_Delete;
};

export declare const RegistrarService_DeleteRejectedMint:
  damlTypes.Serializable<RegistrarService_DeleteRejectedMint> & {
  }
;


export declare type RegistrarService_FailAcceptedBurn = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Fail;
};

export declare const RegistrarService_FailAcceptedBurn:
  damlTypes.Serializable<RegistrarService_FailAcceptedBurn> & {
  }
;


export declare type RegistrarService_ExecuteAcceptedBurn = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Execute;
};

export declare const RegistrarService_ExecuteAcceptedBurn:
  damlTypes.Serializable<RegistrarService_ExecuteAcceptedBurn> & {
  }
;


export declare type RegistrarService_FailAcceptedMint = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Fail;
};

export declare const RegistrarService_FailAcceptedMint:
  damlTypes.Serializable<RegistrarService_FailAcceptedMint> & {
  }
;


export declare type RegistrarService_ExecuteAcceptedMint = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Execute;
};

export declare const RegistrarService_ExecuteAcceptedMint:
  damlTypes.Serializable<RegistrarService_ExecuteAcceptedMint> & {
  }
;


export declare type RegistrarService_FailAcceptedUnlock = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Fail;
};

export declare const RegistrarService_FailAcceptedUnlock:
  damlTypes.Serializable<RegistrarService_FailAcceptedUnlock> & {
  }
;


export declare type RegistrarService_ExecuteAcceptedUnlock = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Execute;
};

export declare const RegistrarService_ExecuteAcceptedUnlock:
  damlTypes.Serializable<RegistrarService_ExecuteAcceptedUnlock> & {
  }
;


export declare type RegistrarService_FailAcceptedLock = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Fail;
};

export declare const RegistrarService_FailAcceptedLock:
  damlTypes.Serializable<RegistrarService_FailAcceptedLock> & {
  }
;


export declare type RegistrarService_ExecuteAcceptedLock = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Execute;
};

export declare const RegistrarService_ExecuteAcceptedLock:
  damlTypes.Serializable<RegistrarService_ExecuteAcceptedLock> & {
  }
;


export declare type RegistrarService_FailAcceptedTransfer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Fail;
};

export declare const RegistrarService_FailAcceptedTransfer:
  damlTypes.Serializable<RegistrarService_FailAcceptedTransfer> & {
  }
;


export declare type RegistrarService_ExecuteAcceptedTransfer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Execute;
};

export declare const RegistrarService_ExecuteAcceptedTransfer:
  damlTypes.Serializable<RegistrarService_ExecuteAcceptedTransfer> & {
  }
;


export declare type RegistrarService_MergeHolding = {
  cid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
  payload: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Merge;
};

export declare const RegistrarService_MergeHolding:
  damlTypes.Serializable<RegistrarService_MergeHolding> & {
  }
;


export declare type RegistrarService_SplitHolding = {
  cid: damlTypes.ContractId<pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding>;
  payload: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Split;
};

export declare const RegistrarService_SplitHolding:
  damlTypes.Serializable<RegistrarService_SplitHolding> & {
  }
;


export declare type RegistrarService_RejectBurnRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Reject;
};

export declare const RegistrarService_RejectBurnRequest:
  damlTypes.Serializable<RegistrarService_RejectBurnRequest> & {
  }
;


export declare type RegistrarService_AcceptBurnRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Accept;
};

export declare const RegistrarService_AcceptBurnRequest:
  damlTypes.Serializable<RegistrarService_AcceptBurnRequest> & {
  }
;


export declare type RegistrarService_CancelBurnOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Cancel;
};

export declare const RegistrarService_CancelBurnOffer:
  damlTypes.Serializable<RegistrarService_CancelBurnOffer> & {
  }
;


export declare type RegistrarService_OfferBurn = {
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  holder: damlTypes.Party;
  reference: string;
  batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch;
};

export declare const RegistrarService_OfferBurn:
  damlTypes.Serializable<RegistrarService_OfferBurn> & {
  }
;


export declare type RegistrarService_RejectMintRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Reject;
};

export declare const RegistrarService_RejectMintRequest:
  damlTypes.Serializable<RegistrarService_RejectMintRequest> & {
  }
;


export declare type RegistrarService_AcceptMintRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Accept;
};

export declare const RegistrarService_AcceptMintRequest:
  damlTypes.Serializable<RegistrarService_AcceptMintRequest> & {
  }
;


export declare type RegistrarService_CancelMintOffer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Cancel;
};

export declare const RegistrarService_CancelMintOffer:
  damlTypes.Serializable<RegistrarService_CancelMintOffer> & {
  }
;


export declare type RegistrarService_OfferMint = {
  instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier;
  amount: damlTypes.Numeric;
  holder: damlTypes.Party;
  reference: string;
  batch: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Types.Batch;
};

export declare const RegistrarService_OfferMint:
  damlTypes.Serializable<RegistrarService_OfferMint> & {
  }
;


export declare type RegistrarService_ArchiveAndCreateInstrumentConfiguration = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.Instrument.InstrumentConfiguration>;
  payload: RegistrarService_CreateInstrumentConfiguration;
};

export declare const RegistrarService_ArchiveAndCreateInstrumentConfiguration:
  damlTypes.Serializable<RegistrarService_ArchiveAndCreateInstrumentConfiguration> & {
  }
;


export declare type RegistrarService_ArchiveInstrumentConfiguration = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.Instrument.InstrumentConfiguration>;
};

export declare const RegistrarService_ArchiveInstrumentConfiguration:
  damlTypes.Serializable<RegistrarService_ArchiveInstrumentConfiguration> & {
  }
;


export declare type RegistrarService_CreateInstrumentConfiguration = {
  instrumentId: string;
  additionalIdentifiers: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier[];
  issuerRequirements: pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement[];
  holderRequirements: pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement[];
};

export declare const RegistrarService_CreateInstrumentConfiguration:
  damlTypes.Serializable<RegistrarService_CreateInstrumentConfiguration> & {
  }
;


export declare type RegistrarService_ArchiveAndCreateRegistrarConfiguration = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration>;
  payload: RegistrarService_CreateRegistrarConfiguration;
};

export declare const RegistrarService_ArchiveAndCreateRegistrarConfiguration:
  damlTypes.Serializable<RegistrarService_ArchiveAndCreateRegistrarConfiguration> & {
  }
;


export declare type RegistrarService_ArchiveRegistrarConfiguration = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration>;
};

export declare const RegistrarService_ArchiveRegistrarConfiguration:
  damlTypes.Serializable<RegistrarService_ArchiveRegistrarConfiguration> & {
  }
;


export declare type RegistrarService_RejectForceTransferRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Reject;
};

export declare const RegistrarService_RejectForceTransferRequest:
  damlTypes.Serializable<RegistrarService_RejectForceTransferRequest> & {
  }
;


export declare type RegistrarService_FailAcceptedForceTransfer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Fail;
  actor: damlTypes.Party;
};

export declare const RegistrarService_FailAcceptedForceTransfer:
  damlTypes.Serializable<RegistrarService_FailAcceptedForceTransfer> & {
  }
;


export declare type RegistrarService_ExecuteAcceptedForceTransfer = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Execute;
  actor: damlTypes.Party;
};

export declare const RegistrarService_ExecuteAcceptedForceTransfer:
  damlTypes.Serializable<RegistrarService_ExecuteAcceptedForceTransfer> & {
  }
;


export declare type RegistrarService_AcceptForceTransferRequest = {
  senderEnforcementServiceCid: damlTypes.ContractId<Utility_Registry_App_V0_Service_Enforcement.EnforcementService>;
  receiverEnforcementServiceCid: damlTypes.ContractId<Utility_Registry_App_V0_Service_Enforcement.EnforcementService>;
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept;
};

export declare const RegistrarService_AcceptForceTransferRequest:
  damlTypes.Serializable<RegistrarService_AcceptForceTransferRequest> & {
  }
;


export declare type RegistrarService_CreateRegistrarConfiguration = {
  enforcementRequirements: pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement[];
};

export declare const RegistrarService_CreateRegistrarConfiguration:
  damlTypes.Serializable<RegistrarService_CreateRegistrarConfiguration> & {
  }
;


export declare type RegistrarService_TerminateEnforcementService = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Service_Enforcement.EnforcementService>;
  payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementService_Terminate;
};

export declare const RegistrarService_TerminateEnforcementService:
  damlTypes.Serializable<RegistrarService_TerminateEnforcementService> & {
  }
;


export declare type RegistrarService_RejectEnforcementServiceRequest = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest>;
  payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Reject;
};

export declare const RegistrarService_RejectEnforcementServiceRequest:
  damlTypes.Serializable<RegistrarService_RejectEnforcementServiceRequest> & {
  }
;


export declare type RegistrarService_AcceptEnforcementServiceRequest = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest>;
  payload: Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Accept;
};

export declare const RegistrarService_AcceptEnforcementServiceRequest:
  damlTypes.Serializable<RegistrarService_AcceptEnforcementServiceRequest> & {
  }
;


export declare type RegistrarService_Terminate = {
};

export declare const RegistrarService_Terminate:
  damlTypes.Serializable<RegistrarService_Terminate> & {
  }
;


export declare type RegistrarService_Set = {
  enableResultContracts: damlTypes.Optional<boolean>;
};

export declare const RegistrarService_Set:
  damlTypes.Serializable<RegistrarService_Set> & {
  }
;


export declare type RegistrarService = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  enableResultContracts: damlTypes.Optional<boolean>;
};

export declare interface RegistrarServiceInterface {
  RegistrarService_Set: damlTypes.Choice<RegistrarService, RegistrarService_Set, damlTypes.ContractId<RegistrarService>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_Terminate: damlTypes.Choice<RegistrarService, RegistrarService_Terminate, RegistrarService_Terminate_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_AcceptEnforcementServiceRequest: damlTypes.Choice<RegistrarService, RegistrarService_AcceptEnforcementServiceRequest, Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_RejectEnforcementServiceRequest: damlTypes.Choice<RegistrarService, RegistrarService_RejectEnforcementServiceRequest, Utility_Registry_App_V0_Service_Enforcement.EnforcementServiceRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_TerminateEnforcementService: damlTypes.Choice<RegistrarService, RegistrarService_TerminateEnforcementService, Utility_Registry_App_V0_Service_Enforcement.EnforcementService_Terminate_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_CreateRegistrarConfiguration: damlTypes.Choice<RegistrarService, RegistrarService_CreateRegistrarConfiguration, RegistrarService_CreateRegistrarConfiguration_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_AcceptForceTransferRequest: damlTypes.Choice<RegistrarService, RegistrarService_AcceptForceTransferRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ExecuteAcceptedForceTransfer: damlTypes.Choice<RegistrarService, RegistrarService_ExecuteAcceptedForceTransfer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_FailAcceptedForceTransfer: damlTypes.Choice<RegistrarService, RegistrarService_FailAcceptedForceTransfer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.AcceptedForceTransfer_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_RejectForceTransferRequest: damlTypes.Choice<RegistrarService, RegistrarService_RejectForceTransferRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ArchiveRegistrarConfiguration: damlTypes.Choice<RegistrarService, RegistrarService_ArchiveRegistrarConfiguration, RegistrarService_ArchiveRegistrarConfiguration_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ArchiveAndCreateRegistrarConfiguration: damlTypes.Choice<RegistrarService, RegistrarService_ArchiveAndCreateRegistrarConfiguration, RegistrarService_ArchiveAndCreateRegistrarConfiguration_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_CreateInstrumentConfiguration: damlTypes.Choice<RegistrarService, RegistrarService_CreateInstrumentConfiguration, RegistrarService_CreateInstrumentConfiguration_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ArchiveInstrumentConfiguration: damlTypes.Choice<RegistrarService, RegistrarService_ArchiveInstrumentConfiguration, RegistrarService_ArchiveInstrumentConfiguration_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ArchiveAndCreateInstrumentConfiguration: damlTypes.Choice<RegistrarService, RegistrarService_ArchiveAndCreateInstrumentConfiguration, RegistrarService_ArchiveAndCreateInstrumentConfiguration_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_OfferMint: damlTypes.Choice<RegistrarService, RegistrarService_OfferMint, RegistrarService_OfferMint_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_CancelMintOffer: damlTypes.Choice<RegistrarService, RegistrarService_CancelMintOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_AcceptMintRequest: damlTypes.Choice<RegistrarService, RegistrarService_AcceptMintRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_RejectMintRequest: damlTypes.Choice<RegistrarService, RegistrarService_RejectMintRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.MintRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_OfferBurn: damlTypes.Choice<RegistrarService, RegistrarService_OfferBurn, RegistrarService_OfferBurn_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_CancelBurnOffer: damlTypes.Choice<RegistrarService, RegistrarService_CancelBurnOffer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnOffer_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_AcceptBurnRequest: damlTypes.Choice<RegistrarService, RegistrarService_AcceptBurnRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_RejectBurnRequest: damlTypes.Choice<RegistrarService, RegistrarService_RejectBurnRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.BurnRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_SplitHolding: damlTypes.Choice<RegistrarService, RegistrarService_SplitHolding, pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Split_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_MergeHolding: damlTypes.Choice<RegistrarService, RegistrarService_MergeHolding, pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Merge_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ExecuteAcceptedTransfer: damlTypes.Choice<RegistrarService, RegistrarService_ExecuteAcceptedTransfer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_FailAcceptedTransfer: damlTypes.Choice<RegistrarService, RegistrarService_FailAcceptedTransfer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.AcceptedTransfer_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ExecuteAcceptedLock: damlTypes.Choice<RegistrarService, RegistrarService_ExecuteAcceptedLock, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_FailAcceptedLock: damlTypes.Choice<RegistrarService, RegistrarService_FailAcceptedLock, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.AcceptedLock_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ExecuteAcceptedUnlock: damlTypes.Choice<RegistrarService, RegistrarService_ExecuteAcceptedUnlock, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_FailAcceptedUnlock: damlTypes.Choice<RegistrarService, RegistrarService_FailAcceptedUnlock, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.AcceptedUnlock_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ExecuteAcceptedMint: damlTypes.Choice<RegistrarService, RegistrarService_ExecuteAcceptedMint, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_FailAcceptedMint: damlTypes.Choice<RegistrarService, RegistrarService_FailAcceptedMint, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.AcceptedMint_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ExecuteAcceptedBurn: damlTypes.Choice<RegistrarService, RegistrarService_ExecuteAcceptedBurn, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Execute_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_FailAcceptedBurn: damlTypes.Choice<RegistrarService, RegistrarService_FailAcceptedBurn, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.AcceptedBurn_Fail_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteRejectedMint: damlTypes.Choice<RegistrarService, RegistrarService_DeleteRejectedMint, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.RejectedMint_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteFailedMint: damlTypes.Choice<RegistrarService, RegistrarService_DeleteFailedMint, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.FailedMint_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteExecutedMint: damlTypes.Choice<RegistrarService, RegistrarService_DeleteExecutedMint, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Mint.ExecutedMint_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteRejectedBurn: damlTypes.Choice<RegistrarService, RegistrarService_DeleteRejectedBurn, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.RejectedBurn_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteFailedBurn: damlTypes.Choice<RegistrarService, RegistrarService_DeleteFailedBurn, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.FailedBurn_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteExecutedBurn: damlTypes.Choice<RegistrarService, RegistrarService_DeleteExecutedBurn, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Burn.ExecutedBurn_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteRejectedLock: damlTypes.Choice<RegistrarService, RegistrarService_DeleteRejectedLock, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.RejectedLock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteFailedLock: damlTypes.Choice<RegistrarService, RegistrarService_DeleteFailedLock, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.FailedLock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteExecutedLock: damlTypes.Choice<RegistrarService, RegistrarService_DeleteExecutedLock, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Lock.ExecutedLock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteRejectedUnlock: damlTypes.Choice<RegistrarService, RegistrarService_DeleteRejectedUnlock, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.RejectedUnlock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteFailedUnlock: damlTypes.Choice<RegistrarService, RegistrarService_DeleteFailedUnlock, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.FailedUnlock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteExecutedUnlock: damlTypes.Choice<RegistrarService, RegistrarService_DeleteExecutedUnlock, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Unlock.ExecutedUnlock_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteRejectedTransfer: damlTypes.Choice<RegistrarService, RegistrarService_DeleteRejectedTransfer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.RejectedTransfer_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteRejectedTransfers: damlTypes.Choice<RegistrarService, RegistrarService_DeleteRejectedTransfers, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteFailedTransfer: damlTypes.Choice<RegistrarService, RegistrarService_DeleteFailedTransfer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.FailedTransfer_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteFailedTransfers: damlTypes.Choice<RegistrarService, RegistrarService_DeleteFailedTransfers, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteExecutedTransfer: damlTypes.Choice<RegistrarService, RegistrarService_DeleteExecutedTransfer, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.Transfer.ExecutedTransfer_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_DeleteExecutedTransfers: damlTypes.Choice<RegistrarService, RegistrarService_DeleteExecutedTransfers, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_CreateAllocationFactory: damlTypes.Choice<RegistrarService, RegistrarService_CreateAllocationFactory, RegistrarService_CreateAllocationFactory_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ArchiveAllocationFactory: damlTypes.Choice<RegistrarService, RegistrarService_ArchiveAllocationFactory, RegistrarService_ArchiveAllocationFactory_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_CreateTransferRule: damlTypes.Choice<RegistrarService, RegistrarService_CreateTransferRule, RegistrarService_CreateTransferRule_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  RegistrarService_ArchiveTransferRule: damlTypes.Choice<RegistrarService, RegistrarService_ArchiveTransferRule, RegistrarService_ArchiveTransferRule_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
  Archive: damlTypes.Choice<RegistrarService, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RegistrarService, undefined>>;
}
export declare const RegistrarService:
  damlTypes.Template<RegistrarService, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Registrar:RegistrarService'> &
  damlTypes.ToInterface<RegistrarService, never> &
  RegistrarServiceInterface;

export declare namespace RegistrarService {
}


