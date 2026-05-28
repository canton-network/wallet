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
var pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1 = require('@daml.js/utility-registry-holding-v0-0.2.1');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');


exports.ExecutedBurn_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ExecutedBurn_Delete = {
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
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Burn:ExecutedBurn',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Model.Burn:ExecutedBurn',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, burn: exports.Burn.decoder, operatorIsObserver: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    burn: exports.Burn.encode(__typed__.burn),
    operatorIsObserver: damlTypes.Optional(damlTypes.Bool).encode(__typed__.operatorIsObserver),
  };
}
,
  ExecutedBurn_Delete: {
    template: function () { return exports.ExecutedBurn; },
    choiceName: 'ExecutedBurn_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedBurn_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedBurn_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedBurn_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ExecutedBurn_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ExecutedBurn; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ExecutedBurn, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.RejectedBurn_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedBurn_Delete = {
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
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Burn:RejectedBurn',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Model.Burn:RejectedBurn',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, burn: exports.Burn.decoder, reason: damlTypes.Text.decoder, operatorIsObserver: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    burn: exports.Burn.encode(__typed__.burn),
    reason: damlTypes.Text.encode(__typed__.reason),
    operatorIsObserver: damlTypes.Optional(damlTypes.Bool).encode(__typed__.operatorIsObserver),
  };
}
,
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


damlTypes.registerTemplate(exports.RejectedBurn, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.BurnOffer_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.BurnOffer_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedBurnCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.RejectedBurn)).decoder), }); }),
  encode: function (__typed__) {
  return {
    rejectedBurnCid: damlTypes.Optional(damlTypes.ContractId(exports.RejectedBurn)).encode(__typed__.rejectedBurnCid),
  };
}
,
};



exports.BurnOffer_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({executedBurnCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.ExecutedBurn)).decoder), remaining: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder), meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder, }); }),
  encode: function (__typed__) {
  return {
    executedBurnCid: damlTypes.Optional(damlTypes.ContractId(exports.ExecutedBurn)).encode(__typed__.executedBurnCid),
    remaining: damlTypes.Optional(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.remaining),
    meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
  };
}
,
};



exports.BurnOffer_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.BurnOffer_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, extraArgs: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).decoder), }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
    extraArgs: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).encode(__typed__.extraArgs),
  };
}
,
};



exports.BurnOffer_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).decoder, extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingCids: damlTypes.List(damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding)).encode(__typed__.holdingCids),
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
  };
}
,
};



exports.BurnOffer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Burn:BurnOffer',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Model.Burn:BurnOffer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, burn: exports.Burn.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    burn: exports.Burn.encode(__typed__.burn),
  };
}
,
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


damlTypes.registerTemplate(exports.BurnOffer, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.BurnRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({executedBurnCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.ExecutedBurn)).decoder), meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder, }); }),
  encode: function (__typed__) {
  return {
    executedBurnCid: damlTypes.Optional(damlTypes.ContractId(exports.ExecutedBurn)).encode(__typed__.executedBurnCid),
    meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
  };
}
,
};



exports.BurnRequest_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.holdingCid),
  };
}
,
};



exports.BurnRequest_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedBurnCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.RejectedBurn)).decoder), holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectedBurnCid: damlTypes.Optional(damlTypes.ContractId(exports.RejectedBurn)).encode(__typed__.rejectedBurnCid),
    holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.holdingCid),
  };
}
,
};



exports.BurnRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.BurnRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, extraArgs: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).decoder), }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
    extraArgs: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).encode(__typed__.extraArgs),
  };
}
,
};



exports.BurnRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, }); }),
  encode: function (__typed__) {
  return {
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
  };
}
,
};



exports.BurnRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Burn:BurnRequest',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Model.Burn:BurnRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, burn: exports.Burn.decoder, lockedHoldingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    burn: exports.Burn.encode(__typed__.burn),
    lockedHoldingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.lockedHoldingCid),
  };
}
,
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


damlTypes.registerTemplate(exports.BurnRequest, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.Burn = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({instrumentId: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId.decoder, amount: damlTypes.Numeric(10).decoder, holder: damlTypes.Party.decoder, reference: damlTypes.Text.decoder, requestedAt: damlTypes.Time.decoder, executeBefore: damlTypes.Time.decoder, meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder, }); }),
  encode: function (__typed__) {
  return {
    instrumentId: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId.encode(__typed__.instrumentId),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    holder: damlTypes.Party.encode(__typed__.holder),
    reference: damlTypes.Text.encode(__typed__.reference),
    requestedAt: damlTypes.Time.encode(__typed__.requestedAt),
    executeBefore: damlTypes.Time.encode(__typed__.executeBefore),
    meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
  };
}
,
};

