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

var Splice_Round = require('../../Splice/Round/module');
var Splice_Types = require('../../Splice/Types/module');


exports.ValidatorLivenessActivityRecord_DsoExpire = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).encode(__typed__.closedRoundCid),
  };
}
,
};



exports.ValidatorLivenessActivityRecord = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.ValidatorLicense:ValidatorLivenessActivityRecord',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.ValidatorLicense:ValidatorLivenessActivityRecord',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, validator: damlTypes.Party.decoder, round: Splice_Types.Round.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    validator: damlTypes.Party.encode(__typed__.validator),
    round: Splice_Types.Round.encode(__typed__.round),
  };
}
,
  Archive: {
    template: function () { return exports.ValidatorLivenessActivityRecord; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  ValidatorLivenessActivityRecord_DsoExpire: {
    template: function () { return exports.ValidatorLivenessActivityRecord; },
    choiceName: 'ValidatorLivenessActivityRecord_DsoExpire',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLivenessActivityRecord_DsoExpire.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorLivenessActivityRecord_DsoExpire.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLivenessActivityRecord_DsoExpireResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorLivenessActivityRecord_DsoExpireResult.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ValidatorLivenessActivityRecord, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.ValidatorFaucetCoupon_DsoExpire = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).encode(__typed__.closedRoundCid),
  };
}
,
};



exports.ValidatorFaucetCoupon = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.ValidatorLicense:ValidatorFaucetCoupon',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.ValidatorLicense:ValidatorFaucetCoupon',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, validator: damlTypes.Party.decoder, round: Splice_Types.Round.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    validator: damlTypes.Party.encode(__typed__.validator),
    round: Splice_Types.Round.encode(__typed__.round),
  };
}
,
  ValidatorFaucetCoupon_DsoExpire: {
    template: function () { return exports.ValidatorFaucetCoupon; },
    choiceName: 'ValidatorFaucetCoupon_DsoExpire',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorFaucetCoupon_DsoExpire.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorFaucetCoupon_DsoExpire.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorFaucetCoupon_DsoExpireResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorFaucetCoupon_DsoExpireResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ValidatorFaucetCoupon; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ValidatorFaucetCoupon, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.ValidatorLicense_ReportActive = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ValidatorLicense_UpdateMetadata = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({version: damlTypes.Text.decoder, contactPoint: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    version: damlTypes.Text.encode(__typed__.version),
    contactPoint: damlTypes.Text.encode(__typed__.contactPoint),
  };
}
,
};



exports.ValidatorLicense_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.ValidatorLicense_Withdraw = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.ValidatorLicense_RecordValidatorLivenessActivity = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({openRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    openRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.openRoundCid),
  };
}
,
};



exports.ValidatorLicense_ReceiveFaucetCoupon = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({openRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    openRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.openRoundCid),
  };
}
,
};



exports.ValidatorLicense = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.ValidatorLicense:ValidatorLicense',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.ValidatorLicense:ValidatorLicense',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({validator: damlTypes.Party.decoder, sponsor: damlTypes.Party.decoder, dso: damlTypes.Party.decoder, faucetState: jtv.Decoder.withDefault(null, damlTypes.Optional(exports.FaucetState).decoder), metadata: jtv.Decoder.withDefault(null, damlTypes.Optional(exports.ValidatorLicenseMetadata).decoder), lastActiveAt: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder), }); }),
  encode: function (__typed__) {
  return {
    validator: damlTypes.Party.encode(__typed__.validator),
    sponsor: damlTypes.Party.encode(__typed__.sponsor),
    dso: damlTypes.Party.encode(__typed__.dso),
    faucetState: damlTypes.Optional(exports.FaucetState).encode(__typed__.faucetState),
    metadata: damlTypes.Optional(exports.ValidatorLicenseMetadata).encode(__typed__.metadata),
    lastActiveAt: damlTypes.Optional(damlTypes.Time).encode(__typed__.lastActiveAt),
  };
}
,
  ValidatorLicense_ReceiveFaucetCoupon: {
    template: function () { return exports.ValidatorLicense; },
    choiceName: 'ValidatorLicense_ReceiveFaucetCoupon',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_ReceiveFaucetCoupon.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorLicense_ReceiveFaucetCoupon.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_ReceiveFaucetCouponResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorLicense_ReceiveFaucetCouponResult.encode(__typed__); },
  },
  ValidatorLicense_RecordValidatorLivenessActivity: {
    template: function () { return exports.ValidatorLicense; },
    choiceName: 'ValidatorLicense_RecordValidatorLivenessActivity',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_RecordValidatorLivenessActivity.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorLicense_RecordValidatorLivenessActivity.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_RecordValidatorLivenessActivityResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorLicense_RecordValidatorLivenessActivityResult.encode(__typed__); },
  },
  ValidatorLicense_Withdraw: {
    template: function () { return exports.ValidatorLicense; },
    choiceName: 'ValidatorLicense_Withdraw',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_Withdraw.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorLicense_Withdraw.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_WithdrawResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorLicense_WithdrawResult.encode(__typed__); },
  },
  ValidatorLicense_Cancel: {
    template: function () { return exports.ValidatorLicense; },
    choiceName: 'ValidatorLicense_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorLicense_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_CancelResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorLicense_CancelResult.encode(__typed__); },
  },
  ValidatorLicense_UpdateMetadata: {
    template: function () { return exports.ValidatorLicense; },
    choiceName: 'ValidatorLicense_UpdateMetadata',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_UpdateMetadata.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorLicense_UpdateMetadata.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_UpdateMetadataResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorLicense_UpdateMetadataResult.encode(__typed__); },
  },
  ValidatorLicense_ReportActive: {
    template: function () { return exports.ValidatorLicense; },
    choiceName: 'ValidatorLicense_ReportActive',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_ReportActive.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorLicense_ReportActive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorLicense_ReportActiveResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorLicense_ReportActiveResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ValidatorLicense; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ValidatorLicense, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.ValidatorLicenseMetadata = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({lastUpdatedAt: damlTypes.Time.decoder, version: damlTypes.Text.decoder, contactPoint: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    lastUpdatedAt: damlTypes.Time.encode(__typed__.lastUpdatedAt),
    version: damlTypes.Text.encode(__typed__.version),
    contactPoint: damlTypes.Text.encode(__typed__.contactPoint),
  };
}
,
};



exports.ValidatorLivenessActivityRecord_DsoExpireResult = {
  ValidatorLivenessActivityRecord_DsoExpireResult: 'ValidatorLivenessActivityRecord_DsoExpireResult',
  keys: ['ValidatorLivenessActivityRecord_DsoExpireResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.ValidatorLivenessActivityRecord_DsoExpireResult.ValidatorLivenessActivityRecord_DsoExpireResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.ValidatorFaucetCoupon_DsoExpireResult = {
  ValidatorFaucetCoupon_DsoExpireResult: 'ValidatorFaucetCoupon_DsoExpireResult',
  keys: ['ValidatorFaucetCoupon_DsoExpireResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.ValidatorFaucetCoupon_DsoExpireResult.ValidatorFaucetCoupon_DsoExpireResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.ValidatorLicense_ReportActiveResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({licenseCid: damlTypes.ContractId(exports.ValidatorLicense).decoder, }); }),
  encode: function (__typed__) {
  return {
    licenseCid: damlTypes.ContractId(exports.ValidatorLicense).encode(__typed__.licenseCid),
  };
}
,
};



exports.ValidatorLicense_UpdateMetadataResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({licenseCid: damlTypes.ContractId(exports.ValidatorLicense).decoder, }); }),
  encode: function (__typed__) {
  return {
    licenseCid: damlTypes.ContractId(exports.ValidatorLicense).encode(__typed__.licenseCid),
  };
}
,
};



exports.ValidatorLicense_CancelResult = {
  ValidatorLicense_CancelResult: 'ValidatorLicense_CancelResult',
  keys: ['ValidatorLicense_CancelResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.ValidatorLicense_CancelResult.ValidatorLicense_CancelResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.ValidatorLicense_WithdrawResult = {
  ValidatorLicense_WithdrawResult: 'ValidatorLicense_WithdrawResult',
  keys: ['ValidatorLicense_WithdrawResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.ValidatorLicense_WithdrawResult.ValidatorLicense_WithdrawResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.ValidatorLicense_RecordValidatorLivenessActivityResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({licenseCid: damlTypes.ContractId(exports.ValidatorLicense).decoder, couponCid: damlTypes.ContractId(exports.ValidatorLivenessActivityRecord).decoder, }); }),
  encode: function (__typed__) {
  return {
    licenseCid: damlTypes.ContractId(exports.ValidatorLicense).encode(__typed__.licenseCid),
    couponCid: damlTypes.ContractId(exports.ValidatorLivenessActivityRecord).encode(__typed__.couponCid),
  };
}
,
};



exports.ValidatorLicense_ReceiveFaucetCouponResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({licenseCid: damlTypes.ContractId(exports.ValidatorLicense).decoder, couponCid: damlTypes.ContractId(exports.ValidatorFaucetCoupon).decoder, }); }),
  encode: function (__typed__) {
  return {
    licenseCid: damlTypes.ContractId(exports.ValidatorLicense).encode(__typed__.licenseCid),
    couponCid: damlTypes.ContractId(exports.ValidatorFaucetCoupon).encode(__typed__.couponCid),
  };
}
,
};



exports.FaucetState = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({firstReceivedFor: Splice_Types.Round.decoder, lastReceivedFor: Splice_Types.Round.decoder, numCouponsMissed: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    firstReceivedFor: Splice_Types.Round.encode(__typed__.firstReceivedFor),
    lastReceivedFor: Splice_Types.Round.encode(__typed__.lastReceivedFor),
    numCouponsMissed: damlTypes.Int.encode(__typed__.numCouponsMissed),
  };
}
,
};

