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
var pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 = require('@daml.js/splice-amulet-0.1.16');

var Utility_Commercials_V0_Model_CommercialAgreement = require('../../../../../Utility/Commercials/V0/Model/CommercialAgreement/module');
var Utility_Commercials_V0_Model_Types = require('../../../../../Utility/Commercials/V0/Model/Types/module');


exports.CommercialAgreementOffer_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.CommercialAgreementOffer_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CommercialAgreementOffer_AcceptAndTopup_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({commercialAgreementCid: damlTypes.ContractId(Utility_Commercials_V0_Model_CommercialAgreement.CommercialAgreement).decoder, }); }),
  encode: function (__typed__) {
  return {
    commercialAgreementCid: damlTypes.ContractId(Utility_Commercials_V0_Model_CommercialAgreement.CommercialAgreement).encode(__typed__.commercialAgreementCid),
  };
}
,
};



exports.CommercialAgreementOffer_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({commercialAgreementCid: damlTypes.ContractId(Utility_Commercials_V0_Model_CommercialAgreement.CommercialAgreement).decoder, }); }),
  encode: function (__typed__) {
  return {
    commercialAgreementCid: damlTypes.ContractId(Utility_Commercials_V0_Model_CommercialAgreement.CommercialAgreement).encode(__typed__.commercialAgreementCid),
  };
}
,
};



exports.CommercialAgreementOffer_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.CommercialAgreementOffer_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.CommercialAgreementOffer_AcceptAndTopup = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holderInputs: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).decoder, appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.decoder, dataPublishingConsent: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    holderInputs: damlTypes.List(damlTypes.ContractId(pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Amulet.Amulet)).encode(__typed__.holderInputs),
    appTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext.encode(__typed__.appTransferContext),
    dataPublishingConsent: damlTypes.Optional(damlTypes.Bool).encode(__typed__.dataPublishingConsent),
  };
}
,
};



exports.CommercialAgreementOffer_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dataPublishingConsent: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    dataPublishingConsent: damlTypes.Optional(damlTypes.Bool).encode(__typed__.dataPublishingConsent),
  };
}
,
};



exports.CommercialAgreementOffer = damlTypes.assembleTemplate(
{
  templateId: '#utility-commercials-v0:Utility.Commercials.V0.Model.Offer:CommercialAgreementOffer',
  templateIdWithPackageId: 'fa5b1cc5c8368dff7c2e6a74aa2af9d520d755e2a508f44acd17343326e41839:Utility.Commercials.V0.Model.Offer:CommercialAgreementOffer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, user: damlTypes.Party.decoder, feeReceiver: damlTypes.Party.decoder, utilityFees: Utility_Commercials_V0_Model_Types.UtilityFees.decoder, dso: damlTypes.Party.decoder, initialDepositAmountCc: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), rewardReceiver: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    user: damlTypes.Party.encode(__typed__.user),
    feeReceiver: damlTypes.Party.encode(__typed__.feeReceiver),
    utilityFees: Utility_Commercials_V0_Model_Types.UtilityFees.encode(__typed__.utilityFees),
    dso: damlTypes.Party.encode(__typed__.dso),
    initialDepositAmountCc: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.initialDepositAmountCc),
    rewardReceiver: damlTypes.Optional(damlTypes.Party).encode(__typed__.rewardReceiver),
  };
}
,
  CommercialAgreementOffer_Accept: {
    template: function () { return exports.CommercialAgreementOffer; },
    choiceName: 'CommercialAgreementOffer_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreementOffer_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreementOffer_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreementOffer_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreementOffer_Accept_Result.encode(__typed__); },
  },
  CommercialAgreementOffer_AcceptAndTopup: {
    template: function () { return exports.CommercialAgreementOffer; },
    choiceName: 'CommercialAgreementOffer_AcceptAndTopup',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreementOffer_AcceptAndTopup.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreementOffer_AcceptAndTopup.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreementOffer_AcceptAndTopup_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreementOffer_AcceptAndTopup_Result.encode(__typed__); },
  },
  CommercialAgreementOffer_Cancel: {
    template: function () { return exports.CommercialAgreementOffer; },
    choiceName: 'CommercialAgreementOffer_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreementOffer_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreementOffer_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreementOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreementOffer_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.CommercialAgreementOffer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  CommercialAgreementOffer_Reject: {
    template: function () { return exports.CommercialAgreementOffer; },
    choiceName: 'CommercialAgreementOffer_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreementOffer_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.CommercialAgreementOffer_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CommercialAgreementOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CommercialAgreementOffer_Reject_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.CommercialAgreementOffer, ['fa5b1cc5c8368dff7c2e6a74aa2af9d520d755e2a508f44acd17343326e41839', '#utility-commercials-v0']);

