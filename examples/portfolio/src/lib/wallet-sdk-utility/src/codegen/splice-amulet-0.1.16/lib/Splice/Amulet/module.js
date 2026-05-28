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
var pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b = require('@daml.js/splice-api-token-holding-v1-1.0.0');
var pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda = require('@daml.js/splice-api-featured-app-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea = require('@daml.js/splice-api-featured-app-v2-1.0.0');

var Splice_Expiry = require('../../Splice/Expiry/module');
var Splice_Fees = require('../../Splice/Fees/module');
var Splice_Round = require('../../Splice/Round/module');
var Splice_Types = require('../../Splice/Types/module');


exports.UnclaimedActivityRecord_DsoExpire = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.UnclaimedActivityRecord = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:UnclaimedActivityRecord',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:UnclaimedActivityRecord',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, beneficiary: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, reason: damlTypes.Text.decoder, expiresAt: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    beneficiary: damlTypes.Party.encode(__typed__.beneficiary),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    reason: damlTypes.Text.encode(__typed__.reason),
    expiresAt: damlTypes.Time.encode(__typed__.expiresAt),
  };
}
,
  UnclaimedActivityRecord_DsoExpire: {
    template: function () { return exports.UnclaimedActivityRecord; },
    choiceName: 'UnclaimedActivityRecord_DsoExpire',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.UnclaimedActivityRecord_DsoExpire.decoder; }),
    argumentEncode: function (__typed__) { return exports.UnclaimedActivityRecord_DsoExpire.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.UnclaimedActivityRecord_DsoExpireResult.decoder; }),
    resultEncode: function (__typed__) { return exports.UnclaimedActivityRecord_DsoExpireResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.UnclaimedActivityRecord; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.UnclaimedActivityRecord, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.UnclaimedReward = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:UnclaimedReward',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:UnclaimedReward',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
  };
}
,
  Archive: {
    template: function () { return exports.UnclaimedReward; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.UnclaimedReward, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.DevelopmentFundCoupon_DsoExpire = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.DevelopmentFundCoupon_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.DevelopmentFundCoupon_Withdraw = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.DevelopmentFundCoupon = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:DevelopmentFundCoupon',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:DevelopmentFundCoupon',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, beneficiary: damlTypes.Party.decoder, fundManager: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, expiresAt: damlTypes.Time.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    beneficiary: damlTypes.Party.encode(__typed__.beneficiary),
    fundManager: damlTypes.Party.encode(__typed__.fundManager),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    expiresAt: damlTypes.Time.encode(__typed__.expiresAt),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  DevelopmentFundCoupon_Withdraw: {
    template: function () { return exports.DevelopmentFundCoupon; },
    choiceName: 'DevelopmentFundCoupon_Withdraw',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.DevelopmentFundCoupon_Withdraw.decoder; }),
    argumentEncode: function (__typed__) { return exports.DevelopmentFundCoupon_Withdraw.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.DevelopmentFundCoupon_WithdrawResult.decoder; }),
    resultEncode: function (__typed__) { return exports.DevelopmentFundCoupon_WithdrawResult.encode(__typed__); },
  },
  DevelopmentFundCoupon_Reject: {
    template: function () { return exports.DevelopmentFundCoupon; },
    choiceName: 'DevelopmentFundCoupon_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.DevelopmentFundCoupon_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.DevelopmentFundCoupon_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.DevelopmentFundCoupon_RejectResult.decoder; }),
    resultEncode: function (__typed__) { return exports.DevelopmentFundCoupon_RejectResult.encode(__typed__); },
  },
  DevelopmentFundCoupon_DsoExpire: {
    template: function () { return exports.DevelopmentFundCoupon; },
    choiceName: 'DevelopmentFundCoupon_DsoExpire',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.DevelopmentFundCoupon_DsoExpire.decoder; }),
    argumentEncode: function (__typed__) { return exports.DevelopmentFundCoupon_DsoExpire.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.DevelopmentFundCoupon_DsoExpireResult.decoder; }),
    resultEncode: function (__typed__) { return exports.DevelopmentFundCoupon_DsoExpireResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.DevelopmentFundCoupon; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.DevelopmentFundCoupon, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.UnclaimedDevelopmentFundCoupon = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:UnclaimedDevelopmentFundCoupon',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:UnclaimedDevelopmentFundCoupon',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
  };
}
,
  Archive: {
    template: function () { return exports.UnclaimedDevelopmentFundCoupon; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.UnclaimedDevelopmentFundCoupon, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.SvRewardCoupon_ArchiveAsBeneficiary = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.SvRewardCoupon_DsoExpire = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).encode(__typed__.closedRoundCid),
  };
}
,
};



exports.SvRewardCoupon = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:SvRewardCoupon',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:SvRewardCoupon',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, sv: damlTypes.Party.decoder, beneficiary: damlTypes.Party.decoder, round: Splice_Types.Round.decoder, weight: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    sv: damlTypes.Party.encode(__typed__.sv),
    beneficiary: damlTypes.Party.encode(__typed__.beneficiary),
    round: Splice_Types.Round.encode(__typed__.round),
    weight: damlTypes.Int.encode(__typed__.weight),
  };
}
,
  SvRewardCoupon_DsoExpire: {
    template: function () { return exports.SvRewardCoupon; },
    choiceName: 'SvRewardCoupon_DsoExpire',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.SvRewardCoupon_DsoExpire.decoder; }),
    argumentEncode: function (__typed__) { return exports.SvRewardCoupon_DsoExpire.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.SvRewardCoupon_DsoExpireResult.decoder; }),
    resultEncode: function (__typed__) { return exports.SvRewardCoupon_DsoExpireResult.encode(__typed__); },
  },
  SvRewardCoupon_ArchiveAsBeneficiary: {
    template: function () { return exports.SvRewardCoupon; },
    choiceName: 'SvRewardCoupon_ArchiveAsBeneficiary',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.SvRewardCoupon_ArchiveAsBeneficiary.decoder; }),
    argumentEncode: function (__typed__) { return exports.SvRewardCoupon_ArchiveAsBeneficiary.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.SvRewardCoupon_ArchiveAsBeneficiaryResult.decoder; }),
    resultEncode: function (__typed__) { return exports.SvRewardCoupon_ArchiveAsBeneficiaryResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.SvRewardCoupon; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.SvRewardCoupon, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.ValidatorRewardCoupon_ArchiveAsValidator = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({validator: damlTypes.Party.decoder, rightCid: damlTypes.ContractId(exports.ValidatorRight).decoder, }); }),
  encode: function (__typed__) {
  return {
    validator: damlTypes.Party.encode(__typed__.validator),
    rightCid: damlTypes.ContractId(exports.ValidatorRight).encode(__typed__.rightCid),
  };
}
,
};



exports.ValidatorRewardCoupon_DsoExpire = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).encode(__typed__.closedRoundCid),
  };
}
,
};



exports.ValidatorRewardCoupon = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:ValidatorRewardCoupon',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:ValidatorRewardCoupon',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, user: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, round: Splice_Types.Round.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    user: damlTypes.Party.encode(__typed__.user),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    round: Splice_Types.Round.encode(__typed__.round),
  };
}
,
  ValidatorRewardCoupon_DsoExpire: {
    template: function () { return exports.ValidatorRewardCoupon; },
    choiceName: 'ValidatorRewardCoupon_DsoExpire',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorRewardCoupon_DsoExpire.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorRewardCoupon_DsoExpire.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorRewardCoupon_DsoExpireResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorRewardCoupon_DsoExpireResult.encode(__typed__); },
  },
  ValidatorRewardCoupon_ArchiveAsValidator: {
    template: function () { return exports.ValidatorRewardCoupon; },
    choiceName: 'ValidatorRewardCoupon_ArchiveAsValidator',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorRewardCoupon_ArchiveAsValidator.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorRewardCoupon_ArchiveAsValidator.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorRewardCoupon_ArchiveAsValidatorResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorRewardCoupon_ArchiveAsValidatorResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ValidatorRewardCoupon; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ValidatorRewardCoupon, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.AppRewardCoupon_DsoExpire = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).encode(__typed__.closedRoundCid),
  };
}
,
};



exports.AppRewardCoupon = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:AppRewardCoupon',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:AppRewardCoupon',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, featured: damlTypes.Bool.decoder, amount: damlTypes.Numeric(10).decoder, round: Splice_Types.Round.decoder, beneficiary: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    provider: damlTypes.Party.encode(__typed__.provider),
    featured: damlTypes.Bool.encode(__typed__.featured),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    round: Splice_Types.Round.encode(__typed__.round),
    beneficiary: damlTypes.Optional(damlTypes.Party).encode(__typed__.beneficiary),
  };
}
,
  AppRewardCoupon_DsoExpire: {
    template: function () { return exports.AppRewardCoupon; },
    choiceName: 'AppRewardCoupon_DsoExpire',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AppRewardCoupon_DsoExpire.decoder; }),
    argumentEncode: function (__typed__) { return exports.AppRewardCoupon_DsoExpire.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AppRewardCoupon_DsoExpireResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AppRewardCoupon_DsoExpireResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.AppRewardCoupon; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.AppRewardCoupon, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.FeaturedAppActivityMarker = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:FeaturedAppActivityMarker',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:FeaturedAppActivityMarker',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, beneficiary: damlTypes.Party.decoder, weight: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    provider: damlTypes.Party.encode(__typed__.provider),
    beneficiary: damlTypes.Party.encode(__typed__.beneficiary),
    weight: damlTypes.Numeric(10).encode(__typed__.weight),
  };
}
,
  Archive: {
    template: function () { return exports.FeaturedAppActivityMarker; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

, pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.FeaturedAppActivityMarker
, pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.FeaturedAppActivityMarker
);


damlTypes.registerTemplate(exports.FeaturedAppActivityMarker, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.FeaturedAppRight_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FeaturedAppRight_Withdraw = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.FeaturedAppRight = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:FeaturedAppRight',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:FeaturedAppRight',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    provider: damlTypes.Party.encode(__typed__.provider),
  };
}
,
  FeaturedAppRight_Withdraw: {
    template: function () { return exports.FeaturedAppRight; },
    choiceName: 'FeaturedAppRight_Withdraw',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FeaturedAppRight_Withdraw.decoder; }),
    argumentEncode: function (__typed__) { return exports.FeaturedAppRight_Withdraw.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.FeaturedAppRight_WithdrawResult.decoder; }),
    resultEncode: function (__typed__) { return exports.FeaturedAppRight_WithdrawResult.encode(__typed__); },
  },
  FeaturedAppRight_Cancel: {
    template: function () { return exports.FeaturedAppRight; },
    choiceName: 'FeaturedAppRight_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FeaturedAppRight_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.FeaturedAppRight_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.FeaturedAppRight_CancelResult.decoder; }),
    resultEncode: function (__typed__) { return exports.FeaturedAppRight_CancelResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.FeaturedAppRight; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

, pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.FeaturedAppRight
, pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.FeaturedAppRight
);


damlTypes.registerTemplate(exports.FeaturedAppRight, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.ValidatorRight_ArchiveAsUser = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ValidatorRight_ArchiveAsValidator = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ValidatorRight = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:ValidatorRight',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:ValidatorRight',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, user: damlTypes.Party.decoder, validator: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    user: damlTypes.Party.encode(__typed__.user),
    validator: damlTypes.Party.encode(__typed__.validator),
  };
}
,
  ValidatorRight_ArchiveAsValidator: {
    template: function () { return exports.ValidatorRight; },
    choiceName: 'ValidatorRight_ArchiveAsValidator',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorRight_ArchiveAsValidator.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorRight_ArchiveAsValidator.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorRight_ArchiveAsValidatorResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorRight_ArchiveAsValidatorResult.encode(__typed__); },
  },
  ValidatorRight_ArchiveAsUser: {
    template: function () { return exports.ValidatorRight; },
    choiceName: 'ValidatorRight_ArchiveAsUser',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorRight_ArchiveAsUser.decoder; }),
    argumentEncode: function (__typed__) { return exports.ValidatorRight_ArchiveAsUser.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ValidatorRight_ArchiveAsUserResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ValidatorRight_ArchiveAsUserResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ValidatorRight; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ValidatorRight, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.LockedAmulet_ExpireAmulet = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({roundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    roundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.roundCid),
  };
}
,
};



exports.LockedAmulet_OwnerExpireLock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({openRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    openRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.openRoundCid),
  };
}
,
};



exports.LockedAmulet_Unlock = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({openRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    openRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.openRoundCid),
  };
}
,
};



exports.LockedAmulet = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:LockedAmulet',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:LockedAmulet',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amulet: exports.Amulet.decoder, lock: Splice_Expiry.TimeLock.decoder, }); }),
  encode: function (__typed__) {
  return {
    amulet: exports.Amulet.encode(__typed__.amulet),
    lock: Splice_Expiry.TimeLock.encode(__typed__.lock),
  };
}
,
  LockedAmulet_Unlock: {
    template: function () { return exports.LockedAmulet; },
    choiceName: 'LockedAmulet_Unlock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.LockedAmulet_Unlock.decoder; }),
    argumentEncode: function (__typed__) { return exports.LockedAmulet_Unlock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.LockedAmulet_UnlockResult.decoder; }),
    resultEncode: function (__typed__) { return exports.LockedAmulet_UnlockResult.encode(__typed__); },
  },
  LockedAmulet_OwnerExpireLock: {
    template: function () { return exports.LockedAmulet; },
    choiceName: 'LockedAmulet_OwnerExpireLock',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.LockedAmulet_OwnerExpireLock.decoder; }),
    argumentEncode: function (__typed__) { return exports.LockedAmulet_OwnerExpireLock.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.LockedAmulet_OwnerExpireLockResult.decoder; }),
    resultEncode: function (__typed__) { return exports.LockedAmulet_OwnerExpireLockResult.encode(__typed__); },
  },
  LockedAmulet_ExpireAmulet: {
    template: function () { return exports.LockedAmulet; },
    choiceName: 'LockedAmulet_ExpireAmulet',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.LockedAmulet_ExpireAmulet.decoder; }),
    argumentEncode: function (__typed__) { return exports.LockedAmulet_ExpireAmulet.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.LockedAmulet_ExpireAmuletResult.decoder; }),
    resultEncode: function (__typed__) { return exports.LockedAmulet_ExpireAmuletResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.LockedAmulet; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

, pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding
);


damlTypes.registerTemplate(exports.LockedAmulet, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.Amulet_Expire = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({roundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    roundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.roundCid),
  };
}
,
};



exports.Amulet = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.Amulet:Amulet',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.Amulet:Amulet',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, owner: damlTypes.Party.decoder, amount: Splice_Fees.ExpiringAmount.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    owner: damlTypes.Party.encode(__typed__.owner),
    amount: Splice_Fees.ExpiringAmount.encode(__typed__.amount),
  };
}
,
  Amulet_Expire: {
    template: function () { return exports.Amulet; },
    choiceName: 'Amulet_Expire',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Amulet_Expire.decoder; }),
    argumentEncode: function (__typed__) { return exports.Amulet_Expire.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.Amulet_ExpireResult.decoder; }),
    resultEncode: function (__typed__) { return exports.Amulet_ExpireResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.Amulet; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

, pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding
);


damlTypes.registerTemplate(exports.Amulet, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.DevelopmentFundCoupon_DsoExpireResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unclaimedDevelopmentFundCouponCid: damlTypes.ContractId(exports.UnclaimedDevelopmentFundCoupon).decoder, }); }),
  encode: function (__typed__) {
  return {
    unclaimedDevelopmentFundCouponCid: damlTypes.ContractId(exports.UnclaimedDevelopmentFundCoupon).encode(__typed__.unclaimedDevelopmentFundCouponCid),
  };
}
,
};



exports.DevelopmentFundCoupon_RejectResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unclaimedDevelopmentFundCouponCid: damlTypes.ContractId(exports.UnclaimedDevelopmentFundCoupon).decoder, }); }),
  encode: function (__typed__) {
  return {
    unclaimedDevelopmentFundCouponCid: damlTypes.ContractId(exports.UnclaimedDevelopmentFundCoupon).encode(__typed__.unclaimedDevelopmentFundCouponCid),
  };
}
,
};



exports.DevelopmentFundCoupon_WithdrawResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unclaimedDevelopmentFundCouponCid: damlTypes.ContractId(exports.UnclaimedDevelopmentFundCoupon).decoder, }); }),
  encode: function (__typed__) {
  return {
    unclaimedDevelopmentFundCouponCid: damlTypes.ContractId(exports.UnclaimedDevelopmentFundCoupon).encode(__typed__.unclaimedDevelopmentFundCouponCid),
  };
}
,
};



exports.UnclaimedActivityRecord_DsoExpireResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unclaimedRewardCid: damlTypes.ContractId(exports.UnclaimedReward).decoder, }); }),
  encode: function (__typed__) {
  return {
    unclaimedRewardCid: damlTypes.ContractId(exports.UnclaimedReward).encode(__typed__.unclaimedRewardCid),
  };
}
,
};



exports.UnclaimedActivityRecord_ArchiveAsBeneficiaryResult = {
  UnclaimedActivityRecord_ArchiveAsBeneficiaryResult: 'UnclaimedActivityRecord_ArchiveAsBeneficiaryResult',
  keys: ['UnclaimedActivityRecord_ArchiveAsBeneficiaryResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.UnclaimedActivityRecord_ArchiveAsBeneficiaryResult.UnclaimedActivityRecord_ArchiveAsBeneficiaryResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.SvRewardCoupon_ArchiveAsBeneficiaryResult = {
  SvRewardCoupon_ArchiveAsBeneficiaryResult: 'SvRewardCoupon_ArchiveAsBeneficiaryResult',
  keys: ['SvRewardCoupon_ArchiveAsBeneficiaryResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.SvRewardCoupon_ArchiveAsBeneficiaryResult.SvRewardCoupon_ArchiveAsBeneficiaryResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.SvRewardCoupon_DsoExpireResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({weight: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    weight: damlTypes.Int.encode(__typed__.weight),
  };
}
,
};



exports.ValidatorRewardCoupon_ArchiveAsValidatorResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ValidatorRewardCoupon_DsoExpireResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amount: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
  };
}
,
};



exports.AppRewardCoupon_DsoExpireResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({featured: damlTypes.Bool.decoder, amount: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    featured: damlTypes.Bool.encode(__typed__.featured),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
  };
}
,
};



exports.FeaturedAppRight_CancelResult = {
  FeaturedAppRight_CancelResult: 'FeaturedAppRight_CancelResult',
  keys: ['FeaturedAppRight_CancelResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.FeaturedAppRight_CancelResult.FeaturedAppRight_CancelResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.FeaturedAppRight_WithdrawResult = {
  FeaturedAppRight_WithdrawResult: 'FeaturedAppRight_WithdrawResult',
  keys: ['FeaturedAppRight_WithdrawResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.FeaturedAppRight_WithdrawResult.FeaturedAppRight_WithdrawResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.ValidatorRight_ArchiveAsUserResult = {
  ValidatorRight_ArchiveAsUserResult: 'ValidatorRight_ArchiveAsUserResult',
  keys: ['ValidatorRight_ArchiveAsUserResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.ValidatorRight_ArchiveAsUserResult.ValidatorRight_ArchiveAsUserResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.ValidatorRight_ArchiveAsValidatorResult = {
  ValidatorRight_ArchiveAsValidatorResult: 'ValidatorRight_ArchiveAsValidatorResult',
  keys: ['ValidatorRight_ArchiveAsValidatorResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.ValidatorRight_ArchiveAsValidatorResult.ValidatorRight_ArchiveAsValidatorResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.LockedAmulet_ExpireAmuletResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({expireSum: exports.AmuletExpireSummary.decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    expireSum: exports.AmuletExpireSummary.encode(__typed__.expireSum),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.LockedAmulet_OwnerExpireLockResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amuletSum: exports.AmuletCreateSummary(damlTypes.ContractId(exports.Amulet)).decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    amuletSum: exports.AmuletCreateSummary(damlTypes.ContractId(exports.Amulet)).encode(__typed__.amuletSum),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.LockedAmulet_UnlockResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amuletSum: exports.AmuletCreateSummary(damlTypes.ContractId(exports.Amulet)).decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    amuletSum: exports.AmuletCreateSummary(damlTypes.ContractId(exports.Amulet)).encode(__typed__.amuletSum),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.Amulet_ExpireResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({expireSum: exports.AmuletExpireSummary.decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    expireSum: exports.AmuletExpireSummary.encode(__typed__.expireSum),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.AmuletCreateSummary = function (amuletContractId) { return ({
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amulet: amuletContractId.decoder, amuletPrice: damlTypes.Numeric(10).decoder, round: Splice_Types.Round.decoder, }); }),
  encode: function (__typed__) {
  return {
    amulet: amuletContractId.encode(__typed__.amulet),
    amuletPrice: damlTypes.Numeric(10).encode(__typed__.amuletPrice),
    round: Splice_Types.Round.encode(__typed__.round),
  };
}
,
}); };



exports.AmuletExpireSummary = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({owner: damlTypes.Party.decoder, round: Splice_Types.Round.decoder, changeToInitialAmountAsOfRoundZero: damlTypes.Numeric(10).decoder, changeToHoldingFeesRate: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    owner: damlTypes.Party.encode(__typed__.owner),
    round: Splice_Types.Round.encode(__typed__.round),
    changeToInitialAmountAsOfRoundZero: damlTypes.Numeric(10).encode(__typed__.changeToInitialAmountAsOfRoundZero),
    changeToHoldingFeesRate: damlTypes.Numeric(10).encode(__typed__.changeToHoldingFeesRate),
  };
}
,
};

