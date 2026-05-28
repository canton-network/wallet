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
var pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 = require('@daml.js/daml-prim-DA-Types-1.0.0');
var pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda = require('@daml.js/splice-api-featured-app-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946 = require('@daml.js/daml-stdlib-DA-Time-Types-1.0.0');

var Splice_Amulet = require('../../Splice/Amulet/module');
var Splice_AmuletConfig = require('../../Splice/AmuletConfig/module');
var Splice_DecentralizedSynchronizer = require('../../Splice/DecentralizedSynchronizer/module');
var Splice_Expiry = require('../../Splice/Expiry/module');
var Splice_Issuance = require('../../Splice/Issuance/module');
var Splice_Round = require('../../Splice/Round/module');
var Splice_Schedule = require('../../Splice/Schedule/module');
var Splice_Types = require('../../Splice/Types/module');
var Splice_ValidatorLicense = require('../../Splice/ValidatorLicense/module');


exports.TransferPreapproval_CancelResult = {
  TransferPreapproval_CancelResult: 'TransferPreapproval_CancelResult',
  keys: ['TransferPreapproval_CancelResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.TransferPreapproval_CancelResult.TransferPreapproval_CancelResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.TransferPreapproval_ExpireResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.TransferPreapproval_RenewResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferPreapprovalCid: damlTypes.ContractId(exports.TransferPreapproval).decoder, transferResult: exports.TransferResult.decoder, receiver: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, amuletPaid: damlTypes.Numeric(10).decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    transferPreapprovalCid: damlTypes.ContractId(exports.TransferPreapproval).encode(__typed__.transferPreapprovalCid),
    transferResult: exports.TransferResult.encode(__typed__.transferResult),
    receiver: damlTypes.Party.encode(__typed__.receiver),
    provider: damlTypes.Party.encode(__typed__.provider),
    amuletPaid: damlTypes.Numeric(10).encode(__typed__.amuletPaid),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.TransferPreapproval_SendResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({result: exports.TransferResult.decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    result: exports.TransferResult.encode(__typed__.result),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.TransferPreapproval_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({p: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    p: damlTypes.Party.encode(__typed__.p),
  };
}
,
};



exports.TransferPreapproval_Expire = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.TransferPreapproval_Renew = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({context: exports.PaymentTransferContext.decoder, inputs: damlTypes.List(exports.TransferInput).decoder, newExpiresAt: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    context: exports.PaymentTransferContext.encode(__typed__.context),
    inputs: damlTypes.List(exports.TransferInput).encode(__typed__.inputs),
    newExpiresAt: damlTypes.Time.encode(__typed__.newExpiresAt),
  };
}
,
};



exports.TransferPreapproval_Send = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({context: exports.PaymentTransferContext.decoder, inputs: damlTypes.List(exports.TransferInput).decoder, amount: damlTypes.Numeric(10).decoder, sender: damlTypes.Party.decoder, description: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Text).decoder), }); }),
  encode: function (__typed__) {
  return {
    context: exports.PaymentTransferContext.encode(__typed__.context),
    inputs: damlTypes.List(exports.TransferInput).encode(__typed__.inputs),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    sender: damlTypes.Party.encode(__typed__.sender),
    description: damlTypes.Optional(damlTypes.Text).encode(__typed__.description),
  };
}
,
};



exports.TransferPreapproval_Fetch = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({p: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    p: damlTypes.Party.encode(__typed__.p),
  };
}
,
};



exports.TransferPreapproval = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.AmuletRules:TransferPreapproval',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.AmuletRules:TransferPreapproval',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, receiver: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, validFrom: damlTypes.Time.decoder, lastRenewedAt: damlTypes.Time.decoder, expiresAt: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    receiver: damlTypes.Party.encode(__typed__.receiver),
    provider: damlTypes.Party.encode(__typed__.provider),
    validFrom: damlTypes.Time.encode(__typed__.validFrom),
    lastRenewedAt: damlTypes.Time.encode(__typed__.lastRenewedAt),
    expiresAt: damlTypes.Time.encode(__typed__.expiresAt),
  };
}
,
  TransferPreapproval_Renew: {
    template: function () { return exports.TransferPreapproval; },
    choiceName: 'TransferPreapproval_Renew',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_Renew.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferPreapproval_Renew.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_RenewResult.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferPreapproval_RenewResult.encode(__typed__); },
  },
  TransferPreapproval_Send: {
    template: function () { return exports.TransferPreapproval; },
    choiceName: 'TransferPreapproval_Send',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_Send.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferPreapproval_Send.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_SendResult.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferPreapproval_SendResult.encode(__typed__); },
  },
  TransferPreapproval_Expire: {
    template: function () { return exports.TransferPreapproval; },
    choiceName: 'TransferPreapproval_Expire',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_Expire.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferPreapproval_Expire.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_ExpireResult.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferPreapproval_ExpireResult.encode(__typed__); },
  },
  TransferPreapproval_Cancel: {
    template: function () { return exports.TransferPreapproval; },
    choiceName: 'TransferPreapproval_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferPreapproval_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_CancelResult.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferPreapproval_CancelResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.TransferPreapproval; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  TransferPreapproval_Fetch: {
    template: function () { return exports.TransferPreapproval; },
    choiceName: 'TransferPreapproval_Fetch',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval_Fetch.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferPreapproval_Fetch.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferPreapproval.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferPreapproval.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.TransferPreapproval, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.ExternalPartySetupProposal_WithdrawResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dummyArg: damlTypes.Unit.decoder, }); }),
  encode: function (__typed__) {
  return {
    dummyArg: damlTypes.Unit.encode(__typed__.dummyArg),
  };
}
,
};



exports.ExternalPartySetupProposal_RejectResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dummyArg: damlTypes.Unit.decoder, }); }),
  encode: function (__typed__) {
  return {
    dummyArg: damlTypes.Unit.encode(__typed__.dummyArg),
  };
}
,
};



exports.ExternalPartySetupProposal_AcceptResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({validatorRightCid: damlTypes.ContractId(Splice_Amulet.ValidatorRight).decoder, transferPreapprovalCid: damlTypes.ContractId(exports.TransferPreapproval).decoder, }); }),
  encode: function (__typed__) {
  return {
    validatorRightCid: damlTypes.ContractId(Splice_Amulet.ValidatorRight).encode(__typed__.validatorRightCid),
    transferPreapprovalCid: damlTypes.ContractId(exports.TransferPreapproval).encode(__typed__.transferPreapprovalCid),
  };
}
,
};



exports.ExternalPartySetupProposal_Withdraw = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.ExternalPartySetupProposal_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.ExternalPartySetupProposal_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ExternalPartySetupProposal = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.AmuletRules:ExternalPartySetupProposal',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.AmuletRules:ExternalPartySetupProposal',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({validator: damlTypes.Party.decoder, user: damlTypes.Party.decoder, dso: damlTypes.Party.decoder, createdAt: damlTypes.Time.decoder, preapprovalExpiresAt: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    validator: damlTypes.Party.encode(__typed__.validator),
    user: damlTypes.Party.encode(__typed__.user),
    dso: damlTypes.Party.encode(__typed__.dso),
    createdAt: damlTypes.Time.encode(__typed__.createdAt),
    preapprovalExpiresAt: damlTypes.Time.encode(__typed__.preapprovalExpiresAt),
  };
}
,
  ExternalPartySetupProposal_Accept: {
    template: function () { return exports.ExternalPartySetupProposal; },
    choiceName: 'ExternalPartySetupProposal_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExternalPartySetupProposal_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExternalPartySetupProposal_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExternalPartySetupProposal_AcceptResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ExternalPartySetupProposal_AcceptResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ExternalPartySetupProposal; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  ExternalPartySetupProposal_Reject: {
    template: function () { return exports.ExternalPartySetupProposal; },
    choiceName: 'ExternalPartySetupProposal_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExternalPartySetupProposal_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExternalPartySetupProposal_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExternalPartySetupProposal_RejectResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ExternalPartySetupProposal_RejectResult.encode(__typed__); },
  },
  ExternalPartySetupProposal_Withdraw: {
    template: function () { return exports.ExternalPartySetupProposal; },
    choiceName: 'ExternalPartySetupProposal_Withdraw',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExternalPartySetupProposal_Withdraw.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExternalPartySetupProposal_Withdraw.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExternalPartySetupProposal_WithdrawResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ExternalPartySetupProposal_WithdrawResult.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ExternalPartySetupProposal, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.BalanceChange = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({changeToInitialAmountAsOfRoundZero: damlTypes.Numeric(10).decoder, changeToHoldingFeesRate: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    changeToInitialAmountAsOfRoundZero: damlTypes.Numeric(10).encode(__typed__.changeToInitialAmountAsOfRoundZero),
    changeToHoldingFeesRate: damlTypes.Numeric(10).encode(__typed__.changeToHoldingFeesRate),
  };
}
,
};



exports.TransferSummary = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({inputAppRewardAmount: damlTypes.Numeric(10).decoder, inputValidatorRewardAmount: damlTypes.Numeric(10).decoder, inputSvRewardAmount: damlTypes.Numeric(10).decoder, inputAmuletAmount: damlTypes.Numeric(10).decoder, balanceChanges: damlTypes.Map(damlTypes.Party, exports.BalanceChange).decoder, holdingFees: damlTypes.Numeric(10).decoder, outputFees: damlTypes.List(damlTypes.Numeric(10)).decoder, senderChangeFee: damlTypes.Numeric(10).decoder, senderChangeAmount: damlTypes.Numeric(10).decoder, amuletPrice: damlTypes.Numeric(10).decoder, inputValidatorFaucetAmount: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), inputUnclaimedActivityRecordAmount: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), inputDevelopmentFundAmount: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), }); }),
  encode: function (__typed__) {
  return {
    inputAppRewardAmount: damlTypes.Numeric(10).encode(__typed__.inputAppRewardAmount),
    inputValidatorRewardAmount: damlTypes.Numeric(10).encode(__typed__.inputValidatorRewardAmount),
    inputSvRewardAmount: damlTypes.Numeric(10).encode(__typed__.inputSvRewardAmount),
    inputAmuletAmount: damlTypes.Numeric(10).encode(__typed__.inputAmuletAmount),
    balanceChanges: damlTypes.Map(damlTypes.Party, exports.BalanceChange).encode(__typed__.balanceChanges),
    holdingFees: damlTypes.Numeric(10).encode(__typed__.holdingFees),
    outputFees: damlTypes.List(damlTypes.Numeric(10)).encode(__typed__.outputFees),
    senderChangeFee: damlTypes.Numeric(10).encode(__typed__.senderChangeFee),
    senderChangeAmount: damlTypes.Numeric(10).encode(__typed__.senderChangeAmount),
    amuletPrice: damlTypes.Numeric(10).encode(__typed__.amuletPrice),
    inputValidatorFaucetAmount: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.inputValidatorFaucetAmount),
    inputUnclaimedActivityRecordAmount: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.inputUnclaimedActivityRecordAmount),
    inputDevelopmentFundAmount: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.inputDevelopmentFundAmount),
  };
}
,
};



exports.AmuletRules_CreateTransferPreapprovalResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferPreapprovalCid: damlTypes.ContractId(exports.TransferPreapproval).decoder, transferResult: exports.TransferResult.decoder, amuletPaid: damlTypes.Numeric(10).decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    transferPreapprovalCid: damlTypes.ContractId(exports.TransferPreapproval).encode(__typed__.transferPreapprovalCid),
    transferResult: exports.TransferResult.encode(__typed__.transferResult),
    amuletPaid: damlTypes.Numeric(10).encode(__typed__.amuletPaid),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.AmuletRules_CreateExternalPartySetupProposalResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({proposalCid: damlTypes.ContractId(exports.ExternalPartySetupProposal).decoder, user: damlTypes.Party.decoder, validator: damlTypes.Party.decoder, transferResult: exports.TransferResult.decoder, amuletPaid: damlTypes.Numeric(10).decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    proposalCid: damlTypes.ContractId(exports.ExternalPartySetupProposal).encode(__typed__.proposalCid),
    user: damlTypes.Party.encode(__typed__.user),
    validator: damlTypes.Party.encode(__typed__.validator),
    transferResult: exports.TransferResult.encode(__typed__.transferResult),
    amuletPaid: damlTypes.Numeric(10).encode(__typed__.amuletPaid),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.AmuletRules_BuyMemberTrafficResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({round: Splice_Types.Round.decoder, summary: exports.TransferSummary.decoder, amuletPaid: damlTypes.Numeric(10).decoder, purchasedTraffic: damlTypes.ContractId(Splice_DecentralizedSynchronizer.MemberTraffic).decoder, senderChangeAmulet: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.Amulet)).decoder), meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    round: Splice_Types.Round.encode(__typed__.round),
    summary: exports.TransferSummary.encode(__typed__.summary),
    amuletPaid: damlTypes.Numeric(10).encode(__typed__.amuletPaid),
    purchasedTraffic: damlTypes.ContractId(Splice_DecentralizedSynchronizer.MemberTraffic).encode(__typed__.purchasedTraffic),
    senderChangeAmulet: damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.Amulet)).encode(__typed__.senderChangeAmulet),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.TransferResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({round: Splice_Types.Round.decoder, summary: exports.TransferSummary.decoder, createdAmulets: damlTypes.List(exports.CreatedAmulet).decoder, senderChangeAmulet: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.Amulet)).decoder), meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    round: Splice_Types.Round.encode(__typed__.round),
    summary: exports.TransferSummary.encode(__typed__.summary),
    createdAmulets: damlTypes.List(exports.CreatedAmulet).encode(__typed__.createdAmulets),
    senderChangeAmulet: damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.Amulet)).encode(__typed__.senderChangeAmulet),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.TransferOutput = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({receiver: damlTypes.Party.decoder, receiverFeeRatio: damlTypes.Numeric(10).decoder, amount: damlTypes.Numeric(10).decoder, lock: jtv.Decoder.withDefault(null, damlTypes.Optional(Splice_Expiry.TimeLock).decoder), }); }),
  encode: function (__typed__) {
  return {
    receiver: damlTypes.Party.encode(__typed__.receiver),
    receiverFeeRatio: damlTypes.Numeric(10).encode(__typed__.receiverFeeRatio),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    lock: damlTypes.Optional(Splice_Expiry.TimeLock).encode(__typed__.lock),
  };
}
,
};



exports.Transfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({sender: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, inputs: damlTypes.List(exports.TransferInput).decoder, outputs: damlTypes.List(exports.TransferOutput).decoder, beneficiaries: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.List(pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary)).decoder), }); }),
  encode: function (__typed__) {
  return {
    sender: damlTypes.Party.encode(__typed__.sender),
    provider: damlTypes.Party.encode(__typed__.provider),
    inputs: damlTypes.List(exports.TransferInput).encode(__typed__.inputs),
    outputs: damlTypes.List(exports.TransferOutput).encode(__typed__.outputs),
    beneficiaries: damlTypes.Optional(damlTypes.List(pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary)).encode(__typed__.beneficiaries),
  };
}
,
};



exports.TransferInput = {
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.object({tag: jtv.constant('InputAppRewardCoupon'), value: damlTypes.ContractId(Splice_Amulet.AppRewardCoupon).decoder, }), jtv.object({tag: jtv.constant('InputValidatorRewardCoupon'), value: damlTypes.ContractId(Splice_Amulet.ValidatorRewardCoupon).decoder, }), jtv.object({tag: jtv.constant('InputSvRewardCoupon'), value: damlTypes.ContractId(Splice_Amulet.SvRewardCoupon).decoder, }), jtv.object({tag: jtv.constant('InputAmulet'), value: damlTypes.ContractId(Splice_Amulet.Amulet).decoder, }), jtv.object({tag: jtv.constant('ExtTransferInput'), value: exports.TransferInput.ExtTransferInput.decoder, }), jtv.object({tag: jtv.constant('InputValidatorLivenessActivityRecord'), value: damlTypes.ContractId(Splice_ValidatorLicense.ValidatorLivenessActivityRecord).decoder, }), jtv.object({tag: jtv.constant('InputUnclaimedActivityRecord'), value: damlTypes.ContractId(Splice_Amulet.UnclaimedActivityRecord).decoder, }), jtv.object({tag: jtv.constant('InputDevelopmentFundCoupon'), value: damlTypes.ContractId(Splice_Amulet.DevelopmentFundCoupon).decoder, })); }),
  encode: function (__typed__) {
  switch(__typed__.tag) {
    case 'InputAppRewardCoupon': return {tag: __typed__.tag, value: damlTypes.ContractId(Splice_Amulet.AppRewardCoupon).encode(__typed__.value)};
    case 'InputValidatorRewardCoupon': return {tag: __typed__.tag, value: damlTypes.ContractId(Splice_Amulet.ValidatorRewardCoupon).encode(__typed__.value)};
    case 'InputSvRewardCoupon': return {tag: __typed__.tag, value: damlTypes.ContractId(Splice_Amulet.SvRewardCoupon).encode(__typed__.value)};
    case 'InputAmulet': return {tag: __typed__.tag, value: damlTypes.ContractId(Splice_Amulet.Amulet).encode(__typed__.value)};
    case 'ExtTransferInput': return {tag: __typed__.tag, value: exports.TransferInput.ExtTransferInput.encode(__typed__.value)};
    case 'InputValidatorLivenessActivityRecord': return {tag: __typed__.tag, value: damlTypes.ContractId(Splice_ValidatorLicense.ValidatorLivenessActivityRecord).encode(__typed__.value)};
    case 'InputUnclaimedActivityRecord': return {tag: __typed__.tag, value: damlTypes.ContractId(Splice_Amulet.UnclaimedActivityRecord).encode(__typed__.value)};
    case 'InputDevelopmentFundCoupon': return {tag: __typed__.tag, value: damlTypes.ContractId(Splice_Amulet.DevelopmentFundCoupon).encode(__typed__.value)};
    default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type TransferInput';
  }
}
,
  ExtTransferInput:({
    decoder: damlTypes.lazyMemo(function () { return jtv.object({dummyUnitField: damlTypes.Unit.decoder, optInputValidatorFaucetCoupon: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Splice_ValidatorLicense.ValidatorFaucetCoupon)).decoder), }); }),
    encode: function (__typed__) {
  return {
    dummyUnitField: damlTypes.Unit.encode(__typed__.dummyUnitField),
    optInputValidatorFaucetCoupon: damlTypes.Optional(damlTypes.ContractId(Splice_ValidatorLicense.ValidatorFaucetCoupon)).encode(__typed__.optInputValidatorFaucetCoupon),
  };
}
,
  }),
};





exports.CreatedAmulet = {
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.object({tag: jtv.constant('TransferResultAmulet'), value: damlTypes.ContractId(Splice_Amulet.Amulet).decoder, }), jtv.object({tag: jtv.constant('TransferResultLockedAmulet'), value: damlTypes.ContractId(Splice_Amulet.LockedAmulet).decoder, }), jtv.object({tag: jtv.constant('ExtCreatedAmulet'), value: exports.CreatedAmulet.ExtCreatedAmulet.decoder, })); }),
  encode: function (__typed__) {
  switch(__typed__.tag) {
    case 'TransferResultAmulet': return {tag: __typed__.tag, value: damlTypes.ContractId(Splice_Amulet.Amulet).encode(__typed__.value)};
    case 'TransferResultLockedAmulet': return {tag: __typed__.tag, value: damlTypes.ContractId(Splice_Amulet.LockedAmulet).encode(__typed__.value)};
    case 'ExtCreatedAmulet': return {tag: __typed__.tag, value: exports.CreatedAmulet.ExtCreatedAmulet.encode(__typed__.value)};
    default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type CreatedAmulet';
  }
}
,
  ExtCreatedAmulet:({
    decoder: damlTypes.lazyMemo(function () { return jtv.object({dummyUnitField: damlTypes.Unit.decoder, }); }),
    encode: function (__typed__) {
  return {
    dummyUnitField: damlTypes.Unit.encode(__typed__.dummyUnitField),
  };
}
,
  }),
};





exports.TransferContext = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({openMiningRound: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, issuingMiningRounds: damlTypes.Map(Splice_Types.Round, damlTypes.ContractId(Splice_Round.IssuingMiningRound)).decoder, validatorRights: damlTypes.Map(damlTypes.Party, damlTypes.ContractId(Splice_Amulet.ValidatorRight)).decoder, featuredAppRight: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.FeaturedAppRight)).decoder), }); }),
  encode: function (__typed__) {
  return {
    openMiningRound: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.openMiningRound),
    issuingMiningRounds: damlTypes.Map(Splice_Types.Round, damlTypes.ContractId(Splice_Round.IssuingMiningRound)).encode(__typed__.issuingMiningRounds),
    validatorRights: damlTypes.Map(damlTypes.Party, damlTypes.ContractId(Splice_Amulet.ValidatorRight)).encode(__typed__.validatorRights),
    featuredAppRight: damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.FeaturedAppRight)).encode(__typed__.featuredAppRight),
  };
}
,
};



exports.PaymentTransferContext = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amuletRules: damlTypes.ContractId(exports.AmuletRules).decoder, context: exports.TransferContext.decoder, }); }),
  encode: function (__typed__) {
  return {
    amuletRules: damlTypes.ContractId(exports.AmuletRules).encode(__typed__.amuletRules),
    context: exports.TransferContext.encode(__typed__.context),
  };
}
,
};



exports.AppTransferContext = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amuletRules: damlTypes.ContractId(exports.AmuletRules).decoder, openMiningRound: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, featuredAppRight: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.FeaturedAppRight)).decoder), }); }),
  encode: function (__typed__) {
  return {
    amuletRules: damlTypes.ContractId(exports.AmuletRules).encode(__typed__.amuletRules),
    openMiningRound: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.openMiningRound),
    featuredAppRight: damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.FeaturedAppRight)).encode(__typed__.featuredAppRight),
  };
}
,
};



exports.PreprocessedTransferOutput = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({owner: damlTypes.Party.decoder, outputFee: damlTypes.Numeric(10).decoder, amount: damlTypes.Numeric(10).decoder, lock: jtv.Decoder.withDefault(null, damlTypes.Optional(Splice_Expiry.TimeLock).decoder), }); }),
  encode: function (__typed__) {
  return {
    owner: damlTypes.Party.encode(__typed__.owner),
    outputFee: damlTypes.Numeric(10).encode(__typed__.outputFee),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    lock: damlTypes.Optional(Splice_Expiry.TimeLock).encode(__typed__.lock),
  };
}
,
};



exports.TransferInputsSummary = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({totalAmuletAmount: damlTypes.Numeric(10).decoder, totalAppRewardAmount: damlTypes.Numeric(10).decoder, totalValidatorRewardAmount: damlTypes.Numeric(10).decoder, totalValidatorFaucetAmount: damlTypes.Numeric(10).decoder, totalSvRewardAmount: damlTypes.Numeric(10).decoder, totalHoldingFees: damlTypes.Numeric(10).decoder, amountArchivedAsOfRoundZero: damlTypes.Numeric(10).decoder, changeToHoldingFeesRate: damlTypes.Numeric(10).decoder, totalUnclaimedActivityRecordAmount: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), totalDevelopmentFundAmount: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Numeric(10)).decoder), }); }),
  encode: function (__typed__) {
  return {
    totalAmuletAmount: damlTypes.Numeric(10).encode(__typed__.totalAmuletAmount),
    totalAppRewardAmount: damlTypes.Numeric(10).encode(__typed__.totalAppRewardAmount),
    totalValidatorRewardAmount: damlTypes.Numeric(10).encode(__typed__.totalValidatorRewardAmount),
    totalValidatorFaucetAmount: damlTypes.Numeric(10).encode(__typed__.totalValidatorFaucetAmount),
    totalSvRewardAmount: damlTypes.Numeric(10).encode(__typed__.totalSvRewardAmount),
    totalHoldingFees: damlTypes.Numeric(10).encode(__typed__.totalHoldingFees),
    amountArchivedAsOfRoundZero: damlTypes.Numeric(10).encode(__typed__.amountArchivedAsOfRoundZero),
    changeToHoldingFeesRate: damlTypes.Numeric(10).encode(__typed__.changeToHoldingFeesRate),
    totalUnclaimedActivityRecordAmount: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.totalUnclaimedActivityRecordAmount),
    totalDevelopmentFundAmount: damlTypes.Optional(damlTypes.Numeric(10)).encode(__typed__.totalDevelopmentFundAmount),
  };
}
,
};



exports.TransferContextSummary = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({featuredAppProvider: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), config: Splice_AmuletConfig.TransferConfig(Splice_Amulet.Amulet).decoder, openRound: Splice_Round.OpenMiningRound.decoder, issuingMiningRounds: damlTypes.Map(Splice_Types.Round, Splice_Round.IssuingMiningRound).decoder, validatorRights: damlTypes.Map(damlTypes.Party, damlTypes.ContractId(Splice_Amulet.ValidatorRight)).decoder, }); }),
  encode: function (__typed__) {
  return {
    featuredAppProvider: damlTypes.Optional(damlTypes.Party).encode(__typed__.featuredAppProvider),
    config: Splice_AmuletConfig.TransferConfig(Splice_Amulet.Amulet).encode(__typed__.config),
    openRound: Splice_Round.OpenMiningRound.encode(__typed__.openRound),
    issuingMiningRounds: damlTypes.Map(Splice_Types.Round, Splice_Round.IssuingMiningRound).encode(__typed__.issuingMiningRounds),
    validatorRights: damlTypes.Map(damlTypes.Party, damlTypes.ContractId(Splice_Amulet.ValidatorRight)).encode(__typed__.validatorRights),
  };
}
,
};



exports.RewardsIssuanceConfig = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({issueAppRewards: damlTypes.Bool.decoder, issueValidatorRewards: damlTypes.Bool.decoder, }); }),
  encode: function (__typed__) {
  return {
    issueAppRewards: damlTypes.Bool.encode(__typed__.issueAppRewards),
    issueValidatorRewards: damlTypes.Bool.encode(__typed__.issueValidatorRewards),
  };
}
,
};



exports.InvalidTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: exports.InvalidTransferReason.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: exports.InvalidTransferReason.encode(__typed__.reason),
  };
}
,
};



exports.InvalidTransferReason = {
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.object({tag: jtv.constant('ITR_InsufficientFunds'), value: exports.InvalidTransferReason.ITR_InsufficientFunds.decoder, }), jtv.object({tag: jtv.constant('ITR_UnknownSynchronizer'), value: exports.InvalidTransferReason.ITR_UnknownSynchronizer.decoder, }), jtv.object({tag: jtv.constant('ITR_InsufficientTopupAmount'), value: exports.InvalidTransferReason.ITR_InsufficientTopupAmount.decoder, }), jtv.object({tag: jtv.constant('ITR_Other'), value: exports.InvalidTransferReason.ITR_Other.decoder, }), jtv.object({tag: jtv.constant('ExtInvalidTransferReason'), value: exports.InvalidTransferReason.ExtInvalidTransferReason.decoder, })); }),
  encode: function (__typed__) {
  switch(__typed__.tag) {
    case 'ITR_InsufficientFunds': return {tag: __typed__.tag, value: exports.InvalidTransferReason.ITR_InsufficientFunds.encode(__typed__.value)};
    case 'ITR_UnknownSynchronizer': return {tag: __typed__.tag, value: exports.InvalidTransferReason.ITR_UnknownSynchronizer.encode(__typed__.value)};
    case 'ITR_InsufficientTopupAmount': return {tag: __typed__.tag, value: exports.InvalidTransferReason.ITR_InsufficientTopupAmount.encode(__typed__.value)};
    case 'ITR_Other': return {tag: __typed__.tag, value: exports.InvalidTransferReason.ITR_Other.encode(__typed__.value)};
    case 'ExtInvalidTransferReason': return {tag: __typed__.tag, value: exports.InvalidTransferReason.ExtInvalidTransferReason.encode(__typed__.value)};
    default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type InvalidTransferReason';
  }
}
,
  ITR_InsufficientFunds:({
    decoder: damlTypes.lazyMemo(function () { return jtv.object({missingAmount: damlTypes.Numeric(10).decoder, }); }),
    encode: function (__typed__) {
  return {
    missingAmount: damlTypes.Numeric(10).encode(__typed__.missingAmount),
  };
}
,
  }),
  ITR_UnknownSynchronizer:({
    decoder: damlTypes.lazyMemo(function () { return jtv.object({synchronizerId: damlTypes.Text.decoder, }); }),
    encode: function (__typed__) {
  return {
    synchronizerId: damlTypes.Text.encode(__typed__.synchronizerId),
  };
}
,
  }),
  ITR_InsufficientTopupAmount:({
    decoder: damlTypes.lazyMemo(function () { return jtv.object({requestedTopupAmount: damlTypes.Int.decoder, minTopupAmount: damlTypes.Int.decoder, }); }),
    encode: function (__typed__) {
  return {
    requestedTopupAmount: damlTypes.Int.encode(__typed__.requestedTopupAmount),
    minTopupAmount: damlTypes.Int.encode(__typed__.minTopupAmount),
  };
}
,
  }),
  ITR_Other:({
    decoder: damlTypes.lazyMemo(function () { return jtv.object({description: damlTypes.Text.decoder, }); }),
    encode: function (__typed__) {
  return {
    description: damlTypes.Text.encode(__typed__.description),
  };
}
,
  }),
  ExtInvalidTransferReason:({
    decoder: damlTypes.lazyMemo(function () { return jtv.object({dummyUnitField: damlTypes.Unit.decoder, }); }),
    encode: function (__typed__) {
  return {
    dummyUnitField: damlTypes.Unit.encode(__typed__.dummyUnitField),
  };
}
,
  }),
};













exports.AmuletRules_ConvertFeaturedAppActivityMarkers = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({markerCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.FeaturedAppActivityMarker)).decoder, openMiningRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, observers: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.List(damlTypes.Party)).decoder), }); }),
  encode: function (__typed__) {
  return {
    markerCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.FeaturedAppActivityMarker)).encode(__typed__.markerCids),
    openMiningRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.openMiningRoundCid),
    observers: damlTypes.Optional(damlTypes.List(damlTypes.Party)).encode(__typed__.observers),
  };
}
,
};



exports.AmuletRules_UpdateFutureAmuletConfigSchedule = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({scheduleItem: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Time, Splice_AmuletConfig.AmuletConfig(Splice_AmuletConfig.USD)).decoder, }); }),
  encode: function (__typed__) {
  return {
    scheduleItem: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Time, Splice_AmuletConfig.AmuletConfig(Splice_AmuletConfig.USD)).encode(__typed__.scheduleItem),
  };
}
,
};



exports.AmuletRules_RemoveFutureAmuletConfigSchedule = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({scheduleTime: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    scheduleTime: damlTypes.Time.encode(__typed__.scheduleTime),
  };
}
,
};



exports.AmuletRules_AddFutureAmuletConfigSchedule = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newScheduleItem: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Time, Splice_AmuletConfig.AmuletConfig(Splice_AmuletConfig.USD)).decoder, }); }),
  encode: function (__typed__) {
  return {
    newScheduleItem: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Time, Splice_AmuletConfig.AmuletConfig(Splice_AmuletConfig.USD)).encode(__typed__.newScheduleItem),
  };
}
,
};



exports.AmuletRules_SetConfig = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newConfig: Splice_AmuletConfig.AmuletConfig(Splice_AmuletConfig.USD).decoder, baseConfig: Splice_AmuletConfig.AmuletConfig(Splice_AmuletConfig.USD).decoder, }); }),
  encode: function (__typed__) {
  return {
    newConfig: Splice_AmuletConfig.AmuletConfig(Splice_AmuletConfig.USD).encode(__typed__.newConfig),
    baseConfig: Splice_AmuletConfig.AmuletConfig(Splice_AmuletConfig.USD).encode(__typed__.baseConfig),
  };
}
,
};



exports.AmuletRules_Fetch = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({p: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    p: damlTypes.Party.encode(__typed__.p),
  };
}
,
};



exports.AmuletRules_AllocateDevelopmentFundCoupon = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unclaimedDevelopmentFundCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.UnclaimedDevelopmentFundCoupon)).decoder, beneficiary: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, expiresAt: damlTypes.Time.decoder, reason: damlTypes.Text.decoder, fundManager: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    unclaimedDevelopmentFundCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.UnclaimedDevelopmentFundCoupon)).encode(__typed__.unclaimedDevelopmentFundCouponCids),
    beneficiary: damlTypes.Party.encode(__typed__.beneficiary),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    expiresAt: damlTypes.Time.encode(__typed__.expiresAt),
    reason: damlTypes.Text.encode(__typed__.reason),
    fundManager: damlTypes.Party.encode(__typed__.fundManager),
  };
}
,
};



exports.AmuletRules_MergeUnclaimedDevelopmentFundCoupons = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unclaimedDevelopmentFundCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.UnclaimedDevelopmentFundCoupon)).decoder, }); }),
  encode: function (__typed__) {
  return {
    unclaimedDevelopmentFundCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.UnclaimedDevelopmentFundCoupon)).encode(__typed__.unclaimedDevelopmentFundCouponCids),
  };
}
,
};



exports.AmuletRules_MergeUnclaimedRewards = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unclaimedRewardCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.UnclaimedReward)).decoder, }); }),
  encode: function (__typed__) {
  return {
    unclaimedRewardCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.UnclaimedReward)).encode(__typed__.unclaimedRewardCids),
  };
}
,
};



exports.AmuletRules_ClaimExpiredRewards = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).decoder, validatorRewardCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.ValidatorRewardCoupon)).decoder, appCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.AppRewardCoupon)).decoder, svRewardCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.SvRewardCoupon)).decoder, optValidatorFaucetCouponCids: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.List(damlTypes.ContractId(Splice_ValidatorLicense.ValidatorFaucetCoupon))).decoder), optValidatorLivenessActivityRecordCids: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.List(damlTypes.ContractId(Splice_ValidatorLicense.ValidatorLivenessActivityRecord))).decoder), }); }),
  encode: function (__typed__) {
  return {
    closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).encode(__typed__.closedRoundCid),
    validatorRewardCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.ValidatorRewardCoupon)).encode(__typed__.validatorRewardCouponCids),
    appCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.AppRewardCoupon)).encode(__typed__.appCouponCids),
    svRewardCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.SvRewardCoupon)).encode(__typed__.svRewardCouponCids),
    optValidatorFaucetCouponCids: damlTypes.Optional(damlTypes.List(damlTypes.ContractId(Splice_ValidatorLicense.ValidatorFaucetCoupon))).encode(__typed__.optValidatorFaucetCouponCids),
    optValidatorLivenessActivityRecordCids: damlTypes.Optional(damlTypes.List(damlTypes.ContractId(Splice_ValidatorLicense.ValidatorLivenessActivityRecord))).encode(__typed__.optValidatorLivenessActivityRecordCids),
  };
}
,
};



exports.AmuletRules_MiningRound_Archive = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).encode(__typed__.closedRoundCid),
  };
}
,
};



exports.AmuletRules_MiningRound_Close = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({issuingRoundCid: damlTypes.ContractId(Splice_Round.IssuingMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    issuingRoundCid: damlTypes.ContractId(Splice_Round.IssuingMiningRound).encode(__typed__.issuingRoundCid),
  };
}
,
};



exports.AmuletRules_MiningRound_StartIssuing = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({miningRoundCid: damlTypes.ContractId(Splice_Round.SummarizingMiningRound).decoder, summary: Splice_Issuance.OpenMiningRoundSummary.decoder, }); }),
  encode: function (__typed__) {
  return {
    miningRoundCid: damlTypes.ContractId(Splice_Round.SummarizingMiningRound).encode(__typed__.miningRoundCid),
    summary: Splice_Issuance.OpenMiningRoundSummary.encode(__typed__.summary),
  };
}
,
};



exports.AmuletRules_AdvanceOpenMiningRounds = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amuletPrice: damlTypes.Numeric(10).decoder, roundToArchiveCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, middleRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, latestRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    amuletPrice: damlTypes.Numeric(10).encode(__typed__.amuletPrice),
    roundToArchiveCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.roundToArchiveCid),
    middleRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.middleRoundCid),
    latestRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.latestRoundCid),
  };
}
,
};



exports.AmuletRules_Bootstrap_Rounds = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amuletPrice: damlTypes.Numeric(10).decoder, round0Duration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder, initialRound: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Int).decoder), }); }),
  encode: function (__typed__) {
  return {
    amuletPrice: damlTypes.Numeric(10).encode(__typed__.amuletPrice),
    round0Duration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.round0Duration),
    initialRound: damlTypes.Optional(damlTypes.Int).encode(__typed__.initialRound),
  };
}
,
};



exports.AmuletRules_DevNet_FeatureApp = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({provider: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    provider: damlTypes.Party.encode(__typed__.provider),
  };
}
,
};



exports.AmuletRules_DevNet_Tap = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({receiver: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, openRound: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    receiver: damlTypes.Party.encode(__typed__.receiver),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    openRound: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.openRound),
  };
}
,
};



exports.AmuletRules_Mint = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({receiver: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, openRound: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    receiver: damlTypes.Party.encode(__typed__.receiver),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    openRound: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.openRound),
  };
}
,
};



exports.AmuletRules_MergeMemberTrafficContracts = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({trafficCids: damlTypes.List(damlTypes.ContractId(Splice_DecentralizedSynchronizer.MemberTraffic)).decoder, }); }),
  encode: function (__typed__) {
  return {
    trafficCids: damlTypes.List(damlTypes.ContractId(Splice_DecentralizedSynchronizer.MemberTraffic)).encode(__typed__.trafficCids),
  };
}
,
};



exports.AmuletRules_BuyMemberTraffic = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({inputs: damlTypes.List(exports.TransferInput).decoder, context: exports.TransferContext.decoder, provider: damlTypes.Party.decoder, memberId: damlTypes.Text.decoder, synchronizerId: damlTypes.Text.decoder, migrationId: damlTypes.Int.decoder, trafficAmount: damlTypes.Int.decoder, expectedDso: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), }); }),
  encode: function (__typed__) {
  return {
    inputs: damlTypes.List(exports.TransferInput).encode(__typed__.inputs),
    context: exports.TransferContext.encode(__typed__.context),
    provider: damlTypes.Party.encode(__typed__.provider),
    memberId: damlTypes.Text.encode(__typed__.memberId),
    synchronizerId: damlTypes.Text.encode(__typed__.synchronizerId),
    migrationId: damlTypes.Int.encode(__typed__.migrationId),
    trafficAmount: damlTypes.Int.encode(__typed__.trafficAmount),
    expectedDso: damlTypes.Optional(damlTypes.Party).encode(__typed__.expectedDso),
  };
}
,
};



exports.AmuletRules_CreateTransferPreapproval = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({context: exports.PaymentTransferContext.decoder, inputs: damlTypes.List(exports.TransferInput).decoder, receiver: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, expiresAt: damlTypes.Time.decoder, expectedDso: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), }); }),
  encode: function (__typed__) {
  return {
    context: exports.PaymentTransferContext.encode(__typed__.context),
    inputs: damlTypes.List(exports.TransferInput).encode(__typed__.inputs),
    receiver: damlTypes.Party.encode(__typed__.receiver),
    provider: damlTypes.Party.encode(__typed__.provider),
    expiresAt: damlTypes.Time.encode(__typed__.expiresAt),
    expectedDso: damlTypes.Optional(damlTypes.Party).encode(__typed__.expectedDso),
  };
}
,
};



exports.AmuletRules_CreateExternalPartySetupProposal = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({context: exports.PaymentTransferContext.decoder, inputs: damlTypes.List(exports.TransferInput).decoder, user: damlTypes.Party.decoder, validator: damlTypes.Party.decoder, preapprovalExpiresAt: damlTypes.Time.decoder, expectedDso: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), }); }),
  encode: function (__typed__) {
  return {
    context: exports.PaymentTransferContext.encode(__typed__.context),
    inputs: damlTypes.List(exports.TransferInput).encode(__typed__.inputs),
    user: damlTypes.Party.encode(__typed__.user),
    validator: damlTypes.Party.encode(__typed__.validator),
    preapprovalExpiresAt: damlTypes.Time.encode(__typed__.preapprovalExpiresAt),
    expectedDso: damlTypes.Optional(damlTypes.Party).encode(__typed__.expectedDso),
  };
}
,
};



exports.AmuletRules_Transfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transfer: exports.Transfer.decoder, context: exports.TransferContext.decoder, expectedDso: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), }); }),
  encode: function (__typed__) {
  return {
    transfer: exports.Transfer.encode(__typed__.transfer),
    context: exports.TransferContext.encode(__typed__.context),
    expectedDso: damlTypes.Optional(damlTypes.Party).encode(__typed__.expectedDso),
  };
}
,
};



exports.AmuletRules_ComputeFees = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({context: exports.TransferContext.decoder, sender: damlTypes.Party.decoder, outputs: damlTypes.List(exports.TransferOutput).decoder, expectedDso: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), }); }),
  encode: function (__typed__) {
  return {
    context: exports.TransferContext.encode(__typed__.context),
    sender: damlTypes.Party.encode(__typed__.sender),
    outputs: damlTypes.List(exports.TransferOutput).encode(__typed__.outputs),
    expectedDso: damlTypes.Optional(damlTypes.Party).encode(__typed__.expectedDso),
  };
}
,
};



exports.AmuletRules = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.AmuletRules:AmuletRules',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.AmuletRules:AmuletRules',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, configSchedule: Splice_Schedule.Schedule(damlTypes.Time, Splice_AmuletConfig.AmuletConfig(Splice_AmuletConfig.USD)).decoder, isDevNet: damlTypes.Bool.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    configSchedule: Splice_Schedule.Schedule(damlTypes.Time, Splice_AmuletConfig.AmuletConfig(Splice_AmuletConfig.USD)).encode(__typed__.configSchedule),
    isDevNet: damlTypes.Bool.encode(__typed__.isDevNet),
  };
}
,
  AmuletRules_ComputeFees: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_ComputeFees',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_ComputeFees.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_ComputeFees.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_ComputeFeesResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_ComputeFeesResult.encode(__typed__); },
  },
  AmuletRules_Transfer: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_Transfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_Transfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_Transfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferResult.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferResult.encode(__typed__); },
  },
  AmuletRules_CreateExternalPartySetupProposal: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_CreateExternalPartySetupProposal',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_CreateExternalPartySetupProposal.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_CreateExternalPartySetupProposal.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_CreateExternalPartySetupProposalResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_CreateExternalPartySetupProposalResult.encode(__typed__); },
  },
  AmuletRules_CreateTransferPreapproval: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_CreateTransferPreapproval',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_CreateTransferPreapproval.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_CreateTransferPreapproval.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_CreateTransferPreapprovalResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_CreateTransferPreapprovalResult.encode(__typed__); },
  },
  AmuletRules_BuyMemberTraffic: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_BuyMemberTraffic',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_BuyMemberTraffic.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_BuyMemberTraffic.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_BuyMemberTrafficResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_BuyMemberTrafficResult.encode(__typed__); },
  },
  AmuletRules_MergeMemberTrafficContracts: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_MergeMemberTrafficContracts',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MergeMemberTrafficContracts.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_MergeMemberTrafficContracts.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MergeMemberTrafficContractsResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_MergeMemberTrafficContractsResult.encode(__typed__); },
  },
  AmuletRules_Mint: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_Mint',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_Mint.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_Mint.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MintResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_MintResult.encode(__typed__); },
  },
  AmuletRules_DevNet_Tap: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_DevNet_Tap',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_DevNet_Tap.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_DevNet_Tap.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_DevNet_TapResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_DevNet_TapResult.encode(__typed__); },
  },
  AmuletRules_DevNet_FeatureApp: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_DevNet_FeatureApp',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_DevNet_FeatureApp.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_DevNet_FeatureApp.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_DevNet_FeatureAppResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_DevNet_FeatureAppResult.encode(__typed__); },
  },
  AmuletRules_Bootstrap_Rounds: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_Bootstrap_Rounds',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_Bootstrap_Rounds.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_Bootstrap_Rounds.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_Bootstrap_RoundsResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_Bootstrap_RoundsResult.encode(__typed__); },
  },
  AmuletRules_AdvanceOpenMiningRounds: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_AdvanceOpenMiningRounds',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_AdvanceOpenMiningRounds.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_AdvanceOpenMiningRounds.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_AdvanceOpenMiningRoundsResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_AdvanceOpenMiningRoundsResult.encode(__typed__); },
  },
  AmuletRules_MiningRound_StartIssuing: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_MiningRound_StartIssuing',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MiningRound_StartIssuing.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_MiningRound_StartIssuing.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MiningRound_StartIssuingResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_MiningRound_StartIssuingResult.encode(__typed__); },
  },
  AmuletRules_MiningRound_Close: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_MiningRound_Close',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MiningRound_Close.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_MiningRound_Close.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MiningRound_CloseResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_MiningRound_CloseResult.encode(__typed__); },
  },
  AmuletRules_MiningRound_Archive: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_MiningRound_Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MiningRound_Archive.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_MiningRound_Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MiningRound_ArchiveResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_MiningRound_ArchiveResult.encode(__typed__); },
  },
  AmuletRules_ClaimExpiredRewards: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_ClaimExpiredRewards',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_ClaimExpiredRewards.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_ClaimExpiredRewards.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_ClaimExpiredRewardsResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_ClaimExpiredRewardsResult.encode(__typed__); },
  },
  AmuletRules_MergeUnclaimedRewards: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_MergeUnclaimedRewards',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MergeUnclaimedRewards.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_MergeUnclaimedRewards.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MergeUnclaimedRewardsResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_MergeUnclaimedRewardsResult.encode(__typed__); },
  },
  AmuletRules_MergeUnclaimedDevelopmentFundCoupons: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_MergeUnclaimedDevelopmentFundCoupons',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MergeUnclaimedDevelopmentFundCoupons.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_MergeUnclaimedDevelopmentFundCoupons.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_MergeUnclaimedDevelopmentFundCouponsResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_MergeUnclaimedDevelopmentFundCouponsResult.encode(__typed__); },
  },
  AmuletRules_AllocateDevelopmentFundCoupon: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_AllocateDevelopmentFundCoupon',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_AllocateDevelopmentFundCoupon.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_AllocateDevelopmentFundCoupon.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_AllocateDevelopmentFundCouponResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_AllocateDevelopmentFundCouponResult.encode(__typed__); },
  },
  AmuletRules_SetConfig: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_SetConfig',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_SetConfig.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_SetConfig.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_SetConfigResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_SetConfigResult.encode(__typed__); },
  },
  AmuletRules_ConvertFeaturedAppActivityMarkers: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_ConvertFeaturedAppActivityMarkers',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_ConvertFeaturedAppActivityMarkers.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_ConvertFeaturedAppActivityMarkers.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_ConvertFeaturedAppActivityMarkersResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_ConvertFeaturedAppActivityMarkersResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  AmuletRules_Fetch: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_Fetch',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_Fetch.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_Fetch.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules.encode(__typed__); },
  },
  AmuletRules_AddFutureAmuletConfigSchedule: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_AddFutureAmuletConfigSchedule',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_AddFutureAmuletConfigSchedule.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_AddFutureAmuletConfigSchedule.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_AddFutureAmuletConfigScheduleResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_AddFutureAmuletConfigScheduleResult.encode(__typed__); },
  },
  AmuletRules_RemoveFutureAmuletConfigSchedule: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_RemoveFutureAmuletConfigSchedule',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_RemoveFutureAmuletConfigSchedule.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_RemoveFutureAmuletConfigSchedule.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_RemoveFutureAmuletConfigScheduleResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_RemoveFutureAmuletConfigScheduleResult.encode(__typed__); },
  },
  AmuletRules_UpdateFutureAmuletConfigSchedule: {
    template: function () { return exports.AmuletRules; },
    choiceName: 'AmuletRules_UpdateFutureAmuletConfigSchedule',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_UpdateFutureAmuletConfigSchedule.decoder; }),
    argumentEncode: function (__typed__) { return exports.AmuletRules_UpdateFutureAmuletConfigSchedule.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AmuletRules_UpdateFutureAmuletConfigScheduleResult.decoder; }),
    resultEncode: function (__typed__) { return exports.AmuletRules_UpdateFutureAmuletConfigScheduleResult.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.AmuletRules, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.AmuletRules_ConvertFeaturedAppActivityMarkersResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({appRewardCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.AppRewardCoupon)).decoder, }); }),
  encode: function (__typed__) {
  return {
    appRewardCouponCids: damlTypes.List(damlTypes.ContractId(Splice_Amulet.AppRewardCoupon)).encode(__typed__.appRewardCouponCids),
  };
}
,
};



exports.AmuletRules_UpdateFutureAmuletConfigScheduleResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newAmuletRules: damlTypes.ContractId(exports.AmuletRules).decoder, }); }),
  encode: function (__typed__) {
  return {
    newAmuletRules: damlTypes.ContractId(exports.AmuletRules).encode(__typed__.newAmuletRules),
  };
}
,
};



exports.AmuletRules_RemoveFutureAmuletConfigScheduleResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newAmuletRules: damlTypes.ContractId(exports.AmuletRules).decoder, }); }),
  encode: function (__typed__) {
  return {
    newAmuletRules: damlTypes.ContractId(exports.AmuletRules).encode(__typed__.newAmuletRules),
  };
}
,
};



exports.AmuletRules_AddFutureAmuletConfigScheduleResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newAmuletRules: damlTypes.ContractId(exports.AmuletRules).decoder, }); }),
  encode: function (__typed__) {
  return {
    newAmuletRules: damlTypes.ContractId(exports.AmuletRules).encode(__typed__.newAmuletRules),
  };
}
,
};



exports.AmuletRules_SetConfigResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newAmuletRules: damlTypes.ContractId(exports.AmuletRules).decoder, }); }),
  encode: function (__typed__) {
  return {
    newAmuletRules: damlTypes.ContractId(exports.AmuletRules).encode(__typed__.newAmuletRules),
  };
}
,
};



exports.AmuletRules_AllocateDevelopmentFundCouponResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({developmentFundCouponCid: damlTypes.ContractId(Splice_Amulet.DevelopmentFundCoupon).decoder, optUnclaimedDevelopmentFundCouponCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.UnclaimedDevelopmentFundCoupon)).decoder), }); }),
  encode: function (__typed__) {
  return {
    developmentFundCouponCid: damlTypes.ContractId(Splice_Amulet.DevelopmentFundCoupon).encode(__typed__.developmentFundCouponCid),
    optUnclaimedDevelopmentFundCouponCid: damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.UnclaimedDevelopmentFundCoupon)).encode(__typed__.optUnclaimedDevelopmentFundCouponCid),
  };
}
,
};



exports.AmuletRules_MergeUnclaimedDevelopmentFundCouponsResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unclaimedDevelopmentFundCouponCid: damlTypes.ContractId(Splice_Amulet.UnclaimedDevelopmentFundCoupon).decoder, }); }),
  encode: function (__typed__) {
  return {
    unclaimedDevelopmentFundCouponCid: damlTypes.ContractId(Splice_Amulet.UnclaimedDevelopmentFundCoupon).encode(__typed__.unclaimedDevelopmentFundCouponCid),
  };
}
,
};



exports.AmuletRules_MergeUnclaimedRewardsResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unclaimedRewardCid: damlTypes.ContractId(Splice_Amulet.UnclaimedReward).decoder, }); }),
  encode: function (__typed__) {
  return {
    unclaimedRewardCid: damlTypes.ContractId(Splice_Amulet.UnclaimedReward).encode(__typed__.unclaimedRewardCid),
  };
}
,
};



exports.AmuletRules_ClaimExpiredRewardsResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({unclaimedRewardCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.UnclaimedReward)).decoder), }); }),
  encode: function (__typed__) {
  return {
    unclaimedRewardCid: damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.UnclaimedReward)).encode(__typed__.unclaimedRewardCid),
  };
}
,
};



exports.AmuletRules_MiningRound_ArchiveResult = {
  AmuletRules_MiningRound_ArchiveResult: 'AmuletRules_MiningRound_ArchiveResult',
  keys: ['AmuletRules_MiningRound_ArchiveResult',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.AmuletRules_MiningRound_ArchiveResult.AmuletRules_MiningRound_ArchiveResult)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.AmuletRules_MiningRound_CloseResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    closedRoundCid: damlTypes.ContractId(Splice_Round.ClosedMiningRound).encode(__typed__.closedRoundCid),
  };
}
,
};



exports.AmuletRules_MiningRound_StartIssuingResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({issuingRoundCid: damlTypes.ContractId(Splice_Round.IssuingMiningRound).decoder, unclaimedDevelopmentFundCouponCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.UnclaimedDevelopmentFundCoupon)).decoder), }); }),
  encode: function (__typed__) {
  return {
    issuingRoundCid: damlTypes.ContractId(Splice_Round.IssuingMiningRound).encode(__typed__.issuingRoundCid),
    unclaimedDevelopmentFundCouponCid: damlTypes.Optional(damlTypes.ContractId(Splice_Amulet.UnclaimedDevelopmentFundCoupon)).encode(__typed__.unclaimedDevelopmentFundCouponCid),
  };
}
,
};



exports.AmuletRules_AdvanceOpenMiningRoundsResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({summarizingRoundCid: damlTypes.ContractId(Splice_Round.SummarizingMiningRound).decoder, openRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, }); }),
  encode: function (__typed__) {
  return {
    summarizingRoundCid: damlTypes.ContractId(Splice_Round.SummarizingMiningRound).encode(__typed__.summarizingRoundCid),
    openRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.openRoundCid),
  };
}
,
};



exports.AmuletRules_Bootstrap_RoundsResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({openMiningRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).decoder, initialRound: jtv.Decoder.withDefault(null, damlTypes.Optional(Splice_Types.Round).decoder), }); }),
  encode: function (__typed__) {
  return {
    openMiningRoundCid: damlTypes.ContractId(Splice_Round.OpenMiningRound).encode(__typed__.openMiningRoundCid),
    initialRound: damlTypes.Optional(Splice_Types.Round).encode(__typed__.initialRound),
  };
}
,
};



exports.AmuletRules_DevNet_FeatureAppResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({featuredAppRightCid: damlTypes.ContractId(Splice_Amulet.FeaturedAppRight).decoder, }); }),
  encode: function (__typed__) {
  return {
    featuredAppRightCid: damlTypes.ContractId(Splice_Amulet.FeaturedAppRight).encode(__typed__.featuredAppRightCid),
  };
}
,
};



exports.AmuletRules_DevNet_TapResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amuletSum: Splice_Amulet.AmuletCreateSummary(damlTypes.ContractId(Splice_Amulet.Amulet)).decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    amuletSum: Splice_Amulet.AmuletCreateSummary(damlTypes.ContractId(Splice_Amulet.Amulet)).encode(__typed__.amuletSum),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.AmuletRules_MintResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amuletSum: Splice_Amulet.AmuletCreateSummary(damlTypes.ContractId(Splice_Amulet.Amulet)).decoder, }); }),
  encode: function (__typed__) {
  return {
    amuletSum: Splice_Amulet.AmuletCreateSummary(damlTypes.ContractId(Splice_Amulet.Amulet)).encode(__typed__.amuletSum),
  };
}
,
};



exports.AmuletRules_MergeMemberTrafficContractsResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({mergedTrafficCid: damlTypes.ContractId(Splice_DecentralizedSynchronizer.MemberTraffic).decoder, }); }),
  encode: function (__typed__) {
  return {
    mergedTrafficCid: damlTypes.ContractId(Splice_DecentralizedSynchronizer.MemberTraffic).encode(__typed__.mergedTrafficCid),
  };
}
,
};



exports.AmuletRules_ComputeFeesResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({fees: damlTypes.List(damlTypes.Numeric(10)).decoder, }); }),
  encode: function (__typed__) {
  return {
    fees: damlTypes.List(damlTypes.Numeric(10)).encode(__typed__.fees),
  };
}
,
};

