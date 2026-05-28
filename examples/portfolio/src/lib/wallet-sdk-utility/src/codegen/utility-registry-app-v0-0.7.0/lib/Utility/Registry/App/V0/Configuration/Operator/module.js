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


exports.OperatorConfiguration_Modify_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operatorConfigurationCid: damlTypes.ContractId(exports.OperatorConfiguration).decoder, }); }),
  encode: function (__typed__) {
  return {
    operatorConfigurationCid: damlTypes.ContractId(exports.OperatorConfiguration).encode(__typed__.operatorConfigurationCid),
  };
}
,
};



exports.OperatorConfiguration_Get_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operatorConfiguration: exports.OperatorConfiguration.decoder, }); }),
  encode: function (__typed__) {
  return {
    operatorConfiguration: exports.OperatorConfiguration.encode(__typed__.operatorConfiguration),
  };
}
,
};



exports.OperatorConfiguration_Modify = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newProviderRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).decoder, }); }),
  encode: function (__typed__) {
  return {
    newProviderRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).encode(__typed__.newProviderRequirements),
  };
}
,
};



exports.OperatorConfiguration_Get = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.OperatorConfiguration = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Configuration.Operator:OperatorConfiguration',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Configuration.Operator:OperatorConfiguration',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, providerRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    providerRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).encode(__typed__.providerRequirements),
  };
}
,
  OperatorConfiguration_Get: {
    template: function () { return exports.OperatorConfiguration; },
    choiceName: 'OperatorConfiguration_Get',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.OperatorConfiguration_Get.decoder; }),
    argumentEncode: function (__typed__) { return exports.OperatorConfiguration_Get.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.OperatorConfiguration_Get_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.OperatorConfiguration_Get_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.OperatorConfiguration; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  OperatorConfiguration_Modify: {
    template: function () { return exports.OperatorConfiguration; },
    choiceName: 'OperatorConfiguration_Modify',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.OperatorConfiguration_Modify.decoder; }),
    argumentEncode: function (__typed__) { return exports.OperatorConfiguration_Modify.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.OperatorConfiguration_Modify_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.OperatorConfiguration_Modify_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.OperatorConfiguration, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);

