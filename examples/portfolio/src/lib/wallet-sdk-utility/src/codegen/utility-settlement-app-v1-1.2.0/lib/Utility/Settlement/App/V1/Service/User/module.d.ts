// Generated from Utility/Settlement/App/V1/Service/User.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 from '@daml.js/utility-credential-v0-0.1.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Settlement_App_V1_Model_Configuration_Operator from '../../../../../../Utility/Settlement/App/V1/Model/Configuration/Operator/module';
import * as Utility_Settlement_App_V1_Model_Dvp from '../../../../../../Utility/Settlement/App/V1/Model/Dvp/module';

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


export declare type UserService_Terminate_Result = {
};

export declare const UserService_Terminate_Result:
  damlTypes.Serializable<UserService_Terminate_Result> & {
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
  operatorConfigurationCid: damlTypes.ContractId<Utility_Settlement_App_V1_Model_Configuration_Operator.OperatorConfiguration>;
  credentialCids: damlTypes.ContractId<pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential>[];
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
  damlTypes.Template<UserServiceRequest, undefined, '#utility-settlement-app-v1:Utility.Settlement.App.V1.Service.User:UserServiceRequest'> &
  damlTypes.ToInterface<UserServiceRequest, never> &
  UserServiceRequestInterface;

export declare namespace UserServiceRequest {
}



export declare type UserService_CreateDvpProposal_Result = {
};

export declare const UserService_CreateDvpProposal_Result:
  damlTypes.Serializable<UserService_CreateDvpProposal_Result> & {
  }
;


export declare type UserService_CancelDvpProposal_Result = {
};

export declare const UserService_CancelDvpProposal_Result:
  damlTypes.Serializable<UserService_CancelDvpProposal_Result> & {
  }
;


export declare type UserService_ProposeDvp_Result = {
  dvpProposalCid: damlTypes.ContractId<Utility_Settlement_App_V1_Model_Dvp.DvpProposal>;
};

export declare const UserService_ProposeDvp_Result:
  damlTypes.Serializable<UserService_ProposeDvp_Result> & {
  }
;


export declare type UserService_RejectDvpProposal = {
  cid: damlTypes.ContractId<Utility_Settlement_App_V1_Model_Dvp.DvpProposal>;
  payload: Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Reject;
};

export declare const UserService_RejectDvpProposal:
  damlTypes.Serializable<UserService_RejectDvpProposal> & {
  }
;


export declare type UserService_CancelDvpProposal = {
  cid: damlTypes.ContractId<Utility_Settlement_App_V1_Model_Dvp.DvpProposal>;
  payload: Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Cancel;
};

export declare const UserService_CancelDvpProposal:
  damlTypes.Serializable<UserService_CancelDvpProposal> & {
  }
;


export declare type UserService_AcceptDvpProposal = {
  cid: damlTypes.ContractId<Utility_Settlement_App_V1_Model_Dvp.DvpProposal>;
  payload: Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Accept;
};

export declare const UserService_AcceptDvpProposal:
  damlTypes.Serializable<UserService_AcceptDvpProposal> & {
  }
;


export declare type UserService_ProposeDvp = {
  proposerIsBuyer: boolean;
  counterparty: damlTypes.Party;
  terms: Utility_Settlement_App_V1_Model_Dvp.Terms;
};

export declare const UserService_ProposeDvp:
  damlTypes.Serializable<UserService_ProposeDvp> & {
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
  UserService_ProposeDvp: damlTypes.Choice<UserService, UserService_ProposeDvp, UserService_ProposeDvp_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_AcceptDvpProposal: damlTypes.Choice<UserService, UserService_AcceptDvpProposal, Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_CancelDvpProposal: damlTypes.Choice<UserService, UserService_CancelDvpProposal, Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Cancel_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  UserService_RejectDvpProposal: damlTypes.Choice<UserService, UserService_RejectDvpProposal, Utility_Settlement_App_V1_Model_Dvp.DvpProposal_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
  Archive: damlTypes.Choice<UserService, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<UserService, undefined>>;
}
export declare const UserService:
  damlTypes.Template<UserService, undefined, '#utility-settlement-app-v1:Utility.Settlement.App.V1.Service.User:UserService'> &
  damlTypes.ToInterface<UserService, never> &
  UserServiceInterface;

export declare namespace UserService {
}


