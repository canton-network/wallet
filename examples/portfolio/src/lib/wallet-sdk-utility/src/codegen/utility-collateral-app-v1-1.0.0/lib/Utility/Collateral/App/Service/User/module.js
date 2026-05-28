"use strict";
/* eslint-disable-next-line no-unused-vars */
function __export(m) {
/* eslint-disable-next-line no-prototype-builtins */
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable-next-line no-unused-vars */
var jtv = require('@mojotech/json-type-validation');
/* eslint-disable-next-line no-unused-vars */
var damlTypes = require('@daml/types');

var pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f = require('@daml.js/splice-api-token-metadata-v1-1.0.0');
var pkg77df4e7b980c12de438d7b052141a762215fae790d81f71179c8fb534beb68f7 = require('@daml.js/utility-credential-v0-0.0.3');
var pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d = require('@daml.js/splice-api-token-allocation-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

var Utility_Collateral_App_Model_Collateral = require('../../../../../Utility/Collateral/App/Model/Collateral/module');
var Utility_Collateral_App_Model_Configuration_Operator = require('../../../../../Utility/Collateral/App/Model/Configuration/Operator/module');
var Utility_Collateral_App_Model_State = require('../../../../../Utility/Collateral/App/Model/State/module');
var Utility_Collateral_App_Types = require('../../../../../Utility/Collateral/App/Types/module');


exports.UserService_RequestCollateralAgreement_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({collateralAgreementRequestCid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    collateralAgreementRequestCid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest).encode(__typed__.collateralAgreementRequestCid),
  };
}
,
};



exports.UserServiceRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UserServiceRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.UserServiceRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({userServiceCid: damlTypes.ContractId(exports.UserService).decoder, }); }),
  encode: function (__typed__) {
  return {
    userServiceCid: damlTypes.ContractId(exports.UserService).encode(__typed__.userServiceCid),
  };
}
,
};



exports.UserServiceRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UserServiceRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.UserServiceRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operatorConfigurationCid: damlTypes.ContractId(Utility_Collateral_App_Model_Configuration_Operator.OperatorConfiguration).decoder, credentialCids: damlTypes.List(damlTypes.ContractId(pkg77df4e7b980c12de438d7b052141a762215fae790d81f71179c8fb534beb68f7.Utility.Credential.V0.Credential.Credential)).decoder, }); }),
  encode: function (__typed__) {
  return {
    operatorConfigurationCid: damlTypes.ContractId(Utility_Collateral_App_Model_Configuration_Operator.OperatorConfiguration).encode(__typed__.operatorConfigurationCid),
    credentialCids: damlTypes.List(damlTypes.ContractId(pkg77df4e7b980c12de438d7b052141a762215fae790d81f71179c8fb534beb68f7.Utility.Credential.V0.Credential.Credential)).encode(__typed__.credentialCids),
  };
}
,
};



exports.UserServiceRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-collateral-app-v1:Utility.Collateral.App.Service.User:UserServiceRequest',
  templateIdWithPackageId: '6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0:Utility.Collateral.App.Service.User:UserServiceRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, user: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    user: damlTypes.Party.encode(__typed__.user),
  };
}
,
  UserServiceRequest_Accept: {
    template: function () { return exports.UserServiceRequest; },
    choiceName: 'UserServiceRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserServiceRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserServiceRequest_Accept_Result.encode(__typed__); },
  },
  UserServiceRequest_Reject: {
    template: function () { return exports.UserServiceRequest; },
    choiceName: 'UserServiceRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserServiceRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserServiceRequest_Reject_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.UserServiceRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  UserServiceRequest_Cancel: {
    template: function () { return exports.UserServiceRequest; },
    choiceName: 'UserServiceRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserServiceRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserServiceRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserServiceRequest_Cancel_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.UserServiceRequest, ['6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0', '#utility-collateral-app-v1']);



exports.UserService_Terminate_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UserService_ExecuteTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.InstructedCollateral).decoder, allocations: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).decoder, executeTransferArgs: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).decoder, collateralStateCid: damlTypes.ContractId(Utility_Collateral_App_Model_State.CollateralState).decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.InstructedCollateral).encode(__typed__.cid),
    allocations: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).encode(__typed__.allocations),
    executeTransferArgs: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).encode(__typed__.executeTransferArgs),
    collateralStateCid: damlTypes.ContractId(Utility_Collateral_App_Model_State.CollateralState).encode(__typed__.collateralStateCid),
  };
}
,
};



exports.UserService_CancelInstructedCollateral = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.InstructedCollateral).decoder, allocations: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).decoder, extraArgs: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.InstructedCollateral).encode(__typed__.cid),
    allocations: damlTypes.List(damlTypes.ContractId(pkg93c942ae2b4c2ba674fb152fe38473c507bda4e82b4e4c5da55a552a9d8cce1d.Splice.Api.Token.AllocationV1.Allocation)).encode(__typed__.allocations),
    extraArgs: damlTypes.List(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).encode(__typed__.extraArgs),
  };
}
,
};



exports.UserService_TransferCollateral = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreement).decoder, positions: damlTypes.List(Utility_Collateral_App_Types.InstrumentQuantity).decoder, reference: damlTypes.Text.decoder, createdAt: damlTypes.Time.decoder, allocateBefore: damlTypes.Time.decoder, settleBefore: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreement).encode(__typed__.cid),
    positions: damlTypes.List(Utility_Collateral_App_Types.InstrumentQuantity).encode(__typed__.positions),
    reference: damlTypes.Text.encode(__typed__.reference),
    createdAt: damlTypes.Time.encode(__typed__.createdAt),
    allocateBefore: damlTypes.Time.encode(__typed__.allocateBefore),
    settleBefore: damlTypes.Time.encode(__typed__.settleBefore),
  };
}
,
};



exports.UserService_CancelCollateralAgreementChangeRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest).decoder, payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest).encode(__typed__.cid),
    payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.UserService_RejectCollateralAgreementChangeRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest).decoder, payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest).encode(__typed__.cid),
    payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Reject.encode(__typed__.payload),
  };
}
,
};



exports.UserService_AcceptCollateralAgreementChangeRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest).decoder, payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest).encode(__typed__.cid),
    payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Accept.encode(__typed__.payload),
  };
}
,
};



exports.UserService_ProposeCollateralAgreementChange = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreement).decoder, updatedTerms: Utility_Collateral_App_Types.Terms.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreement).encode(__typed__.cid),
    updatedTerms: Utility_Collateral_App_Types.Terms.encode(__typed__.updatedTerms),
  };
}
,
};



exports.UserService_TerminateCollateralAgreement = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreement).decoder, payload: Utility_Collateral_App_Model_Collateral.CollateralAgreement_Terminate.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreement).encode(__typed__.cid),
    payload: Utility_Collateral_App_Model_Collateral.CollateralAgreement_Terminate.encode(__typed__.payload),
  };
}
,
};



exports.UserService_CancelCollateralAgreementRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest).decoder, payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Cancel.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest).encode(__typed__.cid),
    payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Cancel.encode(__typed__.payload),
  };
}
,
};



exports.UserService_RejectCollateralAgreementRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest).decoder, payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest).encode(__typed__.cid),
    payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Reject.encode(__typed__.payload),
  };
}
,
};



exports.UserService_AcceptCollateralAgreementRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest).decoder, payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest).encode(__typed__.cid),
    payload: Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Accept.encode(__typed__.payload),
  };
}
,
};



exports.UserService_RequestCollateralAgreement = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({counterparty: damlTypes.Party.decoder, id: damlTypes.Text.decoder, requestorIsPartyA: damlTypes.Bool.decoder, terms: Utility_Collateral_App_Types.Terms.decoder, }); }),
  encode: function (__typed__) {
  return {
    counterparty: damlTypes.Party.encode(__typed__.counterparty),
    id: damlTypes.Text.encode(__typed__.id),
    requestorIsPartyA: damlTypes.Bool.encode(__typed__.requestorIsPartyA),
    terms: Utility_Collateral_App_Types.Terms.encode(__typed__.terms),
  };
}
,
};



exports.UserService_Terminate = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.UserService = damlTypes.assembleTemplate(
{
  templateId: '#utility-collateral-app-v1:Utility.Collateral.App.Service.User:UserService',
  templateIdWithPackageId: '6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0:Utility.Collateral.App.Service.User:UserService',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, user: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    user: damlTypes.Party.encode(__typed__.user),
  };
}
,
  UserService_Terminate: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_Terminate',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_Terminate.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_Terminate.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserService_Terminate_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserService_Terminate_Result.encode(__typed__); },
  },
  UserService_RequestCollateralAgreement: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_RequestCollateralAgreement',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_RequestCollateralAgreement.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_RequestCollateralAgreement.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UserService_RequestCollateralAgreement_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.UserService_RequestCollateralAgreement_Result.encode(__typed__); },
  },
  UserService_AcceptCollateralAgreementRequest: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_AcceptCollateralAgreementRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_AcceptCollateralAgreementRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_AcceptCollateralAgreementRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Accept_Result.encode(__typed__); },
  },
  UserService_RejectCollateralAgreementRequest: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_RejectCollateralAgreementRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_RejectCollateralAgreementRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_RejectCollateralAgreementRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Reject_Result.encode(__typed__); },
  },
  UserService_CancelCollateralAgreementRequest: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_CancelCollateralAgreementRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_CancelCollateralAgreementRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_CancelCollateralAgreementRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Collateral_App_Model_Collateral.CollateralAgreementRequest_Cancel_Result.encode(__typed__); },
  },
  UserService_TerminateCollateralAgreement: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_TerminateCollateralAgreement',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_TerminateCollateralAgreement.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_TerminateCollateralAgreement.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Collateral_App_Model_Collateral.CollateralAgreement_Terminate_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Collateral_App_Model_Collateral.CollateralAgreement_Terminate_Result.encode(__typed__); },
  },
  UserService_ProposeCollateralAgreementChange: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_ProposeCollateralAgreementChange',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_ProposeCollateralAgreementChange.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_ProposeCollateralAgreementChange.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Collateral_App_Model_Collateral.CollateralAgreement_ProposeChange_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Collateral_App_Model_Collateral.CollateralAgreement_ProposeChange_Result.encode(__typed__); },
  },
  UserService_AcceptCollateralAgreementChangeRequest: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_AcceptCollateralAgreementChangeRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_AcceptCollateralAgreementChangeRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_AcceptCollateralAgreementChangeRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Accept_Result.encode(__typed__); },
  },
  UserService_RejectCollateralAgreementChangeRequest: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_RejectCollateralAgreementChangeRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_RejectCollateralAgreementChangeRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_RejectCollateralAgreementChangeRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Reject_Result.encode(__typed__); },
  },
  UserService_CancelCollateralAgreementChangeRequest: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_CancelCollateralAgreementChangeRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_CancelCollateralAgreementChangeRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_CancelCollateralAgreementChangeRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Collateral_App_Model_Collateral.CollateralAgreementChangeRequest_Cancel_Result.encode(__typed__); },
  },
  UserService_TransferCollateral: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_TransferCollateral',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_TransferCollateral.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_TransferCollateral.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Collateral_App_Model_Collateral.CollateralAgreement_TransferCollateral_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Collateral_App_Model_Collateral.CollateralAgreement_TransferCollateral_Result.encode(__typed__); },
  },
  UserService_CancelInstructedCollateral: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_CancelInstructedCollateral',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_CancelInstructedCollateral.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_CancelInstructedCollateral.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Collateral_App_Model_Collateral.InstructedCollateral_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Collateral_App_Model_Collateral.InstructedCollateral_Cancel_Result.encode(__typed__); },
  },
  UserService_ExecuteTransfer: {
    template: function () { return exports.UserService; },
    choiceName: 'UserService_ExecuteTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UserService_ExecuteTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.UserService_ExecuteTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Collateral_App_Model_Collateral.InstructedCollateral_ExecuteTransfer_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Collateral_App_Model_Collateral.InstructedCollateral_ExecuteTransfer_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.UserService; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.UserService, ['6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0', '#utility-collateral-app-v1']);

