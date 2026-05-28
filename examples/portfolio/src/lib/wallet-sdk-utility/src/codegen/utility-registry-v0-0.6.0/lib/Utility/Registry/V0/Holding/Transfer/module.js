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
var pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70 = require('@daml.js/utility-credential-v0-0.1.0');
var pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 = require('@daml.js/utility-registry-holding-v0-0.2.1');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff = require('@daml.js/daml-stdlib-DA-Set-Types-1.0.0');

var Utility_Registry_V0_Configuration_Instrument = require('../../../../../Utility/Registry/V0/Configuration/Instrument/module');
var Utility_Registry_V0_Types = require('../../../../../Utility/Registry/V0/Types/module');


exports.ExecutedTransfer_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedTransfer_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedTransfer_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.AcceptedTransfer_Fail_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({failedTransferCid: damlTypes.ContractId(exports.FailedTransfer).decoder, }); }),
  encode: function (__typed__) {
  return {
    failedTransferCid: damlTypes.ContractId(exports.FailedTransfer).encode(__typed__.failedTransferCid),
  };
}
,
};



exports.AcceptedTransfer_Execute_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingTransferResult: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Transfer_Result.decoder, executedTransferCid: damlTypes.ContractId(exports.ExecutedTransfer).decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    holdingTransferResult: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Transfer_Result.encode(__typed__.holdingTransferResult),
    executedTransferCid: damlTypes.ContractId(exports.ExecutedTransfer).encode(__typed__.executedTransferCid),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.TransferRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.TransferRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedTransferCid: damlTypes.ContractId(exports.RejectedTransfer).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedTransferCid: damlTypes.ContractId(exports.RejectedTransfer).encode(__typed__.rejectedTransferCid),
  };
}
,
};



exports.TransferRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedTransferCid: damlTypes.ContractId(exports.AcceptedTransfer).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedTransferCid: damlTypes.ContractId(exports.AcceptedTransfer).encode(__typed__.acceptedTransferCid),
  };
}
,
};



exports.TransferOffer_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.TransferOffer_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedTransferCid: damlTypes.ContractId(exports.RejectedTransfer).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedTransferCid: damlTypes.ContractId(exports.RejectedTransfer).encode(__typed__.rejectedTransferCid),
  };
}
,
};



exports.TransferOffer_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedTransferCid: damlTypes.ContractId(exports.AcceptedTransfer).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedTransferCid: damlTypes.ContractId(exports.AcceptedTransfer).encode(__typed__.acceptedTransferCid),
  };
}
,
};



exports.ExecutedTransfer_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ExecutedTransfer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:ExecutedTransfer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Transfer:ExecutedTransfer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transfer: exports.Transfer.decoder, senderLabel: damlTypes.Text.decoder, receiverLabel: damlTypes.Text.decoder, observers: jtv.Decoder.withDefault(null, damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).decoder), operatorIsObserver: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    transfer: exports.Transfer.encode(__typed__.transfer),
    senderLabel: damlTypes.Text.encode(__typed__.senderLabel),
    receiverLabel: damlTypes.Text.encode(__typed__.receiverLabel),
    observers: damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).encode(__typed__.observers),
    operatorIsObserver: damlTypes.Optional(damlTypes.Bool).encode(__typed__.operatorIsObserver),
  };
}
,
  Archive: {
    template: function () { return exports.ExecutedTransfer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  ExecutedTransfer_Delete: {
    template: function () { return exports.ExecutedTransfer; },
    choiceName: 'ExecutedTransfer_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedTransfer_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedTransfer_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedTransfer_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ExecutedTransfer_Delete_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ExecutedTransfer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.FailedTransfer_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedTransfer_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.FailedTransfer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:FailedTransfer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Transfer:FailedTransfer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transfer: exports.Transfer.decoder, reason: damlTypes.Text.decoder, observers: jtv.Decoder.withDefault(null, damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).decoder), }); }),
  encode: function (__typed__) {
  return {
    transfer: exports.Transfer.encode(__typed__.transfer),
    reason: damlTypes.Text.encode(__typed__.reason),
    observers: damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).encode(__typed__.observers),
  };
}
,
  FailedTransfer_Clean: {
    template: function () { return exports.FailedTransfer; },
    choiceName: 'FailedTransfer_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FailedTransfer_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.FailedTransfer_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  FailedTransfer_Delete: {
    template: function () { return exports.FailedTransfer; },
    choiceName: 'FailedTransfer_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FailedTransfer_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.FailedTransfer_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.FailedTransfer_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.FailedTransfer_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.FailedTransfer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.FailedTransfer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.RejectedTransfer_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedTransfer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:RejectedTransfer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Transfer:RejectedTransfer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transfer: exports.Transfer.decoder, reason: damlTypes.Text.decoder, observers: jtv.Decoder.withDefault(null, damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).decoder), operatorIsObserver: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    transfer: exports.Transfer.encode(__typed__.transfer),
    reason: damlTypes.Text.encode(__typed__.reason),
    observers: damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).encode(__typed__.observers),
    operatorIsObserver: damlTypes.Optional(damlTypes.Bool).encode(__typed__.operatorIsObserver),
  };
}
,
  RejectedTransfer_Delete: {
    template: function () { return exports.RejectedTransfer; },
    choiceName: 'RejectedTransfer_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedTransfer_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedTransfer_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RejectedTransfer_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RejectedTransfer_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.RejectedTransfer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedTransfer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.AcceptedTransfer_Fail = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.AcceptedTransfer_Execute = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).decoder, senderCredentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, receiverCredentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).encode(__typed__.instrumentConfigurationCid),
    senderCredentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.senderCredentialCids),
    receiverCredentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.receiverCredentialCids),
    holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.holdingCid),
  };
}
,
};



exports.AcceptedTransfer_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.AcceptedTransfer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:AcceptedTransfer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Transfer:AcceptedTransfer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transfer: exports.Transfer.decoder, senderLabel: damlTypes.Text.decoder, receiverLabel: damlTypes.Text.decoder, observers: jtv.Decoder.withDefault(null, damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).decoder), }); }),
  encode: function (__typed__) {
  return {
    transfer: exports.Transfer.encode(__typed__.transfer),
    senderLabel: damlTypes.Text.encode(__typed__.senderLabel),
    receiverLabel: damlTypes.Text.encode(__typed__.receiverLabel),
    observers: damlTypes.Optional(pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party)).encode(__typed__.observers),
  };
}
,
  AcceptedTransfer_Clean: {
    template: function () { return exports.AcceptedTransfer; },
    choiceName: 'AcceptedTransfer_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedTransfer_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedTransfer_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  AcceptedTransfer_Execute: {
    template: function () { return exports.AcceptedTransfer; },
    choiceName: 'AcceptedTransfer_Execute',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedTransfer_Execute.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedTransfer_Execute.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedTransfer_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedTransfer_Execute_Result.encode(__typed__); },
  },
  AcceptedTransfer_Fail: {
    template: function () { return exports.AcceptedTransfer; },
    choiceName: 'AcceptedTransfer_Fail',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedTransfer_Fail.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedTransfer_Fail.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedTransfer_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedTransfer_Fail_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.AcceptedTransfer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.AcceptedTransfer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.TransferRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.TransferRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.TransferRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({senderLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    senderLabel: damlTypes.Text.encode(__typed__.senderLabel),
  };
}
,
};



exports.TransferRequest_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.TransferRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:TransferRequest',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Transfer:TransferRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transfer: exports.Transfer.decoder, receiverLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    transfer: exports.Transfer.encode(__typed__.transfer),
    receiverLabel: damlTypes.Text.encode(__typed__.receiverLabel),
  };
}
,
  TransferRequest_Clean: {
    template: function () { return exports.TransferRequest; },
    choiceName: 'TransferRequest_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferRequest_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferRequest_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  TransferRequest_Accept: {
    template: function () { return exports.TransferRequest; },
    choiceName: 'TransferRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferRequest_Accept_Result.encode(__typed__); },
  },
  TransferRequest_Reject: {
    template: function () { return exports.TransferRequest; },
    choiceName: 'TransferRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferRequest_Reject_Result.encode(__typed__); },
  },
  TransferRequest_Cancel: {
    template: function () { return exports.TransferRequest; },
    choiceName: 'TransferRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferRequest_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.TransferRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.TransferRequest, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.TransferOffer_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.TransferOffer_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.TransferOffer_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({receiverLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    receiverLabel: damlTypes.Text.encode(__typed__.receiverLabel),
  };
}
,
};



exports.TransferOffer_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.TransferOffer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Transfer:TransferOffer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Transfer:TransferOffer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({transfer: exports.Transfer.decoder, senderLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    transfer: exports.Transfer.encode(__typed__.transfer),
    senderLabel: damlTypes.Text.encode(__typed__.senderLabel),
  };
}
,
  TransferOffer_Clean: {
    template: function () { return exports.TransferOffer; },
    choiceName: 'TransferOffer_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferOffer_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferOffer_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  TransferOffer_Accept: {
    template: function () { return exports.TransferOffer; },
    choiceName: 'TransferOffer_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferOffer_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferOffer_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferOffer_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferOffer_Accept_Result.encode(__typed__); },
  },
  TransferOffer_Reject: {
    template: function () { return exports.TransferOffer; },
    choiceName: 'TransferOffer_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferOffer_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferOffer_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferOffer_Reject_Result.encode(__typed__); },
  },
  TransferOffer_Cancel: {
    template: function () { return exports.TransferOffer; },
    choiceName: 'TransferOffer_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TransferOffer_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.TransferOffer_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.TransferOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.TransferOffer_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.TransferOffer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.TransferOffer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.Transfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, sender: damlTypes.Party.decoder, receiver: damlTypes.Party.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, reference: damlTypes.Text.decoder, batch: Utility_Registry_V0_Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    sender: damlTypes.Party.encode(__typed__.sender),
    receiver: damlTypes.Party.encode(__typed__.receiver),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: Utility_Registry_V0_Types.Batch.encode(__typed__.batch),
  };
}
,
};

