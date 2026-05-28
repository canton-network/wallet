// Generated from Utility/Registry/App/V0/Service/Enforcement.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab from '@daml.js/utility-registry-v0-0.6.0';

import * as Utility_Registry_App_V0_Configuration_Registrar from '../../../../../../Utility/Registry/App/V0/Configuration/Registrar/module';

export declare type RejectedEnforcementServiceRequest_Delete_Result = {
};

export declare const RejectedEnforcementServiceRequest_Delete_Result:
  damlTypes.Serializable<RejectedEnforcementServiceRequest_Delete_Result> & {
  }
;


export declare type RejectedEnforcementServiceRequest_Delete = {
};

export declare const RejectedEnforcementServiceRequest_Delete:
  damlTypes.Serializable<RejectedEnforcementServiceRequest_Delete> & {
  }
;


export declare type RejectedEnforcementServiceRequest = {
  request: EnforcementServiceRequest;
  reason: string;
};

export declare interface RejectedEnforcementServiceRequestInterface {
  Archive: damlTypes.Choice<RejectedEnforcementServiceRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedEnforcementServiceRequest, undefined>>;
  RejectedEnforcementServiceRequest_Delete: damlTypes.Choice<RejectedEnforcementServiceRequest, RejectedEnforcementServiceRequest_Delete, RejectedEnforcementServiceRequest_Delete_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RejectedEnforcementServiceRequest, undefined>>;
}
export declare const RejectedEnforcementServiceRequest:
  damlTypes.Template<RejectedEnforcementServiceRequest, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Enforcement:RejectedEnforcementServiceRequest'> &
  damlTypes.ToInterface<RejectedEnforcementServiceRequest, never> &
  RejectedEnforcementServiceRequestInterface;

export declare namespace RejectedEnforcementServiceRequest {
}



export declare type EnforcementServiceRequest_Cancel_Result = {
};

export declare const EnforcementServiceRequest_Cancel_Result:
  damlTypes.Serializable<EnforcementServiceRequest_Cancel_Result> & {
  }
;


export declare type EnforcementServiceRequest_Reject_Result = {
  rejectedEnforcementServiceRequestCid: damlTypes.ContractId<RejectedEnforcementServiceRequest>;
};

export declare const EnforcementServiceRequest_Reject_Result:
  damlTypes.Serializable<EnforcementServiceRequest_Reject_Result> & {
  }
;


export declare type EnforcementServiceRequest_Accept_Result = {
  enforcementServiceCid: damlTypes.ContractId<EnforcementService>;
};

export declare const EnforcementServiceRequest_Accept_Result:
  damlTypes.Serializable<EnforcementServiceRequest_Accept_Result> & {
  }
;


export declare type EnforcementServiceRequest_Cancel = {
};

export declare const EnforcementServiceRequest_Cancel:
  damlTypes.Serializable<EnforcementServiceRequest_Cancel> & {
  }
;


export declare type EnforcementServiceRequest_Reject = {
  reason: string;
};

export declare const EnforcementServiceRequest_Reject:
  damlTypes.Serializable<EnforcementServiceRequest_Reject> & {
  }
;


export declare type EnforcementServiceRequest_Accept = {
  registrarConfigurationCid: damlTypes.ContractId<Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration>;
  credentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
};

export declare const EnforcementServiceRequest_Accept:
  damlTypes.Serializable<EnforcementServiceRequest_Accept> & {
  }
;


export declare type EnforcementServiceRequest = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  holder: damlTypes.Party;
};

export declare interface EnforcementServiceRequestInterface {
  EnforcementServiceRequest_Accept: damlTypes.Choice<EnforcementServiceRequest, EnforcementServiceRequest_Accept, EnforcementServiceRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<EnforcementServiceRequest, undefined>>;
  EnforcementServiceRequest_Reject: damlTypes.Choice<EnforcementServiceRequest, EnforcementServiceRequest_Reject, EnforcementServiceRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<EnforcementServiceRequest, undefined>>;
  EnforcementServiceRequest_Cancel: damlTypes.Choice<EnforcementServiceRequest, EnforcementServiceRequest_Cancel, EnforcementServiceRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<EnforcementServiceRequest, undefined>>;
  Archive: damlTypes.Choice<EnforcementServiceRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<EnforcementServiceRequest, undefined>>;
}
export declare const EnforcementServiceRequest:
  damlTypes.Template<EnforcementServiceRequest, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Enforcement:EnforcementServiceRequest'> &
  damlTypes.ToInterface<EnforcementServiceRequest, never> &
  EnforcementServiceRequestInterface;

export declare namespace EnforcementServiceRequest {
}



export declare type EnforcementService_Terminate_Result = {
};

export declare const EnforcementService_Terminate_Result:
  damlTypes.Serializable<EnforcementService_Terminate_Result> & {
  }
;


export declare type EnforcementService_AcceptForceTransferRequestWithSenderAuthorization = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept;
  sender: damlTypes.Party;
};

export declare const EnforcementService_AcceptForceTransferRequestWithSenderAuthorization:
  damlTypes.Serializable<EnforcementService_AcceptForceTransferRequestWithSenderAuthorization> & {
  }
;


export declare type EnforcementService_AcceptForceTransferRequest = {
  cid: damlTypes.ContractId<pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest>;
  payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept;
  receiverEnforcementServiceCid: damlTypes.ContractId<EnforcementService>;
};

export declare const EnforcementService_AcceptForceTransferRequest:
  damlTypes.Serializable<EnforcementService_AcceptForceTransferRequest> & {
  }
;


export declare type EnforcementService_Terminate = {
};

export declare const EnforcementService_Terminate:
  damlTypes.Serializable<EnforcementService_Terminate> & {
  }
;


export declare type EnforcementService = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  holder: damlTypes.Party;
};

export declare interface EnforcementServiceInterface {
  EnforcementService_Terminate: damlTypes.Choice<EnforcementService, EnforcementService_Terminate, EnforcementService_Terminate_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<EnforcementService, undefined>>;
  EnforcementService_AcceptForceTransferRequest: damlTypes.Choice<EnforcementService, EnforcementService_AcceptForceTransferRequest, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<EnforcementService, undefined>>;
  EnforcementService_AcceptForceTransferRequestWithSenderAuthorization: damlTypes.Choice<EnforcementService, EnforcementService_AcceptForceTransferRequestWithSenderAuthorization, pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<EnforcementService, undefined>>;
  Archive: damlTypes.Choice<EnforcementService, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<EnforcementService, undefined>>;
}
export declare const EnforcementService:
  damlTypes.Template<EnforcementService, undefined, '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Enforcement:EnforcementService'> &
  damlTypes.ToInterface<EnforcementService, never> &
  EnforcementServiceInterface;

export declare namespace EnforcementService {
}


