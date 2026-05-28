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

var pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 = require('@daml.js/utility-credential-v0-0.1.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab = require('@daml.js/utility-registry-v0-0.6.0');

var Utility_Registry_App_V0_Configuration_Registrar = require('../../../../../../Utility/Registry/App/V0/Configuration/Registrar/module');


exports.RejectedEnforcementServiceRequest_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedEnforcementServiceRequest_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedEnforcementServiceRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Enforcement:RejectedEnforcementServiceRequest',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Enforcement:RejectedEnforcementServiceRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({request: exports.EnforcementServiceRequest.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    request: exports.EnforcementServiceRequest.encode(__typed__.request),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  Archive: {
    template: function () { return exports.RejectedEnforcementServiceRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RejectedEnforcementServiceRequest_Delete: {
    template: function () { return exports.RejectedEnforcementServiceRequest; },
    choiceName: 'RejectedEnforcementServiceRequest_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedEnforcementServiceRequest_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedEnforcementServiceRequest_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RejectedEnforcementServiceRequest_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RejectedEnforcementServiceRequest_Delete_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedEnforcementServiceRequest, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.EnforcementServiceRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.EnforcementServiceRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedEnforcementServiceRequestCid: damlTypes.ContractId(exports.RejectedEnforcementServiceRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedEnforcementServiceRequestCid: damlTypes.ContractId(exports.RejectedEnforcementServiceRequest).encode(__typed__.rejectedEnforcementServiceRequestCid),
  };
}
,
};



exports.EnforcementServiceRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({enforcementServiceCid: damlTypes.ContractId(exports.EnforcementService).decoder, }); }),
  encode: function (__typed__) {
  return {
    enforcementServiceCid: damlTypes.ContractId(exports.EnforcementService).encode(__typed__.enforcementServiceCid),
  };
}
,
};



exports.EnforcementServiceRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.EnforcementServiceRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.EnforcementServiceRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrarConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration).decoder, credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, }); }),
  encode: function (__typed__) {
  return {
    registrarConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Registrar.RegistrarConfiguration).encode(__typed__.registrarConfigurationCid),
    credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.credentialCids),
  };
}
,
};



exports.EnforcementServiceRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Enforcement:EnforcementServiceRequest',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Enforcement:EnforcementServiceRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    holder: damlTypes.Party.encode(__typed__.holder),
  };
}
,
  EnforcementServiceRequest_Accept: {
    template: function () { return exports.EnforcementServiceRequest; },
    choiceName: 'EnforcementServiceRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.EnforcementServiceRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.EnforcementServiceRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.EnforcementServiceRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.EnforcementServiceRequest_Accept_Result.encode(__typed__); },
  },
  EnforcementServiceRequest_Reject: {
    template: function () { return exports.EnforcementServiceRequest; },
    choiceName: 'EnforcementServiceRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.EnforcementServiceRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.EnforcementServiceRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.EnforcementServiceRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.EnforcementServiceRequest_Reject_Result.encode(__typed__); },
  },
  EnforcementServiceRequest_Cancel: {
    template: function () { return exports.EnforcementServiceRequest; },
    choiceName: 'EnforcementServiceRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.EnforcementServiceRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.EnforcementServiceRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.EnforcementServiceRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.EnforcementServiceRequest_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.EnforcementServiceRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.EnforcementServiceRequest, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.EnforcementService_Terminate_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.EnforcementService_AcceptForceTransferRequestWithSenderAuthorization = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept.decoder, sender: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept.encode(__typed__.payload),
    sender: damlTypes.Party.encode(__typed__.sender),
  };
}
,
};



exports.EnforcementService_AcceptForceTransferRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).decoder, payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept.decoder, receiverEnforcementServiceCid: damlTypes.ContractId(exports.EnforcementService).decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest).encode(__typed__.cid),
    payload: pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept.encode(__typed__.payload),
    receiverEnforcementServiceCid: damlTypes.ContractId(exports.EnforcementService).encode(__typed__.receiverEnforcementServiceCid),
  };
}
,
};



exports.EnforcementService_Terminate = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.EnforcementService = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Enforcement:EnforcementService',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Enforcement:EnforcementService',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    holder: damlTypes.Party.encode(__typed__.holder),
  };
}
,
  EnforcementService_Terminate: {
    template: function () { return exports.EnforcementService; },
    choiceName: 'EnforcementService_Terminate',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.EnforcementService_Terminate.decoder; }),
    argumentEncode: function (__typed__) { return exports.EnforcementService_Terminate.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.EnforcementService_Terminate_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.EnforcementService_Terminate_Result.encode(__typed__); },
  },
  EnforcementService_AcceptForceTransferRequest: {
    template: function () { return exports.EnforcementService; },
    choiceName: 'EnforcementService_AcceptForceTransferRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.EnforcementService_AcceptForceTransferRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.EnforcementService_AcceptForceTransferRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept_Result.encode(__typed__); },
  },
  EnforcementService_AcceptForceTransferRequestWithSenderAuthorization: {
    template: function () { return exports.EnforcementService; },
    choiceName: 'EnforcementService_AcceptForceTransferRequestWithSenderAuthorization',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.EnforcementService_AcceptForceTransferRequestWithSenderAuthorization.decoder; }),
    argumentEncode: function (__typed__) { return exports.EnforcementService_AcceptForceTransferRequestWithSenderAuthorization.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Holding.ForceTransfer.ForceTransferRequest_Accept_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.EnforcementService; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.EnforcementService, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);

