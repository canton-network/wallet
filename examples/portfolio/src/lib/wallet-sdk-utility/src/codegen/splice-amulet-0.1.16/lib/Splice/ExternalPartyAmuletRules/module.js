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

var pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520 = require('@daml.js/splice-api-token-allocation-instruction-v1-1.0.0');
var pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 = require('@daml.js/splice-api-token-transfer-instruction-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

var Splice_AmuletRules = require('../../Splice/AmuletRules/module');


exports.TransferCommand_ExpireResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({sender: damlTypes.Party.decoder, nonce: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    sender: damlTypes.Party.encode(__typed__.sender),
    nonce: damlTypes.Int.encode(__typed__.nonce),
  };
}
,
};



exports.TransferCommand_WithdrawResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({sender: damlTypes.Party.decoder, nonce: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    sender: damlTypes.Party.encode(__typed__.sender),
    nonce: damlTypes.Int.encode(__typed__.nonce),
  };
}
,
};



exports.TransferCommandResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.object({tag: jtv.constant('TransferCommandResultFailure'), value: exports.TransferCommandResult.TransferCommandResultFailure.decoder, }), jtv.object({tag: jtv.constant('TransferCommandResultSuccess'), value: exports.TransferCommandResult.TransferCommandResultSuccess.decoder, })); }),
  encode: function (__typed__) {
  switch(__typed__.tag) {
    case 'TransferCommandResultFailure': return {tag: __typed__.tag, value: exports.TransferCommandResult.TransferCommandResultFailure.encode(__typed__.value)};
    case 'TransferCommandResultSuccess': return {tag: __typed__.tag, value: exports.TransferCommandResult.TransferCommandResultSuccess.encode(__typed__.value)};
    default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type TransferCommandResult';
  }
}
,
  TransferCommandResultFailure:({
    decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: Splice_AmuletRules.InvalidTransferReason.decoder, }); }),
    encode: function (__typed__) {
  return {
    reason: Splice_AmuletRules.InvalidTransferReason.encode(__typed__.reason),
  };
}
,
  }),
  TransferCommandResultSuccess:({
    decoder: damlTypes.lazyMemo(function () { return jtv.object({result: Splice_AmuletRules.TransferResult.decoder, }); }),
    encode: function (__typed__) {
  return {
    result: Splice_AmuletRules.TransferResult.encode(__typed__.result),
  };
}
,
  }),
};







exports.TransferCommand_SendResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({result: exports.TransferCommandResult.decoder, sender: damlTypes.Party.decoder, nonce: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    result: exports.TransferCommandResult.encode(__typed__.result),
    sender: damlTypes.Party.encode(__typed__.sender),
    nonce: damlTypes.Int.encode(__typed__.nonce),
  };
}
,
};



exports.TransferCommand_Expire = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({p: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    p: damlTypes.Party.encode(__typed__.p),
  };
}
,
};



exports.TransferCommand_Withdraw = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.TransferCommand_Send = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({context: Splice_AmuletRules.PaymentTransferContext.decoder, inputs: damlTypes.List(Splice_AmuletRules.TransferInput).decoder, transferPreapprovalCidO: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(Splice_AmuletRules.TransferPreapproval)).decoder), transferCounterCid: damlTypes.ContractId(exports.TransferCommandCounter).decoder, }); }),
  encode: function (__typed__) {
  return {
    context: Splice_AmuletRules.PaymentTransferContext.encode(__typed__.context),
    inputs: damlTypes.List(Splice_AmuletRules.TransferInput).encode(__typed__.inputs),
    transferPreapprovalCidO: damlTypes.Optional(damlTypes.ContractId(Splice_AmuletRules.TransferPreapproval)).encode(__typed__.transferPreapprovalCidO),
    transferCounterCid: damlTypes.ContractId(exports.TransferCommandCounter).encode(__typed__.transferCounterCid),
  };
}
,
};



exports.TransferCommand = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.ExternalPartyAmuletRules:TransferCommand',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.ExternalPartyAmuletRules:TransferCommand',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, sender: damlTypes.Party.decoder, receiver: damlTypes.Party.decoder, delegate: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, expiresAt: damlTypes.Time.decoder, nonce: damlTypes.Int.decoder, description: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Text).decoder), }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    sender: damlTypes.Party.encode(__typed__.sender),
    receiver: damlTypes.Party.encode(__typed__.receiver),
    delegate: damlTypes.Party.encode(__typed__.delegate),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    expiresAt: damlTypes.Time.encode(__typed__.expiresAt),
    nonce: damlTypes.Int.encode(__typed__.nonce),
    description: damlTypes.Optional(damlTypes.Text).encode(__typed__.description),
  };
}
,
  TransferCommand_Expire: {
    template: function () { return exports.TransferCommand; },
    choiceName: 'TransferCommand_Expire',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferCommand_Expire.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferCommand_Expire.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferCommand_ExpireResult.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferCommand_ExpireResult.encode(__typed__); },
  },
  TransferCommand_Send: {
    template: function () { return exports.TransferCommand; },
    choiceName: 'TransferCommand_Send',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferCommand_Send.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferCommand_Send.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferCommand_SendResult.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferCommand_SendResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.TransferCommand; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  TransferCommand_Withdraw: {
    template: function () { return exports.TransferCommand; },
    choiceName: 'TransferCommand_Withdraw',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferCommand_Withdraw.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferCommand_Withdraw.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferCommand_WithdrawResult.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferCommand_WithdrawResult.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.TransferCommand, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.TransferCommandCounter = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.ExternalPartyAmuletRules:TransferCommandCounter',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.ExternalPartyAmuletRules:TransferCommandCounter',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, sender: damlTypes.Party.decoder, nextNonce: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    sender: damlTypes.Party.encode(__typed__.sender),
    nextNonce: damlTypes.Int.encode(__typed__.nextNonce),
  };
}
,
  Archive: {
    template: function () { return exports.TransferCommandCounter; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.TransferCommandCounter, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);



exports.ExternalPartyAmuletRules_CreateTransferCommandResult = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transferCommandCid: damlTypes.ContractId(exports.TransferCommand).decoder, }); }),
  encode: function (__typed__) {
  return {
    transferCommandCid: damlTypes.ContractId(exports.TransferCommand).encode(__typed__.transferCommandCid),
  };
}
,
};



exports.ExternalPartyAmuletRules_CreateTransferCommand = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({sender: damlTypes.Party.decoder, receiver: damlTypes.Party.decoder, delegate: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, expiresAt: damlTypes.Time.decoder, nonce: damlTypes.Int.decoder, description: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Text).decoder), expectedDso: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Party).decoder), }); }),
  encode: function (__typed__) {
  return {
    sender: damlTypes.Party.encode(__typed__.sender),
    receiver: damlTypes.Party.encode(__typed__.receiver),
    delegate: damlTypes.Party.encode(__typed__.delegate),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    expiresAt: damlTypes.Time.encode(__typed__.expiresAt),
    nonce: damlTypes.Int.encode(__typed__.nonce),
    description: damlTypes.Optional(damlTypes.Text).encode(__typed__.description),
    expectedDso: damlTypes.Optional(damlTypes.Party).encode(__typed__.expectedDso),
  };
}
,
};



exports.ExternalPartyAmuletRules = damlTypes.assembleTemplate(
{
  templateId: '#splice-amulet:Splice.ExternalPartyAmuletRules:ExternalPartyAmuletRules',
  templateIdWithPackageId: 'c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23:Splice.ExternalPartyAmuletRules:ExternalPartyAmuletRules',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
  };
}
,
  ExternalPartyAmuletRules_CreateTransferCommand: {
    template: function () { return exports.ExternalPartyAmuletRules; },
    choiceName: 'ExternalPartyAmuletRules_CreateTransferCommand',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExternalPartyAmuletRules_CreateTransferCommand.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExternalPartyAmuletRules_CreateTransferCommand.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExternalPartyAmuletRules_CreateTransferCommandResult.decoder; }),
    resultEncode: function (__typed__) { return exports.ExternalPartyAmuletRules_CreateTransferCommandResult.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ExternalPartyAmuletRules; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

, pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferFactory
, pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory
);


damlTypes.registerTemplate(exports.ExternalPartyAmuletRules, ['c208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23', '#splice-amulet']);

