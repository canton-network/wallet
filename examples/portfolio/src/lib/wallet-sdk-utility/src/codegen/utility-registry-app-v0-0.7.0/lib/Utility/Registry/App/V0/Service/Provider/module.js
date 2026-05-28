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

var Utility_Registry_App_V0_Configuration_Operator = require('../../../../../../Utility/Registry/App/V0/Configuration/Operator/module');
var Utility_Registry_App_V0_Configuration_Provider = require('../../../../../../Utility/Registry/App/V0/Configuration/Provider/module');
var Utility_Registry_App_V0_Service_Holder = require('../../../../../../Utility/Registry/App/V0/Service/Holder/module');
var Utility_Registry_App_V0_Service_Registrar = require('../../../../../../Utility/Registry/App/V0/Service/Registrar/module');


exports.RejectedProviderServiceRequest_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ProviderServiceRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ProviderServiceRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedProviderServiceRequestCid: damlTypes.ContractId(exports.RejectedProviderServiceRequest).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedProviderServiceRequestCid: damlTypes.ContractId(exports.RejectedProviderServiceRequest).encode(__typed__.rejectedProviderServiceRequestCid),
  };
}
,
};



exports.ProviderServiceRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({providerServiceCid: damlTypes.ContractId(exports.ProviderService).decoder, appRewardConfigurationCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.AppReward.AppRewardConfiguration)).decoder), }); }),
  encode: function (__typed__) {
  return {
    providerServiceCid: damlTypes.ContractId(exports.ProviderService).encode(__typed__.providerServiceCid),
    appRewardConfigurationCid: damlTypes.Optional(damlTypes.ContractId(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.AppReward.AppRewardConfiguration)).encode(__typed__.appRewardConfigurationCid),
  };
}
,
};



exports.ProviderService_ArchiveAndCreateProviderConfiguration_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({archiveResult: exports.ProviderService_ArchiveProviderConfiguration_Result.decoder, createResult: exports.ProviderService_CreateProviderConfiguration_Result.decoder, }); }),
  encode: function (__typed__) {
  return {
    archiveResult: exports.ProviderService_ArchiveProviderConfiguration_Result.encode(__typed__.archiveResult),
    createResult: exports.ProviderService_CreateProviderConfiguration_Result.encode(__typed__.createResult),
  };
}
,
};



exports.ProviderService_ArchiveProviderConfiguration_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ProviderService_CreateProviderConfiguration_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({providerConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration).decoder, }); }),
  encode: function (__typed__) {
  return {
    providerConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration).encode(__typed__.providerConfigurationCid),
  };
}
,
};



exports.ProviderService_Create_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({providerServiceCid: damlTypes.ContractId(exports.ProviderService).decoder, }); }),
  encode: function (__typed__) {
  return {
    providerServiceCid: damlTypes.ContractId(exports.ProviderService).encode(__typed__.providerServiceCid),
  };
}
,
};



exports.RejectedProviderServiceRequest_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedProviderServiceRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Provider:RejectedProviderServiceRequest',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Provider:RejectedProviderServiceRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({request: exports.ProviderServiceRequest.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    request: exports.ProviderServiceRequest.encode(__typed__.request),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  Archive: {
    template: function () { return exports.RejectedProviderServiceRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RejectedProviderServiceRequest_Delete: {
    template: function () { return exports.RejectedProviderServiceRequest; },
    choiceName: 'RejectedProviderServiceRequest_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedProviderServiceRequest_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedProviderServiceRequest_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RejectedProviderServiceRequest_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RejectedProviderServiceRequest_Delete_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedProviderServiceRequest, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.ProviderServiceRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ProviderServiceRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.ProviderServiceRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operatorConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Operator.OperatorConfiguration).decoder, credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, appRewardConfigurationDetails: jtv.Decoder.withDefault(null, damlTypes.Optional(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.AppReward.AppRewardConfigurationDetails).decoder), }); }),
  encode: function (__typed__) {
  return {
    operatorConfigurationCid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Operator.OperatorConfiguration).encode(__typed__.operatorConfigurationCid),
    credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.credentialCids),
    appRewardConfigurationDetails: damlTypes.Optional(pkga236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab.Utility.Registry.V0.Configuration.AppReward.AppRewardConfigurationDetails).encode(__typed__.appRewardConfigurationDetails),
  };
}
,
};



exports.ProviderServiceRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Provider:ProviderServiceRequest',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Provider:ProviderServiceRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
  };
}
,
  ProviderServiceRequest_Accept: {
    template: function () { return exports.ProviderServiceRequest; },
    choiceName: 'ProviderServiceRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProviderServiceRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProviderServiceRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ProviderServiceRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ProviderServiceRequest_Accept_Result.encode(__typed__); },
  },
  ProviderServiceRequest_Reject: {
    template: function () { return exports.ProviderServiceRequest; },
    choiceName: 'ProviderServiceRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProviderServiceRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProviderServiceRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ProviderServiceRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ProviderServiceRequest_Reject_Result.encode(__typed__); },
  },
  ProviderServiceRequest_Cancel: {
    template: function () { return exports.ProviderServiceRequest; },
    choiceName: 'ProviderServiceRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProviderServiceRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProviderServiceRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ProviderServiceRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ProviderServiceRequest_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ProviderServiceRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ProviderServiceRequest, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.ProviderService_Terminate_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ProviderService_RejectHolderServiceRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Holder.HolderServiceRequest).decoder, payload: Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Holder.HolderServiceRequest).encode(__typed__.cid),
    payload: Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Reject.encode(__typed__.payload),
  };
}
,
};



exports.ProviderService_AcceptHolderServiceRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Holder.HolderServiceRequest).decoder, payload: Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Holder.HolderServiceRequest).encode(__typed__.cid),
    payload: Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Accept.encode(__typed__.payload),
  };
}
,
};



exports.ProviderService_RejectRegistrarServiceRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest).decoder, payload: Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Reject.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest).encode(__typed__.cid),
    payload: Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Reject.encode(__typed__.payload),
  };
}
,
};



exports.ProviderService_AcceptRegistrarServiceRequest = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest).decoder, payload: Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Accept.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest).encode(__typed__.cid),
    payload: Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Accept.encode(__typed__.payload),
  };
}
,
};



exports.ProviderService_ArchiveAndCreateProviderConfiguration = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration).decoder, payload: exports.ProviderService_CreateProviderConfiguration.decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration).encode(__typed__.cid),
    payload: exports.ProviderService_CreateProviderConfiguration.encode(__typed__.payload),
  };
}
,
};



exports.ProviderService_ArchiveProviderConfiguration = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({cid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration).decoder, }); }),
  encode: function (__typed__) {
  return {
    cid: damlTypes.ContractId(Utility_Registry_App_V0_Configuration_Provider.ProviderConfiguration).encode(__typed__.cid),
  };
}
,
};



exports.ProviderService_CreateProviderConfiguration = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrarRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).decoder, holderRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).decoder, }); }),
  encode: function (__typed__) {
  return {
    registrarRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).encode(__typed__.registrarRequirements),
    holderRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).encode(__typed__.holderRequirements),
  };
}
,
};



exports.ProviderService_Terminate = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ProviderService = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Service.Provider:ProviderService',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Service.Provider:ProviderService',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
  };
}
,
  ProviderService_Terminate: {
    template: function () { return exports.ProviderService; },
    choiceName: 'ProviderService_Terminate',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_Terminate.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProviderService_Terminate.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_Terminate_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ProviderService_Terminate_Result.encode(__typed__); },
  },
  ProviderService_CreateProviderConfiguration: {
    template: function () { return exports.ProviderService; },
    choiceName: 'ProviderService_CreateProviderConfiguration',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_CreateProviderConfiguration.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProviderService_CreateProviderConfiguration.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_CreateProviderConfiguration_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ProviderService_CreateProviderConfiguration_Result.encode(__typed__); },
  },
  ProviderService_ArchiveProviderConfiguration: {
    template: function () { return exports.ProviderService; },
    choiceName: 'ProviderService_ArchiveProviderConfiguration',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_ArchiveProviderConfiguration.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProviderService_ArchiveProviderConfiguration.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_ArchiveProviderConfiguration_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ProviderService_ArchiveProviderConfiguration_Result.encode(__typed__); },
  },
  ProviderService_ArchiveAndCreateProviderConfiguration: {
    template: function () { return exports.ProviderService; },
    choiceName: 'ProviderService_ArchiveAndCreateProviderConfiguration',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_ArchiveAndCreateProviderConfiguration.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProviderService_ArchiveAndCreateProviderConfiguration.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_ArchiveAndCreateProviderConfiguration_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ProviderService_ArchiveAndCreateProviderConfiguration_Result.encode(__typed__); },
  },
  ProviderService_AcceptRegistrarServiceRequest: {
    template: function () { return exports.ProviderService; },
    choiceName: 'ProviderService_AcceptRegistrarServiceRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_AcceptRegistrarServiceRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProviderService_AcceptRegistrarServiceRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Accept_Result.encode(__typed__); },
  },
  ProviderService_RejectRegistrarServiceRequest: {
    template: function () { return exports.ProviderService; },
    choiceName: 'ProviderService_RejectRegistrarServiceRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_RejectRegistrarServiceRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProviderService_RejectRegistrarServiceRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Registry_App_V0_Service_Registrar.RegistrarServiceRequest_Reject_Result.encode(__typed__); },
  },
  ProviderService_AcceptHolderServiceRequest: {
    template: function () { return exports.ProviderService; },
    choiceName: 'ProviderService_AcceptHolderServiceRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_AcceptHolderServiceRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProviderService_AcceptHolderServiceRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Accept_Result.encode(__typed__); },
  },
  ProviderService_RejectHolderServiceRequest: {
    template: function () { return exports.ProviderService; },
    choiceName: 'ProviderService_RejectHolderServiceRequest',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProviderService_RejectHolderServiceRequest.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProviderService_RejectHolderServiceRequest.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return Utility_Registry_App_V0_Service_Holder.HolderServiceRequest_Reject_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ProviderService; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ProviderService, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);

