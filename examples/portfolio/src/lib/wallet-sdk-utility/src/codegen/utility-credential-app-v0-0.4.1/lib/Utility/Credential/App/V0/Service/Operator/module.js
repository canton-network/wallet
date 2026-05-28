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

var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

var Utility_Credential_App_V0_Service_User = require('../../../../../../Utility/Credential/App/V0/Service/User/module');


exports.OperatorService_RejectUserServiceRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({userServiceRequestCid: damlTypes.ContractId(Utility_Credential_App_V0_Service_User.UserServiceRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    userServiceRequestCid: damlTypes.ContractId(Utility_Credential_App_V0_Service_User.UserServiceRequest).encode(__typed__.userServiceRequestCid),
  };
}
,
};



exports.OperatorService_AcceptUserServiceRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({userServiceRequestCid: damlTypes.ContractId(Utility_Credential_App_V0_Service_User.UserServiceRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    userServiceRequestCid: damlTypes.ContractId(Utility_Credential_App_V0_Service_User.UserServiceRequest).encode(__typed__.userServiceRequestCid),
  };
}
,
};



exports.OperatorService = damlTypes.assembleTemplate(
{
  templateId: '#utility-credential-app-v0:Utility.Credential.App.V0.Service.Operator:OperatorService',
  templateIdWithPackageId: 'e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b:Utility.Credential.App.V0.Service.Operator:OperatorService',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, dso: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    dso: damlTypes.Party.encode(__typed__.dso),
  };
}
,
  OperatorService_AcceptUserServiceRequest: {
    template: function () { return exports.OperatorService; },
    choiceName: 'OperatorService_AcceptUserServiceRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.OperatorService_AcceptUserServiceRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.OperatorService_AcceptUserServiceRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Service_User.UserServiceRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Service_User.UserServiceRequest_Accept_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.OperatorService; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  OperatorService_RejectUserServiceRequest: {
    template: function () { return exports.OperatorService; },
    choiceName: 'OperatorService_RejectUserServiceRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.OperatorService_RejectUserServiceRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.OperatorService_RejectUserServiceRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Credential_App_V0_Service_User.UserServiceRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Credential_App_V0_Service_User.UserServiceRequest_Reject_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.OperatorService, ['e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b', '#utility-credential-app-v0']);

