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

var pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 = require('@daml.js/splice-api-token-holding-v2-1.0.0');
var pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f = require('@daml.js/splice-api-token-metadata-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

exports.TransferFactory = damlTypes.assembleInterface(
  '#splice-api-token-transfer-instruction-v2:Splice.Api.Token.TransferInstructionV2:TransferFactory',
  '#29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099:Splice.Api.Token.TransferInstructionV2:TransferFactory',
  function () { return exports.TransferFactoryView; },
  {
    Archive: {
      template: function () { return exports.TransferFactory; },
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
    TransferFactory_PublicFetch: {
      template: function () { return exports.TransferFactory; },
      choiceName: 'TransferFactory_PublicFetch',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.TransferFactory_PublicFetch.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.TransferFactory_PublicFetch.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.TransferFactoryView.decoder;
      }),
      resultEncode: function (__typed__) { return exports.TransferFactoryView.encode(__typed__); },
    },
    TransferFactory_Transfer: {
      template: function () { return exports.TransferFactory; },
      choiceName: 'TransferFactory_Transfer',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.TransferFactory_Transfer.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.TransferFactory_Transfer.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.TransferInstructionResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.TransferInstructionResult.encode(__typed__); },
    },
  }
);

exports.TransferInstruction = damlTypes.assembleInterface(
  '#splice-api-token-transfer-instruction-v2:Splice.Api.Token.TransferInstructionV2:TransferInstruction',
  '#29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099:Splice.Api.Token.TransferInstructionV2:TransferInstruction',
  function () { return exports.TransferInstructionView; },
  {
    Archive: {
      template: function () { return exports.TransferInstruction; },
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
    TransferInstruction_Accept: {
      template: function () { return exports.TransferInstruction; },
      choiceName: 'TransferInstruction_Accept',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.TransferInstruction_Accept.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.TransferInstruction_Accept.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.TransferInstructionResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.TransferInstructionResult.encode(__typed__); },
    },
    TransferInstruction_Reject: {
      template: function () { return exports.TransferInstruction; },
      choiceName: 'TransferInstruction_Reject',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.TransferInstruction_Reject.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.TransferInstruction_Reject.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.TransferInstructionResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.TransferInstructionResult.encode(__typed__); },
    },
    TransferInstruction_Withdraw: {
      template: function () { return exports.TransferInstruction; },
      choiceName: 'TransferInstruction_Withdraw',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.TransferInstruction_Withdraw.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.TransferInstruction_Withdraw.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.TransferInstructionResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.TransferInstructionResult.encode(__typed__); },
    },
  }
);

exports.Transfer = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      sender: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.decoder,
      receiver: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.decoder,
      amount: damlTypes.Numeric(10).decoder,
      instrumentId: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.InstrumentId.decoder,
      requestedAt: damlTypes.Time.decoder,
      executeBefore: damlTypes.Time.decoder,
      inputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      sender: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.encode(__typed__.sender),
      receiver: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.encode(__typed__.receiver),
      amount: damlTypes.Numeric(10).encode(__typed__.amount),
      instrumentId: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.InstrumentId.encode(__typed__.instrumentId),
      requestedAt: damlTypes.Time.encode(__typed__.requestedAt),
      executeBefore: damlTypes.Time.encode(__typed__.executeBefore),
      inputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).encode(__typed__.inputHoldingCids),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.TransferFactoryView = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      admin: damlTypes.Party.decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      admin: damlTypes.Party.encode(__typed__.admin),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.TransferFactory_PublicFetch = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actors: damlTypes.List(damlTypes.Party).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actors: damlTypes.List(damlTypes.Party).encode(__typed__.actors),
    };
  },
};

exports.TransferFactory_Transfer = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      transfer: exports.Transfer.decoder,
      actors: damlTypes.List(damlTypes.Party).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      transfer: exports.Transfer.encode(__typed__.transfer),
      actors: damlTypes.List(damlTypes.Party).encode(__typed__.actors),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};

exports.TransferInstructionAction = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.object({
        tag: jtv.constant("TIA_Accept"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("TIA_Reject"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("TIA_Withdraw"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("TIA_Custom"),
        value: exports.TransferInstructionAction.TIA_Custom.decoder,
      }),
    );
  }),
  encode: function (__typed__) {
    switch(__typed__.tag) {
      case 'TIA_Accept': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'TIA_Reject': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'TIA_Withdraw': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'TIA_Custom': return {tag: __typed__.tag, value: exports.TransferInstructionAction.TIA_Custom.encode(__typed__.value)};
      default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type TransferInstructionAction';
    }
  },
  TIA_Custom: {
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        id: damlTypes.Text.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        id: damlTypes.Text.encode(__typed__.id),
      };
    },
  },
};

exports.TransferInstructionResult = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      output: exports.TransferInstructionResult_Output.decoder,
      senderChangeCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      output: exports.TransferInstructionResult_Output.encode(__typed__.output),
      senderChangeCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).encode(__typed__.senderChangeCids),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.TransferInstructionResult_Output = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.object({
        tag: jtv.constant("TransferInstructionResult_Pending"),
        value: exports.TransferInstructionResult_Output.TransferInstructionResult_Pending.decoder,
      }),
      jtv.object({
        tag: jtv.constant("TransferInstructionResult_Completed"),
        value: exports.TransferInstructionResult_Output.TransferInstructionResult_Completed.decoder,
      }),
      jtv.object({
        tag: jtv.constant("TransferInstructionResult_Failed"),
        value: damlTypes.Unit.decoder,
      }),
    );
  }),
  encode: function (__typed__) {
    switch(__typed__.tag) {
      case 'TransferInstructionResult_Pending': return {tag: __typed__.tag, value: exports.TransferInstructionResult_Output.TransferInstructionResult_Pending.encode(__typed__.value)};
      case 'TransferInstructionResult_Completed': return {tag: __typed__.tag, value: exports.TransferInstructionResult_Output.TransferInstructionResult_Completed.encode(__typed__.value)};
      case 'TransferInstructionResult_Failed': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type TransferInstructionResult_Output';
    }
  },
  TransferInstructionResult_Completed: {
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        receiverHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        receiverHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).encode(__typed__.receiverHoldingCids),
      };
    },
  },
  TransferInstructionResult_Pending: {
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        transferInstructionCid: damlTypes.ContractId(exports.TransferInstruction).decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        transferInstructionCid: damlTypes.ContractId(exports.TransferInstruction).encode(__typed__.transferInstructionCid),
      };
    },
  },
};

exports.TransferInstructionView = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      originalInstructionCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.TransferInstruction)).decoder),
      transfer: exports.Transfer.decoder,
      expiresAt: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder),
      availableActions: damlTypes.Map(exports.TransferInstructionAction, damlTypes.List(damlTypes.List(damlTypes.Party))).decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      originalInstructionCid: damlTypes.Optional(damlTypes.ContractId(exports.TransferInstruction)).encode(__typed__.originalInstructionCid),
      transfer: exports.Transfer.encode(__typed__.transfer),
      expiresAt: damlTypes.Optional(damlTypes.Time).encode(__typed__.expiresAt),
      availableActions: damlTypes.Map(exports.TransferInstructionAction, damlTypes.List(damlTypes.List(damlTypes.Party))).encode(__typed__.availableActions),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.TransferInstruction_Accept = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actors: damlTypes.List(damlTypes.Party).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actors: damlTypes.List(damlTypes.Party).encode(__typed__.actors),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};

exports.TransferInstruction_Reject = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actors: damlTypes.List(damlTypes.Party).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actors: damlTypes.List(damlTypes.Party).encode(__typed__.actors),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};

exports.TransferInstruction_Withdraw = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actors: damlTypes.List(damlTypes.Party).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actors: damlTypes.List(damlTypes.Party).encode(__typed__.actors),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};
