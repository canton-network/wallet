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
var pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 = require('@daml.js/utility-registry-holding-v0-0.2.1');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

var Utility_Registry_V0_Configuration_Instrument = require('../../../../../Utility/Registry/V0/Configuration/Instrument/module');
var Utility_Registry_V0_Holding_Transfer = require('../../../../../Utility/Registry/V0/Holding/Transfer/module');


exports.ExecutedForceTransfer_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ExecutedForceTransfer_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ExecutedForceTransfer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.ForceTransfer:ExecutedForceTransfer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.ForceTransfer:ExecutedForceTransfer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({forceTransfer: exports.ForceTransfer.decoder, registrarRationale: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    forceTransfer: exports.ForceTransfer.encode(__typed__.forceTransfer),
    registrarRationale: damlTypes.Text.encode(__typed__.registrarRationale),
  };
}
,
  Archive: {
    template: function () { return exports.ExecutedForceTransfer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  ExecutedForceTransfer_Delete: {
    template: function () { return exports.ExecutedForceTransfer; },
    choiceName: 'ExecutedForceTransfer_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedForceTransfer_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedForceTransfer_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedForceTransfer_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ExecutedForceTransfer_Delete_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ExecutedForceTransfer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.FailedForceTransfer_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedForceTransfer_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedForceTransfer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.ForceTransfer:FailedForceTransfer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.ForceTransfer:FailedForceTransfer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({forceTransfer: exports.ForceTransfer.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    forceTransfer: exports.ForceTransfer.encode(__typed__.forceTransfer),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  FailedForceTransfer_Delete: {
    template: function () { return exports.FailedForceTransfer; },
    choiceName: 'FailedForceTransfer_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FailedForceTransfer_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.FailedForceTransfer_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.FailedForceTransfer_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.FailedForceTransfer_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.FailedForceTransfer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.FailedForceTransfer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.RejectedForceTransfer_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedForceTransfer_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedForceTransfer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.ForceTransfer:RejectedForceTransfer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.ForceTransfer:RejectedForceTransfer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({forceTransfer: exports.ForceTransfer.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    forceTransfer: exports.ForceTransfer.encode(__typed__.forceTransfer),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  RejectedForceTransfer_Delete: {
    template: function () { return exports.RejectedForceTransfer; },
    choiceName: 'RejectedForceTransfer_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedForceTransfer_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedForceTransfer_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RejectedForceTransfer_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RejectedForceTransfer_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.RejectedForceTransfer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedForceTransfer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.AcceptedForceTransfer_Fail_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({failedForceTransferCid: damlTypes.ContractId(exports.FailedForceTransfer).decoder, }); }),
  encode: function (__typed__) {
  return {
    failedForceTransferCid: damlTypes.ContractId(exports.FailedForceTransfer).encode(__typed__.failedForceTransferCid),
  };
}
,
};



exports.AcceptedForceTransfer_Execute_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingTransferResult: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Transfer_Result.decoder, executedForceTransferCid: damlTypes.ContractId(exports.ExecutedForceTransfer).decoder, remainingHoldingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingTransferResult: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding_Transfer_Result.encode(__typed__.holdingTransferResult),
    executedForceTransferCid: damlTypes.ContractId(exports.ExecutedForceTransfer).encode(__typed__.executedForceTransferCid),
    remainingHoldingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.remainingHoldingCids),
  };
}
,
};



exports.AcceptedForceTransfer_Fail = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.AcceptedForceTransfer_Execute = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).decoder, holdingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder, requestorCredentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).encode(__typed__.instrumentConfigurationCid),
    holdingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.holdingCids),
    requestorCredentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.requestorCredentialCids),
  };
}
,
};



exports.AcceptedForceTransfer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.ForceTransfer:AcceptedForceTransfer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.ForceTransfer:AcceptedForceTransfer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({forceTransfer: exports.ForceTransfer.decoder, registrarRationale: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    forceTransfer: exports.ForceTransfer.encode(__typed__.forceTransfer),
    registrarRationale: damlTypes.Text.encode(__typed__.registrarRationale),
  };
}
,
  AcceptedForceTransfer_Execute: {
    template: function () { return exports.AcceptedForceTransfer; },
    choiceName: 'AcceptedForceTransfer_Execute',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedForceTransfer_Execute.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedForceTransfer_Execute.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedForceTransfer_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedForceTransfer_Execute_Result.encode(__typed__); },
  },
  AcceptedForceTransfer_Fail: {
    template: function () { return exports.AcceptedForceTransfer; },
    choiceName: 'AcceptedForceTransfer_Fail',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedForceTransfer_Fail.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedForceTransfer_Fail.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedForceTransfer_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedForceTransfer_Fail_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.AcceptedForceTransfer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.AcceptedForceTransfer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.ForceTransferRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ForceTransferRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedForceTransferCid: damlTypes.ContractId(exports.RejectedForceTransfer).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedForceTransferCid: damlTypes.ContractId(exports.RejectedForceTransfer).encode(__typed__.rejectedForceTransferCid),
  };
}
,
};



exports.ForceTransferRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedForceTransferCid: damlTypes.ContractId(exports.AcceptedForceTransfer).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedForceTransferCid: damlTypes.ContractId(exports.AcceptedForceTransfer).encode(__typed__.acceptedForceTransferCid),
  };
}
,
};



exports.ForceTransferRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ForceTransferRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.ForceTransferRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({registrarRationale: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    registrarRationale: damlTypes.Text.encode(__typed__.registrarRationale),
  };
}
,
};



exports.ForceTransferRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.ForceTransfer:ForceTransferRequest',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.ForceTransfer:ForceTransferRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({forceTransfer: exports.ForceTransfer.decoder, }); }),
  encode: function (__typed__) {
  return {
    forceTransfer: exports.ForceTransfer.encode(__typed__.forceTransfer),
  };
}
,
  ForceTransferRequest_Accept: {
    template: function () { return exports.ForceTransferRequest; },
    choiceName: 'ForceTransferRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ForceTransferRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.ForceTransferRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ForceTransferRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ForceTransferRequest_Accept_Result.encode(__typed__); },
  },
  ForceTransferRequest_Reject: {
    template: function () { return exports.ForceTransferRequest; },
    choiceName: 'ForceTransferRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ForceTransferRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.ForceTransferRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ForceTransferRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ForceTransferRequest_Reject_Result.encode(__typed__); },
  },
  ForceTransferRequest_Cancel: {
    template: function () { return exports.ForceTransferRequest; },
    choiceName: 'ForceTransferRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ForceTransferRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.ForceTransferRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ForceTransferRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ForceTransferRequest_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ForceTransferRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ForceTransferRequest, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.ForceTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({requestor: damlTypes.Party.decoder, requestorRationale: damlTypes.Text.decoder, transfer: Utility_Registry_V0_Holding_Transfer.Transfer.decoder, senderLabel: damlTypes.Text.decoder, receiverLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    requestor: damlTypes.Party.encode(__typed__.requestor),
    requestorRationale: damlTypes.Text.encode(__typed__.requestorRationale),
    transfer: Utility_Registry_V0_Holding_Transfer.Transfer.encode(__typed__.transfer),
    senderLabel: damlTypes.Text.encode(__typed__.senderLabel),
    receiverLabel: damlTypes.Text.encode(__typed__.receiverLabel),
  };
}
,
};

