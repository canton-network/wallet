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
var pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda = require('@daml.js/splice-api-featured-app-v1-1.0.0');
var pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 = require('@daml.js/utility-registry-holding-v0-0.2.1');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');


exports.InstrumentConfiguration_Get_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentConfiguration: exports.InstrumentConfiguration.decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentConfiguration: exports.InstrumentConfiguration.encode(__typed__.instrumentConfiguration),
  };
}
,
};



exports.InstrumentConfiguration_Get = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.InstrumentConfiguration_SetProviderAppRewardBeneficiaries = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({providerAppRewardBeneficiaries: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.List(pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary)).decoder), }); }),
  encode: function (__typed__) {
  return {
    providerAppRewardBeneficiaries: damlTypes.Optional(damlTypes.List(pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary)).encode(__typed__.providerAppRewardBeneficiaries),
  };
}
,
};



exports.InstrumentConfiguration = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Configuration.Instrument:InstrumentConfiguration',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Configuration.Instrument:InstrumentConfiguration',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, defaultIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, additionalIdentifiers: damlTypes.List(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier).decoder, issuerRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).decoder, holderRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).decoder, providerAppRewardBeneficiaries: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.List(pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary)).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    defaultIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.defaultIdentifier),
    additionalIdentifiers: damlTypes.List(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier).encode(__typed__.additionalIdentifiers),
    issuerRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).encode(__typed__.issuerRequirements),
    holderRequirements: damlTypes.List(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.PartyCredentialRequirement).encode(__typed__.holderRequirements),
    providerAppRewardBeneficiaries: damlTypes.Optional(damlTypes.List(pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary)).encode(__typed__.providerAppRewardBeneficiaries),
  };
}
,
  InstrumentConfiguration_SetProviderAppRewardBeneficiaries: {
    template: function () { return exports.InstrumentConfiguration; },
    choiceName: 'InstrumentConfiguration_SetProviderAppRewardBeneficiaries',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.InstrumentConfiguration_SetProviderAppRewardBeneficiaries.decoder; }),
    argumentEncode: function (__typed__) { return exports.InstrumentConfiguration_SetProviderAppRewardBeneficiaries.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.InstrumentConfiguration).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.InstrumentConfiguration).encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.InstrumentConfiguration; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  InstrumentConfiguration_Get: {
    template: function () { return exports.InstrumentConfiguration; },
    choiceName: 'InstrumentConfiguration_Get',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.InstrumentConfiguration_Get.decoder; }),
    argumentEncode: function (__typed__) { return exports.InstrumentConfiguration_Get.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.InstrumentConfiguration_Get_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.InstrumentConfiguration_Get_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.InstrumentConfiguration, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);

