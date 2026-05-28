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

var Utility_Registry_V0_Configuration_Instrument = require('../../../../../Utility/Registry/V0/Configuration/Instrument/module');
var Utility_Registry_V0_Types = require('../../../../../Utility/Registry/V0/Types/module');


exports.ExecutedBurn_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedBurn_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedBurn_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.AcceptedBurn_Fail_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({failedBurnCid: damlTypes.ContractId(exports.FailedBurn).decoder, }); }),
  encode: function (__typed__) {
  return {
    failedBurnCid: damlTypes.ContractId(exports.FailedBurn).encode(__typed__.failedBurnCid),
  };
}
,
};



exports.AcceptedBurn_Execute_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({executedBurnCid: damlTypes.ContractId(exports.ExecutedBurn).decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    executedBurnCid: damlTypes.ContractId(exports.ExecutedBurn).encode(__typed__.executedBurnCid),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.BurnRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.BurnRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedBurnCid: damlTypes.ContractId(exports.RejectedBurn).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedBurnCid: damlTypes.ContractId(exports.RejectedBurn).encode(__typed__.rejectedBurnCid),
  };
}
,
};



exports.BurnRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedBurnCid: damlTypes.ContractId(exports.AcceptedBurn).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedBurnCid: damlTypes.ContractId(exports.AcceptedBurn).encode(__typed__.acceptedBurnCid),
  };
}
,
};



exports.BurnOffer_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.BurnOffer_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedBurnCid: damlTypes.ContractId(exports.RejectedBurn).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedBurnCid: damlTypes.ContractId(exports.RejectedBurn).encode(__typed__.rejectedBurnCid),
  };
}
,
};



exports.BurnOffer_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedBurnCid: damlTypes.ContractId(exports.AcceptedBurn).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedBurnCid: damlTypes.ContractId(exports.AcceptedBurn).encode(__typed__.acceptedBurnCid),
  };
}
,
};



exports.ExecutedBurn_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ExecutedBurn_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.ExecutedBurn = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:ExecutedBurn',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Burn:ExecutedBurn',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({burn: exports.Burn.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    burn: exports.Burn.encode(__typed__.burn),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  ExecutedBurn_Clean: {
    template: function () { return exports.ExecutedBurn; },
    choiceName: 'ExecutedBurn_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedBurn_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedBurn_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ExecutedBurn; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  ExecutedBurn_Delete: {
    template: function () { return exports.ExecutedBurn; },
    choiceName: 'ExecutedBurn_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedBurn_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedBurn_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedBurn_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ExecutedBurn_Delete_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ExecutedBurn, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.FailedBurn_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedBurn_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.FailedBurn = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:FailedBurn',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Burn:FailedBurn',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({burn: exports.Burn.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    burn: exports.Burn.encode(__typed__.burn),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  FailedBurn_Clean: {
    template: function () { return exports.FailedBurn; },
    choiceName: 'FailedBurn_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FailedBurn_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.FailedBurn_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  FailedBurn_Delete: {
    template: function () { return exports.FailedBurn; },
    choiceName: 'FailedBurn_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FailedBurn_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.FailedBurn_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.FailedBurn_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.FailedBurn_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.FailedBurn; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.FailedBurn, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.RejectedBurn_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedBurn_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.RejectedBurn = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:RejectedBurn',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Burn:RejectedBurn',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({burn: exports.Burn.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    burn: exports.Burn.encode(__typed__.burn),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  RejectedBurn_Clean: {
    template: function () { return exports.RejectedBurn; },
    choiceName: 'RejectedBurn_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedBurn_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedBurn_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RejectedBurn_Delete: {
    template: function () { return exports.RejectedBurn; },
    choiceName: 'RejectedBurn_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedBurn_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedBurn_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RejectedBurn_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RejectedBurn_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.RejectedBurn; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedBurn, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.AcceptedBurn_Fail = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.AcceptedBurn_Execute = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).decoder, credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).encode(__typed__.instrumentConfigurationCid),
    credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.credentialCids),
    holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.holdingCid),
  };
}
,
};



exports.AcceptedBurn_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.AcceptedBurn = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:AcceptedBurn',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Burn:AcceptedBurn',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({burn: exports.Burn.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    burn: exports.Burn.encode(__typed__.burn),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  AcceptedBurn_Clean: {
    template: function () { return exports.AcceptedBurn; },
    choiceName: 'AcceptedBurn_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedBurn_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedBurn_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  AcceptedBurn_Execute: {
    template: function () { return exports.AcceptedBurn; },
    choiceName: 'AcceptedBurn_Execute',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedBurn_Execute.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedBurn_Execute.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedBurn_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedBurn_Execute_Result.encode(__typed__); },
  },
  AcceptedBurn_Fail: {
    template: function () { return exports.AcceptedBurn; },
    choiceName: 'AcceptedBurn_Fail',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedBurn_Fail.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedBurn_Fail.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedBurn_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedBurn_Fail_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.AcceptedBurn; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.AcceptedBurn, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.BurnRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.BurnRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.BurnRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.BurnRequest_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.BurnRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:BurnRequest',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Burn:BurnRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({burn: exports.Burn.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    burn: exports.Burn.encode(__typed__.burn),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  BurnRequest_Clean: {
    template: function () { return exports.BurnRequest; },
    choiceName: 'BurnRequest_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.BurnRequest_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.BurnRequest_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  BurnRequest_Accept: {
    template: function () { return exports.BurnRequest; },
    choiceName: 'BurnRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.BurnRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.BurnRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.BurnRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.BurnRequest_Accept_Result.encode(__typed__); },
  },
  BurnRequest_Reject: {
    template: function () { return exports.BurnRequest; },
    choiceName: 'BurnRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.BurnRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.BurnRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.BurnRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.BurnRequest_Reject_Result.encode(__typed__); },
  },
  BurnRequest_Cancel: {
    template: function () { return exports.BurnRequest; },
    choiceName: 'BurnRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.BurnRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.BurnRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.BurnRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.BurnRequest_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.BurnRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.BurnRequest, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.BurnOffer_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.BurnOffer_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.BurnOffer_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
};



exports.BurnOffer_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.BurnOffer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Burn:BurnOffer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Burn:BurnOffer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({burn: exports.Burn.decoder, }); }),
  encode: function (__typed__) {
  return {
    burn: exports.Burn.encode(__typed__.burn),
  };
}
,
  BurnOffer_Clean: {
    template: function () { return exports.BurnOffer; },
    choiceName: 'BurnOffer_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.BurnOffer_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.BurnOffer_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  BurnOffer_Accept: {
    template: function () { return exports.BurnOffer; },
    choiceName: 'BurnOffer_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.BurnOffer_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.BurnOffer_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.BurnOffer_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.BurnOffer_Accept_Result.encode(__typed__); },
  },
  BurnOffer_Reject: {
    template: function () { return exports.BurnOffer; },
    choiceName: 'BurnOffer_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.BurnOffer_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.BurnOffer_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.BurnOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.BurnOffer_Reject_Result.encode(__typed__); },
  },
  BurnOffer_Cancel: {
    template: function () { return exports.BurnOffer; },
    choiceName: 'BurnOffer_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.BurnOffer_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.BurnOffer_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.BurnOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.BurnOffer_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.BurnOffer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.BurnOffer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.Burn = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, registrar: damlTypes.Party.decoder, instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.decoder, amount: damlTypes.Numeric(10).decoder, holder: damlTypes.Party.decoder, reference: damlTypes.Text.decoder, batch: Utility_Registry_V0_Types.Batch.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    registrar: damlTypes.Party.encode(__typed__.registrar),
    instrumentIdentifier: pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Types.InstrumentIdentifier.encode(__typed__.instrumentIdentifier),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    holder: damlTypes.Party.encode(__typed__.holder),
    reference: damlTypes.Text.encode(__typed__.reference),
    batch: Utility_Registry_V0_Types.Batch.encode(__typed__.batch),
  };
}
,
};

