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


exports.ExecutedMint_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedMint_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedMint_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.AcceptedMint_Fail_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({failedMintCid: damlTypes.ContractId(exports.FailedMint).decoder, }); }),
  encode: function (__typed__) {
  return {
    failedMintCid: damlTypes.ContractId(exports.FailedMint).encode(__typed__.failedMintCid),
  };
}
,
};



exports.AcceptedMint_Execute_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, executedMintCid: damlTypes.ContractId(exports.ExecutedMint).decoder, meta: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).decoder), }); }),
  encode: function (__typed__) {
  return {
    holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.holdingCid),
    executedMintCid: damlTypes.ContractId(exports.ExecutedMint).encode(__typed__.executedMintCid),
    meta: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata).encode(__typed__.meta),
  };
}
,
};



exports.MintRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.MintRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedMintCid: damlTypes.ContractId(exports.RejectedMint).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedMintCid: damlTypes.ContractId(exports.RejectedMint).encode(__typed__.rejectedMintCid),
  };
}
,
};



exports.MintRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedMintCid: damlTypes.ContractId(exports.AcceptedMint).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedMintCid: damlTypes.ContractId(exports.AcceptedMint).encode(__typed__.acceptedMintCid),
  };
}
,
};



exports.MintOffer_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.MintOffer_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedMintCid: damlTypes.ContractId(exports.RejectedMint).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedMintCid: damlTypes.ContractId(exports.RejectedMint).encode(__typed__.rejectedMintCid),
  };
}
,
};



exports.MintOffer_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptedMintCid: damlTypes.ContractId(exports.AcceptedMint).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptedMintCid: damlTypes.ContractId(exports.AcceptedMint).encode(__typed__.acceptedMintCid),
  };
}
,
};



exports.ExecutedMint_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ExecutedMint_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.ExecutedMint = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:ExecutedMint',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Mint:ExecutedMint',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({mint: exports.Mint.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    mint: exports.Mint.encode(__typed__.mint),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  ExecutedMint_Clean: {
    template: function () { return exports.ExecutedMint; },
    choiceName: 'ExecutedMint_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedMint_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedMint_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ExecutedMint; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  ExecutedMint_Delete: {
    template: function () { return exports.ExecutedMint; },
    choiceName: 'ExecutedMint_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedMint_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedMint_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedMint_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ExecutedMint_Delete_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ExecutedMint, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.FailedMint_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.FailedMint_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.FailedMint = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:FailedMint',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Mint:FailedMint',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({mint: exports.Mint.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    mint: exports.Mint.encode(__typed__.mint),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  FailedMint_Clean: {
    template: function () { return exports.FailedMint; },
    choiceName: 'FailedMint_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FailedMint_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.FailedMint_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  FailedMint_Delete: {
    template: function () { return exports.FailedMint; },
    choiceName: 'FailedMint_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FailedMint_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.FailedMint_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.FailedMint_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.FailedMint_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.FailedMint; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.FailedMint, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.RejectedMint_Delete = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedMint_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.RejectedMint = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:RejectedMint',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Mint:RejectedMint',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({mint: exports.Mint.decoder, reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    mint: exports.Mint.encode(__typed__.mint),
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
  RejectedMint_Clean: {
    template: function () { return exports.RejectedMint; },
    choiceName: 'RejectedMint_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedMint_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedMint_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  RejectedMint_Delete: {
    template: function () { return exports.RejectedMint; },
    choiceName: 'RejectedMint_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectedMint_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectedMint_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.RejectedMint_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.RejectedMint_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.RejectedMint; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.RejectedMint, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.AcceptedMint_Fail = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.AcceptedMint_Execute = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).decoder, credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentConfigurationCid: damlTypes.ContractId(Utility_Registry_V0_Configuration_Instrument.InstrumentConfiguration).encode(__typed__.instrumentConfigurationCid),
    credentialCids: damlTypes.List(damlTypes.ContractId(pkg5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70.Utility.Credential.V0.Credential.Credential)).encode(__typed__.credentialCids),
  };
}
,
};



exports.AcceptedMint_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.AcceptedMint = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:AcceptedMint',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Mint:AcceptedMint',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({mint: exports.Mint.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    mint: exports.Mint.encode(__typed__.mint),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  AcceptedMint_Clean: {
    template: function () { return exports.AcceptedMint; },
    choiceName: 'AcceptedMint_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedMint_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedMint_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  AcceptedMint_Execute: {
    template: function () { return exports.AcceptedMint; },
    choiceName: 'AcceptedMint_Execute',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedMint_Execute.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedMint_Execute.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedMint_Execute_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedMint_Execute_Result.encode(__typed__); },
  },
  AcceptedMint_Fail: {
    template: function () { return exports.AcceptedMint; },
    choiceName: 'AcceptedMint_Fail',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedMint_Fail.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptedMint_Fail.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.AcceptedMint_Fail_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.AcceptedMint_Fail_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.AcceptedMint; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.AcceptedMint, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.MintRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.MintRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.MintRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.MintRequest_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.MintRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:MintRequest',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Mint:MintRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({mint: exports.Mint.decoder, holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    mint: exports.Mint.encode(__typed__.mint),
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
  MintRequest_Clean: {
    template: function () { return exports.MintRequest; },
    choiceName: 'MintRequest_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.MintRequest_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.MintRequest_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  MintRequest_Accept: {
    template: function () { return exports.MintRequest; },
    choiceName: 'MintRequest_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.MintRequest_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.MintRequest_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.MintRequest_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.MintRequest_Accept_Result.encode(__typed__); },
  },
  MintRequest_Reject: {
    template: function () { return exports.MintRequest; },
    choiceName: 'MintRequest_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.MintRequest_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.MintRequest_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.MintRequest_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.MintRequest_Reject_Result.encode(__typed__); },
  },
  MintRequest_Cancel: {
    template: function () { return exports.MintRequest; },
    choiceName: 'MintRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.MintRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.MintRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.MintRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.MintRequest_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.MintRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.MintRequest, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.MintOffer_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.MintOffer_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
  };
}
,
};



exports.MintOffer_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingLabel: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingLabel: damlTypes.Text.encode(__typed__.holdingLabel),
  };
}
,
};



exports.MintOffer_Clean = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.MintOffer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-v0:Utility.Registry.V0.Holding.Mint:MintOffer',
  templateIdWithPackageId: 'a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab:Utility.Registry.V0.Holding.Mint:MintOffer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({mint: exports.Mint.decoder, }); }),
  encode: function (__typed__) {
  return {
    mint: exports.Mint.encode(__typed__.mint),
  };
}
,
  MintOffer_Clean: {
    template: function () { return exports.MintOffer; },
    choiceName: 'MintOffer_Clean',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.MintOffer_Clean.decoder; }),
    argumentEncode: function (__typed__) { return exports.MintOffer_Clean.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  MintOffer_Accept: {
    template: function () { return exports.MintOffer; },
    choiceName: 'MintOffer_Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.MintOffer_Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.MintOffer_Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.MintOffer_Accept_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.MintOffer_Accept_Result.encode(__typed__); },
  },
  MintOffer_Reject: {
    template: function () { return exports.MintOffer; },
    choiceName: 'MintOffer_Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.MintOffer_Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.MintOffer_Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.MintOffer_Reject_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.MintOffer_Reject_Result.encode(__typed__); },
  },
  MintOffer_Cancel: {
    template: function () { return exports.MintOffer; },
    choiceName: 'MintOffer_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.MintOffer_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.MintOffer_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.MintOffer_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.MintOffer_Cancel_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.MintOffer; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.MintOffer, ['a236e8e22a3b5f199e37d5554e82bafd2df688f901de02b00be3964bdfa8c1ab', '#utility-registry-v0']);



exports.Mint = {
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

