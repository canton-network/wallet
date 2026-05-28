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

var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea = require('@daml.js/splice-api-featured-app-v2-1.0.0');


exports.RewardBatch = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({beneficiaries: damlTypes.List(pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.AppRewardBeneficiary).decoder, markerWeight: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    beneficiaries: damlTypes.List(pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.AppRewardBeneficiary).encode(__typed__.beneficiaries),
    markerWeight: damlTypes.Numeric(10).encode(__typed__.markerWeight),
  };
}
,
};



exports.DelegatedBatchedMarkersProxy_CreateMarkers_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({results: damlTypes.List(pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.FeaturedAppRight_CreateActivityMarkerResult).decoder, }); }),
  encode: function (__typed__) {
  return {
    results: damlTypes.List(pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.FeaturedAppRight_CreateActivityMarkerResult).encode(__typed__.results),
  };
}
,
};



exports.DelegatedBatchedMarkersProxy_Archive = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.DelegatedBatchedMarkersProxy_CreateMarkers = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({featuredAppRightCid: damlTypes.ContractId(pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.FeaturedAppRight).decoder, batches: damlTypes.List(exports.RewardBatch).decoder, }); }),
  encode: function (__typed__) {
  return {
    featuredAppRightCid: damlTypes.ContractId(pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.FeaturedAppRight).encode(__typed__.featuredAppRightCid),
    batches: damlTypes.List(exports.RewardBatch).encode(__typed__.batches),
  };
}
,
};



exports.DelegatedBatchedMarkersProxy = damlTypes.assembleTemplate(
{
  templateId: '#utility-commercials-v0:Utility.Commercials.V0.Model.DelegatedBatchedMarkersProxy:DelegatedBatchedMarkersProxy',
  templateIdWithPackageId: 'fa5b1cc5c8368dff7c2e6a74aa2af9d520d755e2a508f44acd17343326e41839:Utility.Commercials.V0.Model.DelegatedBatchedMarkersProxy:DelegatedBatchedMarkersProxy',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, provider: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    provider: damlTypes.Party.encode(__typed__.provider),
  };
}
,
  DelegatedBatchedMarkersProxy_CreateMarkers: {
    template: function () { return exports.DelegatedBatchedMarkersProxy; },
    choiceName: 'DelegatedBatchedMarkersProxy_CreateMarkers',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.DelegatedBatchedMarkersProxy_CreateMarkers.decoder; }),
    argumentEncode: function (__typed__) { return exports.DelegatedBatchedMarkersProxy_CreateMarkers.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.DelegatedBatchedMarkersProxy_CreateMarkers_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.DelegatedBatchedMarkersProxy_CreateMarkers_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.DelegatedBatchedMarkersProxy; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  DelegatedBatchedMarkersProxy_Archive: {
    template: function () { return exports.DelegatedBatchedMarkersProxy; },
    choiceName: 'DelegatedBatchedMarkersProxy_Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.DelegatedBatchedMarkersProxy_Archive.decoder; }),
    argumentEncode: function (__typed__) { return exports.DelegatedBatchedMarkersProxy_Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.DelegatedBatchedMarkersProxy, ['fa5b1cc5c8368dff7c2e6a74aa2af9d520d755e2a508f44acd17343326e41839', '#utility-commercials-v0']);

