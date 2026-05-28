// Generated from Utility/Registry/App/V0/Service/Provider.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab from '@daml.js/utility-registry-v0-0.6.0';

import * as Utility_Registry_App_V0_Configuration_Operator from '../../../../../../Utility/Registry/App/V0/Configuration/Operator/module';
import * as Utility_Registry_App_V0_Configuration_Provider from '../../../../../../Utility/Registry/App/V0/Configuration/Provider/module';
import * as Utility_Registry_App_V0_Service_Holder from '../../../../../../Utility/Registry/App/V0/Service/Holder/module';
import * as Utility_Registry_App_V0_Service_Registrar from '../../../../../../Utility/Registry/App/V0/Service/Registrar/module';

export declare type RejectedProviderServiceRequest_Delete_Result = {
};

export declare const RejectedProviderServiceRequest_Delete_Result:
  damlTypes.Serializable<RejectedProviderServiceRequest_Delete_Result> & {
  }
;


export declare type ProviderServiceRequest_Cancel_Result = {
};

export declare const ProviderServiceRequest_Cancel_Result:
  damlTypes.Serializable<ProviderServiceRequest_Cancel_Result> & {
  }
;


export declare type ProviderServiceRequest_Reject_Result = {
  rejectedProviderServiceRequestCid: damlTypes.ContractId<RejectedProviderServiceRequest>;
};

export declare const ProviderServiceRequest_Reject_Result:
  damlTypes.Serializable<ProviderServiceRequest_Reject_Result> & {
  }
;


export declare type ProviderServiceRequest_Accept_Result = {
  providerServiceCid: damlTypes.ContractId<ProviderService>;
  appRewardConfigurationCid: damlTypes.Optional<damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.AppReward.AppRewardConfiguration>>;
};

export declare const ProviderServiceRequest_Accept_Result:
  damlTypes.Serializable<ProviderServiceRequest_Accept_Result> & {
  }
;


export declare type ProviderService_ArchiveAndCreateProviderConfiguration_Result = {
  archiveResult: ProviderService_ArchiveProviderConfiguration_Result;
  createResult: ProviderService_CreateProviderConfiguration_Result;
};

export declare const ProviderService_ArchiveAndCreateProviderConfiguration_Result:
  damlTypes.Serializable<ProviderService_ArchiveAndCreateProviderConfiguration_Result> & {
  }
;


export declare type ProviderService_ArchiveProviderConfiguration_Result = {
};

export declare const ProviderService_ArchiveProviderConfiguration_Result:
  damlTypes.Serializable<ProviderService_ArchiveProviderConfiguration_Result> & {
  }
;


export declare type ProviderService_CreateProviderConfiguration_Result = {
  providerConfigurationCid: damlTypes.ContractId<Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration>;
};

export declare const ProviderService_CreateProviderConfiguration_Result:
  damlTypes.Serializable<ProviderService_CreateProviderConfiguration_Result> & {
  }
;


export declare type ProviderService_Create_Result = {
  providerServiceCid: damlTypes.ContractId<ProviderService>;
};

export declare const ProviderService_Create_Result:
  damlTypes.Serializable<ProviderService_Create_Result> & {
  }
;


export declare type RejectedProviderServiceRequest_Delete = {
};

export declare const RejectedProviderServiceRequest_Delete:
  damlTypes.Serializable<RejectedProviderServiceRequest_Delete> & {
  }
;


export declare type RejectedProviderServiceRequest = {
  request: ProviderServiceRequest;
  reason: string;
};

export declare interface RejectedProviderServiceRequestInterface {
  Archive: damlTypes.Choice<RejectedProviderServiceRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedProviderServiceRequest, undefined>>;
  RejectedProviderServiceRequest_Delete: damlTypes.Choice<RejectedProviderServiceRequest, RejectedProviderServiceRequest_Delete, RejectedProviderServiceRequest_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedProviderServiceRequest, undefined>>;
}
export declare const RejectedProviderServiceRequest:
  damlTypes.Template<RejectedProviderServiceRequest, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Provider:RejectedProviderServiceRequest'> &
  damlTypes.ToInterface<RejectedProviderServiceRequest, never> &
  RejectedProviderServiceRequestInterface;

export declare namespace RejectedProviderServiceRequest {
}



export declare type ProviderServiceRequest_Cancel = {
};

export declare const ProviderServiceRequest_Cancel:
  damlTypes.Serializable<ProviderServiceRequest_Cancel> & {
  }
;


export declare type ProviderServiceRequest_Reject = {
  reason: string;
};

export declare const ProviderServiceRequest_Reject:
  damlTypes.Serializable<ProviderServiceRequest_Reject> & {
  }
;


export declare type ProviderServiceRequest_Accept = {
  operatorConfigurationCid: damlTypes.ContractId<Utility_Registry_App_V0_Configuration_Operator.OperatorConfiguration>;
  credentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
  appRewardConfigurationDetails: damlTypes.Optional<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.AppReward.AppRewardConfigurationDetails>;
};

export declare const ProviderServiceRequest_Accept:
  damlTypes.Serializable<ProviderServiceRequest_Accept> & {
  }
;


export declare type ProviderServiceRequest = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
};

export declare interface ProviderServiceRequestInterface {
  ProviderServiceRequest_Accept: damlTypes.Choice<ProviderServiceRequest, ProviderServiceRequest_Accept, ProviderServiceRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderServiceRequest, undefined>>;
  ProviderServiceRequest_Reject: damlTypes.Choice<ProviderServiceRequest, ProviderServiceRequest_Reject, ProviderServiceRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderServiceRequest, undefined>>;
  ProviderServiceRequest_Cancel: damlTypes.Choice<ProviderServiceRequest, ProviderServiceRequest_Cancel, ProviderServiceRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderServiceRequest, undefined>>;
  Archive: damlTypes.Choice<ProviderServiceRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderServiceRequest, undefined>>;
}
export declare const ProviderServiceRequest:
  damlTypes.Template<ProviderServiceRequest, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Provider:ProviderServiceRequest'> &
  damlTypes.ToInterface<ProviderServiceRequest, never> &
  ProviderServiceRequestInterface;

export declare namespace ProviderServiceRequest {
}



export declare type ProviderService_Terminate_Result = {
};

export declare const ProviderService_Terminate_Result:
  damlTypes.Serializable<ProviderService_Terminate_Result> & {
  }
;


export declare type ProviderService_RejectHolderServiceRequest = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Service_Holder.HolderServiceRequest>;
  payload: Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Reject;
};

export declare const ProviderService_RejectHolderServiceRequest:
  damlTypes.Serializable<ProviderService_RejectHolderServiceRequest> & {
  }
;


export declare type ProviderService_AcceptHolderServiceRequest = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Service_Holder.HolderServiceRequest>;
  payload: Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Accept;
};

export declare const ProviderService_AcceptHolderServiceRequest:
  damlTypes.Serializable<ProviderService_AcceptHolderServiceRequest> & {
  }
;


export declare type ProviderService_RejectRegistrarServiceRequest = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest>;
  payload: Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Reject;
};

export declare const ProviderService_RejectRegistrarServiceRequest:
  damlTypes.Serializable<ProviderService_RejectRegistrarServiceRequest> & {
  }
;


export declare type ProviderService_AcceptRegistrarServiceRequest = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest>;
  payload: Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Accept;
};

export declare const ProviderService_AcceptRegistrarServiceRequest:
  damlTypes.Serializable<ProviderService_AcceptRegistrarServiceRequest> & {
  }
;


export declare type ProviderService_ArchiveAndCreateProviderConfiguration = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration>;
  payload: ProviderService_CreateProviderConfiguration;
};

export declare const ProviderService_ArchiveAndCreateProviderConfiguration:
  damlTypes.Serializable<ProviderService_ArchiveAndCreateProviderConfiguration> & {
  }
;


export declare type ProviderService_ArchiveProviderConfiguration = {
  cid: damlTypes.ContractId<Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration>;
};

export declare const ProviderService_ArchiveProviderConfiguration:
  damlTypes.Serializable<ProviderService_ArchiveProviderConfiguration> & {
  }
;


export declare type ProviderService_CreateProviderConfiguration = {
  registrarRequirements: pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement[];
  holderRequirements: pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement[];
};

export declare const ProviderService_CreateProviderConfiguration:
  damlTypes.Serializable<ProviderService_CreateProviderConfiguration> & {
  }
;


export declare type ProviderService_Terminate = {
};

export declare const ProviderService_Terminate:
  damlTypes.Serializable<ProviderService_Terminate> & {
  }
;


export declare type ProviderService = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
};

export declare interface ProviderServiceInterface {
  ProviderService_Terminate: damlTypes.Choice<ProviderService, ProviderService_Terminate, ProviderService_Terminate_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderService, undefined>>;
  ProviderService_CreateProviderConfiguration: damlTypes.Choice<ProviderService, ProviderService_CreateProviderConfiguration, ProviderService_CreateProviderConfiguration_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderService, undefined>>;
  ProviderService_ArchiveProviderConfiguration: damlTypes.Choice<ProviderService, ProviderService_ArchiveProviderConfiguration, ProviderService_ArchiveProviderConfiguration_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderService, undefined>>;
  ProviderService_ArchiveAndCreateProviderConfiguration: damlTypes.Choice<ProviderService, ProviderService_ArchiveAndCreateProviderConfiguration, ProviderService_ArchiveAndCreateProviderConfiguration_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderService, undefined>>;
  ProviderService_AcceptRegistrarServiceRequest: damlTypes.Choice<ProviderService, ProviderService_AcceptRegistrarServiceRequest, Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderService, undefined>>;
  ProviderService_RejectRegistrarServiceRequest: damlTypes.Choice<ProviderService, ProviderService_RejectRegistrarServiceRequest, Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderService, undefined>>;
  ProviderService_AcceptHolderServiceRequest: damlTypes.Choice<ProviderService, ProviderService_AcceptHolderServiceRequest, Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderService, undefined>>;
  ProviderService_RejectHolderServiceRequest: damlTypes.Choice<ProviderService, ProviderService_RejectHolderServiceRequest, Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderService, undefined>>;
  Archive: damlTypes.Choice<ProviderService, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProviderService, undefined>>;
}
export declare const ProviderService:
  damlTypes.Template<ProviderService, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Provider:ProviderService'> &
  damlTypes.ToInterface<ProviderService, never> &
  ProviderServiceInterface;

export declare namespace ProviderService {
}


