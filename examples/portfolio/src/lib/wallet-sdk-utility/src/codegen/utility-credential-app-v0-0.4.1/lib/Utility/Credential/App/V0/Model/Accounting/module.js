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


exports.RewardRecord_Archive_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RewardRecord_Archive = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RewardRecord = damlTypes.assembleTemplate(
{
  templateId: '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Accounting:RewardRecord',
  templateIdWithPackageId: 'e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b:Utility.Credential.App.V0.Model.Accounting:RewardRecord',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, user: damlTypes.Party.decoder, ccRewardsEarned: damlTypes.Numeric(10).decoder, round: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Types.Round.decoder, reference: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    user: damlTypes.Party.encode(__typed__.user),
    ccRewardsEarned: damlTypes.Numeric(10).encode(__typed__.ccRewardsEarned),
    round: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Types.Round.encode(__typed__.round),
    reference: damlTypes.Text.encode(__typed__.reference),
  };
}
,
  Archive: {
    template: function () { return exports.RewardRecord; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RewardRecord_Archive: {
    template: function () { return exports.RewardRecord; },
    choiceName: 'RewardRecord_Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RewardRecord_Archive.decoder; }),
    argumentEncode: function (__typed__) { return exports.RewardRecord_Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RewardRecord_Archive_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RewardRecord_Archive_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RewardRecord, ['e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b', '#utility-credential-app-v0']);



exports.FeeRecord_Archive_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FeeRecord_Archive = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FeeRecord_CalculateReward = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({issuingMiningRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.IssuingMiningRound.decoder, }); }),
  encode: function (__typed__) {
  return {
    issuingMiningRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.IssuingMiningRound.encode(__typed__.issuingMiningRound),
  };
}
,
};



exports.FeeRecord = damlTypes.assembleTemplate(
{
  templateId: '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Accounting:FeeRecord',
  templateIdWithPackageId: 'e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b:Utility.Credential.App.V0.Model.Accounting:FeeRecord',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, user: damlTypes.Party.decoder, dso: damlTypes.Party.decoder, ccFeesBurned: damlTypes.Numeric(10).decoder, extraFeaturedAppCcFeesBurned: damlTypes.Numeric(10).decoder, isFeatured: damlTypes.Bool.decoder, round: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Types.Round.decoder, reference: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    user: damlTypes.Party.encode(__typed__.user),
    dso: damlTypes.Party.encode(__typed__.dso),
    ccFeesBurned: damlTypes.Numeric(10).encode(__typed__.ccFeesBurned),
    extraFeaturedAppCcFeesBurned: damlTypes.Numeric(10).encode(__typed__.extraFeaturedAppCcFeesBurned),
    isFeatured: damlTypes.Bool.encode(__typed__.isFeatured),
    round: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Types.Round.encode(__typed__.round),
    reference: damlTypes.Text.encode(__typed__.reference),
  };
}
,
  FeeRecord_CalculateReward: {
    template: function () { return exports.FeeRecord; },
    choiceName: 'FeeRecord_CalculateReward',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FeeRecord_CalculateReward.decoder; }),
    argumentEncode: function (__typed__) { return exports.FeeRecord_CalculateReward.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.RewardRecord).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.RewardRecord).encode(__typed__); },
  },
  FeeRecord_Archive: {
    template: function () { return exports.FeeRecord; },
    choiceName: 'FeeRecord_Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FeeRecord_Archive.decoder; }),
    argumentEncode: function (__typed__) { return exports.FeeRecord_Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.FeeRecord_Archive_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.FeeRecord_Archive_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.FeeRecord; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.FeeRecord, ['e9a3b7df354dfd2f15c7d015328c34256308c90ba96f86f185dad58ffca8299b', '#utility-credential-app-v0']);

