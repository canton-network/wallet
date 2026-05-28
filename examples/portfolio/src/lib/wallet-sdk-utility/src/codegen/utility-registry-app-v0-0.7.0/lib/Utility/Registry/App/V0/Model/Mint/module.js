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


exports.ExecutedMint_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ExecutedMint_Delete = {
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
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Mint:ExecutedMint',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Model.Mint:ExecutedMint',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, mint: exports.Mint.decoder, operatorIsObserver: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    mint: exports.Mint.encode(__typed__.mint),
    operatorIsObserver: damlTypes.Optional(damlTypes.Bool).encode(__typed__.operatorIsObserver),
  };
}
,
  ExecutedMint_Delete: {
    template: function () { return exports.ExecutedMint; },
    choiceName: 'ExecutedMint_Delete',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedMint_Delete.decoder; }),
    argumentEncode: function (__typed__) { return exports.ExecutedMint_Delete.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.ExecutedMint_Delete_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.ExecutedMint_Delete_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ExecutedMint; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ExecutedMint, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.RejectedMint_Delete_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectedMint_Delete = {
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
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Mint:RejectedMint',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Model.Mint:RejectedMint',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, mint: exports.Mint.decoder, reason: damlTypes.Text.decoder, operatorIsObserver: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Bool).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    mint: exports.Mint.encode(__typed__.mint),
    reason: damlTypes.Text.encode(__typed__.reason),
    operatorIsObserver: damlTypes.Optional(damlTypes.Bool).encode(__typed__.operatorIsObserver),
  };
}
,
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


damlTypes.registerTemplate(exports.RejectedMint, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.MintOffer_Cancel_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.MintOffer_Reject_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedMintCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.RejectedMint)).decoder), }); }),
  encode: function (__typed__) {
  return {
    rejectedMintCid: damlTypes.Optional(damlTypes.ContractId(exports.RejectedMint)).encode(__typed__.rejectedMintCid),
  };
}
,
};



exports.MintOffer_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, executedMintCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.ExecutedMint)).decoder), meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.holdingCid),
    executedMintCid: damlTypes.Optional(damlTypes.ContractId(exports.ExecutedMint)).encode(__typed__.executedMintCid),
    meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
  };
}
,
};



exports.MintOffer_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.MintOffer_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, extraArgs: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).decoder), }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
    extraArgs: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).encode(__typed__.extraArgs),
  };
}
,
};



exports.MintOffer_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, }); }),
  encode: function (__typed__) {
  return {
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
  };
}
,
};



exports.MintOffer = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Mint:MintOffer',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Model.Mint:MintOffer',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, mint: exports.Mint.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    mint: exports.Mint.encode(__typed__.mint),
  };
}
,
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


damlTypes.registerTemplate(exports.MintOffer, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.MintRequest_Accept_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).decoder, executedMintCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.ExecutedMint)).decoder), meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder, }); }),
  encode: function (__typed__) {
  return {
    holdingCid: damlTypes.ContractId(pkg8107899ac4723ce986bf7d27416534e576e54b92161e46150a595fb78ff3d3a1.Utility.Registry.Holding.V0.Holding.Holding).encode(__typed__.holdingCid),
    executedMintCid: damlTypes.Optional(damlTypes.ContractId(exports.ExecutedMint)).encode(__typed__.executedMintCid),
    meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
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
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectedMintCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.RejectedMint)).decoder), }); }),
  encode: function (__typed__) {
  return {
    rejectedMintCid: damlTypes.Optional(damlTypes.ContractId(exports.RejectedMint)).encode(__typed__.rejectedMintCid),
  };
}
,
};



exports.MintRequest_Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.MintRequest_Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({reason: damlTypes.Text.decoder, extraArgs: jtv.Decoder.withDefault(null, damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).decoder), }); }),
  encode: function (__typed__) {
  return {
    reason: damlTypes.Text.encode(__typed__.reason),
    extraArgs: damlTypes.Optional(pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs).encode(__typed__.extraArgs),
  };
}
,
};



exports.MintRequest_Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder, }); }),
  encode: function (__typed__) {
  return {
    extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
  };
}
,
};



exports.MintRequest = damlTypes.assembleTemplate(
{
  templateId: '#utility-registry-app-v0:Utility.Registry.App.V0.Model.Mint:MintRequest',
  templateIdWithPackageId: '7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab:Utility.Registry.App.V0.Model.Mint:MintRequest',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, mint: exports.Mint.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
    mint: exports.Mint.encode(__typed__.mint),
  };
}
,
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
  Archive: {
    template: function () { return exports.MintRequest; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  MintRequest_Cancel: {
    template: function () { return exports.MintRequest; },
    choiceName: 'MintRequest_Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.MintRequest_Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.MintRequest_Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.MintRequest_Cancel_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.MintRequest_Cancel_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.MintRequest, ['7a75ef6e69f69395a4e60919e228528bb8f3881150ccfde3f31bcc73864b18ab', '#utility-registry-app-v0']);



exports.Mint = {
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

