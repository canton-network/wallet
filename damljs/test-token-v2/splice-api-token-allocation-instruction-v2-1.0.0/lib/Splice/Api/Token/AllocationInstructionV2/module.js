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

var pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439 = require('@daml.js/splice-api-token-allocation-v2-1.0.0');
var pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 = require('@daml.js/splice-api-token-holding-v2-1.0.0');
var pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f = require('@daml.js/splice-api-token-metadata-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

exports.AllocationFactory = damlTypes.assembleInterface(
  '#splice-api-token-allocation-instruction-v2:Splice.Api.Token.AllocationInstructionV2:AllocationFactory',
  '#9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c:Splice.Api.Token.AllocationInstructionV2:AllocationFactory',
  function () { return exports.AllocationFactoryView; },
  {
    AllocationFactory_Allocate: {
      template: function () { return exports.AllocationFactory; },
      choiceName: 'AllocationFactory_Allocate',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationFactory_Allocate.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AllocationFactory_Allocate.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationInstructionResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AllocationInstructionResult.encode(__typed__); },
    },
    AllocationFactory_PublicFetch: {
      template: function () { return exports.AllocationFactory; },
      choiceName: 'AllocationFactory_PublicFetch',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationFactory_PublicFetch.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AllocationFactory_PublicFetch.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationFactoryView.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AllocationFactoryView.encode(__typed__); },
    },
    Archive: {
      template: function () { return exports.AllocationFactory; },
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
  }
);

exports.AllocationInstruction = damlTypes.assembleInterface(
  '#splice-api-token-allocation-instruction-v2:Splice.Api.Token.AllocationInstructionV2:AllocationInstruction',
  '#9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c:Splice.Api.Token.AllocationInstructionV2:AllocationInstruction',
  function () { return exports.AllocationInstructionView; },
  {
    AllocationInstruction_Accept: {
      template: function () { return exports.AllocationInstruction; },
      choiceName: 'AllocationInstruction_Accept',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationInstruction_Accept.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AllocationInstruction_Accept.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationInstructionResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AllocationInstructionResult.encode(__typed__); },
    },
    AllocationInstruction_Withdraw: {
      template: function () { return exports.AllocationInstruction; },
      choiceName: 'AllocationInstruction_Withdraw',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationInstruction_Withdraw.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AllocationInstruction_Withdraw.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationInstructionResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AllocationInstructionResult.encode(__typed__); },
    },
    Archive: {
      template: function () { return exports.AllocationInstruction; },
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
  }
);

exports.AllocationFactoryView = {
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

exports.AllocationFactory_Allocate = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo.decoder,
      allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification.decoder,
      requestedAt: damlTypes.Time.decoder,
      inputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
      actors: damlTypes.List(damlTypes.Party).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo.encode(__typed__.settlement),
      allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification.encode(__typed__.allocation),
      requestedAt: damlTypes.Time.encode(__typed__.requestedAt),
      inputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).encode(__typed__.inputHoldingCids),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
      actors: damlTypes.List(damlTypes.Party).encode(__typed__.actors),
    };
  },
};

exports.AllocationFactory_PublicFetch = {
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

exports.AllocationInstructionAction = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.object({
        tag: jtv.constant("AIA_Withdraw"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("AIA_Accept"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("AIA_Custom"),
        value: exports.AllocationInstructionAction.AIA_Custom.decoder,
      }),
    );
  }),
  encode: function (__typed__) {
    switch(__typed__.tag) {
      case 'AIA_Withdraw': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'AIA_Accept': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'AIA_Custom': return {tag: __typed__.tag, value: exports.AllocationInstructionAction.AIA_Custom.encode(__typed__.value)};
      default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type AllocationInstructionAction';
    }
  },
  AIA_Custom: {
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

exports.AllocationInstructionResult = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      output: exports.AllocationInstructionResult_Output.decoder,
      authorizerChangeCids: damlTypes.TextMap(damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding))).decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      output: exports.AllocationInstructionResult_Output.encode(__typed__.output),
      authorizerChangeCids: damlTypes.TextMap(damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding))).encode(__typed__.authorizerChangeCids),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.AllocationInstructionResult_Output = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.object({
        tag: jtv.constant("AllocationInstructionResult_Pending"),
        value: exports.AllocationInstructionResult_Output.AllocationInstructionResult_Pending.decoder,
      }),
      jtv.object({
        tag: jtv.constant("AllocationInstructionResult_Completed"),
        value: exports.AllocationInstructionResult_Output.AllocationInstructionResult_Completed.decoder,
      }),
      jtv.object({
        tag: jtv.constant("AllocationInstructionResult_Failed"),
        value: damlTypes.Unit.decoder,
      }),
    );
  }),
  encode: function (__typed__) {
    switch(__typed__.tag) {
      case 'AllocationInstructionResult_Pending': return {tag: __typed__.tag, value: exports.AllocationInstructionResult_Output.AllocationInstructionResult_Pending.encode(__typed__.value)};
      case 'AllocationInstructionResult_Completed': return {tag: __typed__.tag, value: exports.AllocationInstructionResult_Output.AllocationInstructionResult_Completed.encode(__typed__.value)};
      case 'AllocationInstructionResult_Failed': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type AllocationInstructionResult_Output';
    }
  },
  AllocationInstructionResult_Completed: {
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        allocationCid: damlTypes.ContractId(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation).decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        allocationCid: damlTypes.ContractId(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.Allocation).encode(__typed__.allocationCid),
      };
    },
  },
  AllocationInstructionResult_Pending: {
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        allocationInstructionCid: damlTypes.ContractId(exports.AllocationInstruction).decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        allocationInstructionCid: damlTypes.ContractId(exports.AllocationInstruction).encode(__typed__.allocationInstructionCid),
      };
    },
  },
};

exports.AllocationInstructionView = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      originalInstructionCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.AllocationInstruction)).decoder),
      settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo.decoder,
      allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification.decoder,
      requestedAt: damlTypes.Time.decoder,
      inputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).decoder,
      expiresAt: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder),
      availableActions: damlTypes.Map(exports.AllocationInstructionAction, damlTypes.List(damlTypes.List(damlTypes.Party))).decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      originalInstructionCid: damlTypes.Optional(damlTypes.ContractId(exports.AllocationInstruction)).encode(__typed__.originalInstructionCid),
      settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo.encode(__typed__.settlement),
      allocation: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification.encode(__typed__.allocation),
      requestedAt: damlTypes.Time.encode(__typed__.requestedAt),
      inputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).encode(__typed__.inputHoldingCids),
      expiresAt: damlTypes.Optional(damlTypes.Time).encode(__typed__.expiresAt),
      availableActions: damlTypes.Map(exports.AllocationInstructionAction, damlTypes.List(damlTypes.List(damlTypes.Party))).encode(__typed__.availableActions),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.AllocationInstruction_Accept = {
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

exports.AllocationInstruction_Withdraw = {
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
