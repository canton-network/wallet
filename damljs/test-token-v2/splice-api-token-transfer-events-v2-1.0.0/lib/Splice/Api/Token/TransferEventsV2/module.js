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

exports.EventLog = damlTypes.assembleInterface(
  '#splice-api-token-transfer-events-v2:Splice.Api.Token.TransferEventsV2:EventLog',
  '#5c1097a9bad0af4bcfe6d3fb0fe55112d3d11f18eae57ddfb14c20836fee226c:Splice.Api.Token.TransferEventsV2:EventLog',
  function () { return exports.EventLogView; },
  {
    Archive: {
      template: function () { return exports.EventLog; },
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
    EventLog_HoldingsChange: {
      template: function () { return exports.EventLog; },
      choiceName: 'EventLog_HoldingsChange',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.EventLog_HoldingsChange.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.EventLog_HoldingsChange.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return exports.EventLog_HoldingsChangeResult.decoder;
      }),
      resultEncode: function (__typed__) { return exports.EventLog_HoldingsChangeResult.encode(__typed__); },
    },
  }
);

exports.EventLogView = {
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

exports.EventLog_HoldingsChange = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      admin: damlTypes.Party.decoder,
      account: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.decoder,
      inputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).decoder,
      transferLegSides: damlTypes.List(exports.TransferLegSide).decoder,
      outputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).decoder,
      observers: damlTypes.List(damlTypes.Party).decoder,
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      admin: damlTypes.Party.encode(__typed__.admin),
      account: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.encode(__typed__.account),
      inputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).encode(__typed__.inputHoldingCids),
      transferLegSides: damlTypes.List(exports.TransferLegSide).encode(__typed__.transferLegSides),
      outputHoldingCids: damlTypes.List(damlTypes.ContractId(pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding)).encode(__typed__.outputHoldingCids),
      observers: damlTypes.List(damlTypes.Party).encode(__typed__.observers),
      extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs.encode(__typed__.extraArgs),
    };
  },
};

exports.EventLog_HoldingsChangeResult = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
    });
  }),
  encode: function (__typed__) {
    return {};
  },
};

exports.TransferLegSide = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      transferLegId: damlTypes.Text.decoder,
      side: exports.TransferSide.decoder,
      otherside: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.decoder,
      amount: damlTypes.Numeric(10).decoder,
      instrumentId: damlTypes.Text.decoder,
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      transferLegId: damlTypes.Text.encode(__typed__.transferLegId),
      side: exports.TransferSide.encode(__typed__.side),
      otherside: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account.encode(__typed__.otherside),
      amount: damlTypes.Numeric(10).encode(__typed__.amount),
      instrumentId: damlTypes.Text.encode(__typed__.instrumentId),
      meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata.encode(__typed__.meta),
    };
  },
};

exports.TransferSide = {
  SenderSide: 'SenderSide',
  ReceiverSide: 'ReceiverSide',
  keys: ['SenderSide', 'ReceiverSide'],
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.constant(exports.TransferSide.SenderSide),
      jtv.constant(exports.TransferSide.ReceiverSide),
    );
  }),
  encode: function (__typed__) { return __typed__; },
};
