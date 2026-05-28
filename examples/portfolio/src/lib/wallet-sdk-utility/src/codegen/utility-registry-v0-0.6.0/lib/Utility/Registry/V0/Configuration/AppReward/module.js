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

var pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda = require('@daml.js/splice-api-featured-app-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');


exports.AppRewardConfigurationDetails = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, operatorAppRewardBeneficiary: pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    operatorAppRewardBeneficiary: pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary.encode(__typed__.operatorAppRewardBeneficiary),
  };
}
,
};



exports.AppRewardConfiguration_Modify = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({details: exports.AppRewardConfigurationDetails.decoder, }); }),
  encode: function (__typed__) {
  return {
    details: exports.AppRewardConfigurationDetails.encode(__typed__.details),
  };
}
,
};



exports.AppRewardConfiguration = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Configuration.AppReward:AppRewardConfiguration',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Configuration.AppReward:AppRewardConfiguration',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, details: exports.AppRewardConfigurationDetails.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    details: exports.AppRewardConfigurationDetails.encode(__typed__.details),
  };
}
,
  Archive: {
    template: function () { return exports.AppRewardConfiguration; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  AppRewardConfiguration_Modify: {
    template: function () { return exports.AppRewardConfiguration; },
    choiceName: 'AppRewardConfiguration_Modify',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AppRewardConfiguration_Modify.decoder; }),
    argumentEncode: function (__typed__) { return exports.AppRewardConfiguration_Modify.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.AppRewardConfiguration).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.AppRewardConfiguration).encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.AppRewardConfiguration, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);

