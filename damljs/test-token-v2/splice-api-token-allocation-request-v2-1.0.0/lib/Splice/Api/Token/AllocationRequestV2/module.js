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
var pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f = require('@daml.js/splice-api-token-metadata-v1-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

exports.AllocationRequest = damlTypes.assembleInterface(
  '#splice-api-token-allocation-request-v2:Splice.Api.Token.AllocationRequestV2:AllocationRequest',
  '#adc16315a8943a8433886694720a2a000ae84c2315c4414bd6d0db4d1660de9c:Splice.Api.Token.AllocationRequestV2:AllocationRequest',
  function () { return exports.AllocationRequestView; },
  {
    AllocationRequest_Accept: {
      template: function () { return exports.AllocationRequest; },
      choiceName: 'AllocationRequest_Accept',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationRequest_Accept.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AllocationRequest_Accept.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationRequest_AcceptResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AllocationRequest_AcceptResult.encode(__typed__); },
    },
    AllocationRequest_Reject: {
      template: function () { return exports.AllocationRequest; },
      choiceName: 'AllocationRequest_Reject',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationRequest_Reject.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AllocationRequest_Reject.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationRequest_RejectResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AllocationRequest_RejectResult.encode(__typed__); },
    },
    AllocationRequest_Withdraw: {
      template: function () { return exports.AllocationRequest; },
      choiceName: 'AllocationRequest_Withdraw',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationRequest_Withdraw.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AllocationRequest_Withdraw.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.AllocationRequest_WithdrawResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.AllocationRequest_WithdrawResult.encode(__typed__); },
    },
    Archive: {
      template: function () { return exports.AllocationRequest; },
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

exports.AllocationRequestAction = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.object({
        tag: jtv.constant("ARA_Accept"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("ARA_Reject"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("ARA_Custom"),
        value: exports.AllocationRequestAction.ARA_Custom.decoder,
      }),
    );
  }),
  encode: function (__typed__) {
    switch(__typed__.tag) {
      case 'ARA_Accept': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'ARA_Reject': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'ARA_Custom': return {tag: __typed__.tag, value: exports.AllocationRequestAction.ARA_Custom.encode(__typed__.value)};
      default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type AllocationRequestAction';
    }
  },
  ARA_Custom: {
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

exports.AllocationRequestView = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      originalRequestCid: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.AllocationRequest)).decoder),
      settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo.decoder,
      allocations: damlTypes.List(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification).decoder,
      requestedAt: damlTypes.Time.decoder,
      settleAt: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder),
      availableActions: damlTypes.Map(exports.AllocationRequestAction, damlTypes.List(damlTypes.List(damlTypes.Party))).decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      originalRequestCid: damlTypes.Optional(damlTypes.ContractId(exports.AllocationRequest)).encode(__typed__.originalRequestCid),
      settlement: pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementInfo.encode(__typed__.settlement),
      allocations: damlTypes.List(pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.AllocationSpecification).encode(__typed__.allocations),
      requestedAt: damlTypes.Time.encode(__typed__.requestedAt),
      settleAt: damlTypes.Optional(damlTypes.Time).encode(__typed__.settleAt),
      availableActions: damlTypes.Map(exports.AllocationRequestAction, damlTypes.List(damlTypes.List(damlTypes.Party))).encode(__typed__.availableActions),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.AllocationRequest_Accept = {
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

exports.AllocationRequest_AcceptResult = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.AllocationRequest_Reject = {
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

exports.AllocationRequest_RejectResult = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.AllocationRequest_Withdraw = {
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

exports.AllocationRequest_WithdrawResult = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};
