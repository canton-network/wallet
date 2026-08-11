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

var pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099 = require('@daml.js/splice-api-token-transfer-instruction-v2-1.0.0');
var pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 = require('@daml.js/splice-api-token-transfer-instruction-v1-1.0.0');
var pkg5c1097a9bad0af4bcfe6d3fb0fe55112d3d11f18eae57ddfb14c20836fee226c = require('@daml.js/splice-api-token-transfer-events-v2-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

exports.TokenTransferOffer = damlTypes.assembleTemplate(
  {
    templateId: '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Transfer:TokenTransferOffer',
    templateIdWithPackageId: '#a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1:Splice.Testing.Tokens.TestTokenV2.Transfer:TokenTransferOffer',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        actionAuthorizers: damlTypes.Map(pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionAction, damlTypes.List(damlTypes.Party)).decoder,
        availableActions: damlTypes.Map(pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionAction, damlTypes.List(damlTypes.List(damlTypes.Party))).decoder,
        transfer: pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.Transfer.decoder,
        originalInstructionCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstruction)).decoder),
        mintAmount: damlTypes.Numeric(10).decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        actionAuthorizers: damlTypes.Map(pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionAction, damlTypes.List(damlTypes.Party)).encode(__typed__.actionAuthorizers),
        availableActions: damlTypes.Map(pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionAction, damlTypes.List(damlTypes.List(damlTypes.Party))).encode(__typed__.availableActions),
        transfer: pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.Transfer.encode(__typed__.transfer),
        originalInstructionCid: damlTypes.Optional(damlTypes.ContractId(pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstruction)).encode(__typed__.originalInstructionCid),
        mintAmount: damlTypes.Numeric(10).encode(__typed__.mintAmount),
      };
    },
    Archive: {
      template: function () { return exports.TokenTransferOffer; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
  },
  pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstruction,
  pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferInstruction,
  pkg5c1097a9bad0af4bcfe6d3fb0fe55112d3d11f18eae57ddfb14c20836fee226c.Splice.Api.Token.TransferEventsV2.EventLog,
);

damlTypes.registerTemplate(exports.TokenTransferOffer, ['a38a96b6f46c14c599b2763bc4fc68911a9cada90f89c599a1401e8e3df685e1', '#splice-test-token-v2']);
