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

var pkg77df4e7b980c12de438d7b052141a762215fae790d81f71179c8fb534beb68f7 = require('@daml.js/utility-credential-v0-0.0.3');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');


exports.OperatorConfiguration_Get_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operatorConfiguration: exports.OperatorConfiguration.decoder, }); }),
  encode: function (__typed__) {
  return {
    operatorConfiguration: exports.OperatorConfiguration.encode(__typed__.operatorConfiguration),
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
  templateId: '#utility-collateral-app-v1:Utility.Collateral.App.Model.Configuration.Operator:OperatorConfiguration',
  templateIdWithPackageId: '6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0:Utility.Collateral.App.Model.Configuration.Operator:OperatorConfiguration',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, userRequirements: damlTypes.List(pkg77df4e7b980c12de438d7b052141a762215fae790d81f71179c8fb534beb68f7.Utility.Credential.V0.Credential.PartyCredentialRequirement).decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    userRequirements: damlTypes.List(pkg77df4e7b980c12de438d7b052141a762215fae790d81f71179c8fb534beb68f7.Utility.Credential.V0.Credential.PartyCredentialRequirement).encode(__typed__.userRequirements),
  };
}
,
  Archive: {
    template: function () { return exports.OperatorConfiguration; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  OperatorConfiguration_Get: {
    template: function () { return exports.OperatorConfiguration; },
    choiceName: 'OperatorConfiguration_Get',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.OperatorConfiguration_Get.decoder; }),
    argumentEncode: function (__typed__) { return exports.OperatorConfiguration_Get.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.OperatorConfiguration_Get_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.OperatorConfiguration_Get_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.OperatorConfiguration, ['6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0', '#utility-collateral-app-v1']);

