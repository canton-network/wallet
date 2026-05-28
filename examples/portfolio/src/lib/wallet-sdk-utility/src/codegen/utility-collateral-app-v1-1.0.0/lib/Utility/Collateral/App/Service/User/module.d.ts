// Generated from Utility/Collateral/App/Service/User.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg77df4e7b980c12de438d7b052141a762215fae790d81f71179c8fb534beb68f7 from '@daml.js/utility-credential-v0-0.0.3';
import * as pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d from '@daml.js/splice-api-token-allocation-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Collateral_App_Model_Collateral from '../../../../../Utility/Collateral/App/Model/Collateral/module';
import * as Utility_Collateral_App_Model_Configuration_Operator from '../../../../../Utility/Collateral/App/Model/Configuration/Operator/module';
import * as Utility_Collateral_App_Model_State from '../../../../../Utility/Collateral/App/Model/State/module';
import * as Utility_Collateral_App_Types from '../../../../../Utility/Collateral/App/Types/module';

export declare type UserService_RequestCollateralAgreement_Result = {
  collateralAgreementRequestCid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest>;
};

export declare const UserService_RequestCollateralAgreement_Result:
  damlTypes.Serializable<UserService_RequestCollateralAgreement_Result> & {
  }
;


export declare type UserServiceRequest_Cancel_Result = {
};

export declare const UserServiceRequest_Cancel_Result:
  damlTypes.Serializable<UserServiceRequest_Cancel_Result> & {
  }
;


export declare type UserServiceRequest_Reject_Result = {
  reason: string;
};

export declare const UserServiceRequest_Reject_Result:
  damlTypes.Serializable<UserServiceRequest_Reject_Result> & {
  }
;


export declare type UserServiceRequest_Accept_Result = {
  userServiceCid: damlTypes.ContractId<UserService>;
};

export declare const UserServiceRequest_Accept_Result:
  damlTypes.Serializable<UserServiceRequest_Accept_Result> & {
  }
;


export declare type UserServiceRequest_Cancel = {
};

export declare const UserServiceRequest_Cancel:
  damlTypes.Serializable<UserServiceRequest_Cancel> & {
  }
;


export declare type UserServiceRequest_Reject = {
  reason: string;
};

export declare const UserServiceRequest_Reject:
  damlTypes.Serializable<UserServiceRequest_Reject> & {
  }
;


export declare type UserServiceRequest_Accept = {
  operatorConfigurationCid: damlTypes.ContractId<Utility_Collateral_App_Model_Configuration_Operator.OperatorConfiguration>;
  credentialCids: damlTypes.ContractId<pkg77df4e7b980c12de438d7b052141a762215fae790d81f71179c8fb534beb68f7.Utility.Credential.V0.Credential.Credential>[];
};

export declare const UserServiceRequest_Accept:
  damlTypes.Serializable<UserServiceRequest_Accept> & {
  }
;


export declare type UserServiceRequest = {
  operator: damlTypes.Party;
  user: damlTypes.Party;
};

export declare interface UserServiceRequestInterface {
  UserServiceRequest_Accept: damlTypes.Choice<UserServiceRequest, UserServiceRequest_Accept, UserServiceRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserServiceRequest, undefined>>;
  UserServiceRequest_Reject: damlTypes.Choice<UserServiceRequest, UserServiceRequest_Reject, UserServiceRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserServiceRequest, undefined>>;
  Archive: damlTypes.Choice<UserServiceRequest, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserServiceRequest, undefined>>;
  UserServiceRequest_Cancel: damlTypes.Choice<UserServiceRequest, UserServiceRequest_Cancel, UserServiceRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserServiceRequest, undefined>>;
}
export declare const UserServiceRequest:
  damlTypes.Template<UserServiceRequest, undefined, '#utility-collateral-app-v1:Utility.Collateral.App.Service.User:UserServiceRequest'> &
  damlTypes.ToInterface<UserServiceRequest, never> &
  UserServiceRequestInterface;

export declare namespace UserServiceRequest {
}



export declare type UserService_Terminate_Result = {
};

export declare const UserService_Terminate_Result:
  damlTypes.Serializable<UserService_Terminate_Result> & {
  }
;


export declare type UserService_ExecuteTransfer = {
  cid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.InstructedCollateral>;
  allocations: damlTypes.ContractId<pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation>[];
  executeTransferArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs[];
  collateralStateCid: damlTypes.ContractId<Utility_Collateral_App_Model_State.CollateralState>;
};

export declare const UserService_ExecuteTransfer:
  damlTypes.Serializable<UserService_ExecuteTransfer> & {
  }
;


export declare type UserService_CancelInstructedCollateral = {
  cid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.InstructedCollateral>;
  allocations: damlTypes.ContractId<pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation>[];
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs[];
};

export declare const UserService_CancelInstructedCollateral:
  damlTypes.Serializable<UserService_CancelInstructedCollateral> & {
  }
;


export declare type UserService_TransferCollateral = {
  cid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.CollateralAgreement>;
  positions: Utility_Collateral_App_Types.InstrumentQuantity[];
  reference: string;
  createdAt: damlTypes.Time;
  allocateBefore: damlTypes.Time;
  settleBefore: damlTypes.Time;
};

export declare const UserService_TransferCollateral:
  damlTypes.Serializable<UserService_TransferCollateral> & {
  }
;


export declare type UserService_CancelCollateralAgreementChangeRequest = {
  cid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest>;
  payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Cancel;
};

export declare const UserService_CancelCollateralAgreementChangeRequest:
  damlTypes.Serializable<UserService_CancelCollateralAgreementChangeRequest> & {
  }
;


export declare type UserService_RejectCollateralAgreementChangeRequest = {
  cid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest>;
  payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Reject;
};

export declare const UserService_RejectCollateralAgreementChangeRequest:
  damlTypes.Serializable<UserService_RejectCollateralAgreementChangeRequest> & {
  }
;


export declare type UserService_AcceptCollateralAgreementChangeRequest = {
  cid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest>;
  payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Accept;
};

export declare const UserService_AcceptCollateralAgreementChangeRequest:
  damlTypes.Serializable<UserService_AcceptCollateralAgreementChangeRequest> & {
  }
;


export declare type UserService_ProposeCollateralAgreementChange = {
  cid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.CollateralAgreement>;
  updatedTerms: Utility_Collateral_App_Types.Terms;
};

export declare const UserService_ProposeCollateralAgreementChange:
  damlTypes.Serializable<UserService_ProposeCollateralAgreementChange> & {
  }
;


export declare type UserService_TerminateCollateralAgreement = {
  cid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.CollateralAgreement>;
  payload: Utility_Collateral_App_Model_Collateral.CollateralAgreement_Terminate;
};

export declare const UserService_TerminateCollateralAgreement:
  damlTypes.Serializable<UserService_TerminateCollateralAgreement> & {
  }
;


export declare type UserService_CancelCollateralAgreementRequest = {
  cid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest>;
  payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Cancel;
};

export declare const UserService_CancelCollateralAgreementRequest:
  damlTypes.Serializable<UserService_CancelCollateralAgreementRequest> & {
  }
;


export declare type UserService_RejectCollateralAgreementRequest = {
  cid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest>;
  payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Reject;
};

export declare const UserService_RejectCollateralAgreementRequest:
  damlTypes.Serializable<UserService_RejectCollateralAgreementRequest> & {
  }
;


export declare type UserService_AcceptCollateralAgreementRequest = {
  cid: damlTypes.ContractId<Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest>;
  payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Accept;
};

export declare const UserService_AcceptCollateralAgreementRequest:
  damlTypes.Serializable<UserService_AcceptCollateralAgreementRequest> & {
  }
;


export declare type UserService_RequestCollateralAgreement = {
  counterparty: damlTypes.Party;
  id: string;
  requestorIsPartyA: boolean;
  terms: Utility_Collateral_App_Types.Terms;
};

export declare const UserService_RequestCollateralAgreement:
  damlTypes.Serializable<UserService_RequestCollateralAgreement> & {
  }
;


export declare type UserService_Terminate = {
  actor: damlTypes.Party;
};

export declare const UserService_Terminate:
  damlTypes.Serializable<UserService_Terminate> & {
  }
;


export declare type UserService = {
  operator: damlTypes.Party;
  user: damlTypes.Party;
};

export declare interface UserServiceInterface {
  UserService_Terminate: damlTypes.Choice<UserService, UserService_Terminate, UserService_Terminate_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_RequestCollateralAgreement: damlTypes.Choice<UserService, UserService_RequestCollateralAgreement, UserService_RequestCollateralAgreement_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_AcceptCollateralAgreementRequest: damlTypes.Choice<UserService, UserService_AcceptCollateralAgreementRequest, Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_RejectCollateralAgreementRequest: damlTypes.Choice<UserService, UserService_RejectCollateralAgreementRequest, Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_CancelCollateralAgreementRequest: damlTypes.Choice<UserService, UserService_CancelCollateralAgreementRequest, Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_TerminateCollateralAgreement: damlTypes.Choice<UserService, UserService_TerminateCollateralAgreement, Utility_Collateral_App_Model_Collateral.CollateralAgreement_Terminate_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_ProposeCollateralAgreementChange: damlTypes.Choice<UserService, UserService_ProposeCollateralAgreementChange, Utility_Collateral_App_Model_Collateral.CollateralAgreement_ProposeChange_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_AcceptCollateralAgreementChangeRequest: damlTypes.Choice<UserService, UserService_AcceptCollateralAgreementChangeRequest, Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_RejectCollateralAgreementChangeRequest: damlTypes.Choice<UserService, UserService_RejectCollateralAgreementChangeRequest, Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_CancelCollateralAgreementChangeRequest: damlTypes.Choice<UserService, UserService_CancelCollateralAgreementChangeRequest, Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_TransferCollateral: damlTypes.Choice<UserService, UserService_TransferCollateral, Utility_Collateral_App_Model_Collateral.CollateralAgreement_TransferCollateral_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_CancelInstructedCollateral: damlTypes.Choice<UserService, UserService_CancelInstructedCollateral, Utility_Collateral_App_Model_Collateral.InstructedCollateral_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_ExecuteTransfer: damlTypes.Choice<UserService, UserService_ExecuteTransfer, Utility_Collateral_App_Model_Collateral.InstructedCollateral_ExecuteTransfer_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  Archive: damlTypes.Choice<UserService, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
}
export declare const UserService:
  damlTypes.Template<UserService, undefined, '#utility-collateral-app-v1:Utility.Collateral.App.Service.User:UserService'> &
  damlTypes.ToInterface<UserService, never> &
  UserServiceInterface;

export declare namespace UserService {
}


