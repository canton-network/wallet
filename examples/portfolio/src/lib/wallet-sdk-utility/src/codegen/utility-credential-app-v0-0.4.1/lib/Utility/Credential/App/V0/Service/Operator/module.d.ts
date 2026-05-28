// Generated from Utility/Credential/App/V0/Service/Operator.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Credential_App_V0_Service_User from '../../../../../../Utility/Credential/App/V0/Service/User/module';

export declare type OperatorService_RejectUserServiceRequest = {
  userServiceRequestCid: damlTypes.ContractId<Utility_Credential_App_V0_Service_User.UserServiceRequest>;
};

export declare const OperatorService_RejectUserServiceRequest:
  damlTypes.Serializable<OperatorService_RejectUserServiceRequest> & {
  }
;


export declare type OperatorService_AcceptUserServiceRequest = {
  userServiceRequestCid: damlTypes.ContractId<Utility_Credential_App_V0_Service_User.UserServiceRequest>;
};

export declare const OperatorService_AcceptUserServiceRequest:
  damlTypes.Serializable<OperatorService_AcceptUserServiceRequest> & {
  }
;


export declare type OperatorService = {
  operator: damlTypes.Party;
  dso: damlTypes.Party;
};

export declare interface OperatorServiceInterface {
  OperatorService_AcceptUserServiceRequest: damlTypes.Choice<OperatorService, OperatorService_AcceptUserServiceRequest, Utility_Credential_App_V0_Service_User.UserServiceRequest_Accept_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<OperatorService, undefined>>;
  Archive: damlTypes.Choice<OperatorService, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<OperatorService, undefined>>;
  OperatorService_RejectUserServiceRequest: damlTypes.Choice<OperatorService, OperatorService_RejectUserServiceRequest, Utility_Credential_App_V0_Service_User.UserServiceRequest_Reject_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<OperatorService, undefined>>;
}
export declare const OperatorService:
  damlTypes.Template<OperatorService, undefined, '#utility-credential-app-v0:Utility.Credential.App.V0.Service.Operator:OperatorService'> &
  damlTypes.ToInterface<OperatorService, never> &
  OperatorServiceInterface;

export declare namespace OperatorService {
}


