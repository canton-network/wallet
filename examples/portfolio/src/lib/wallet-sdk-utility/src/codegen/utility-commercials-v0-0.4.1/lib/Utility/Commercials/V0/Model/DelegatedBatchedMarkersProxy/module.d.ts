// Generated from Utility/Commercials/V0/Model/DelegatedBatchedMarkersProxy.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea from '@daml.js/splice-api-featured-app-v2-1.0.0';

export declare type RewardBatch = {
  beneficiaries: pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.AppRewardBeneficiary[];
  markerWeight: damlTypes.Numeric;
};

export declare const RewardBatch:
  damlTypes.Serializable<RewardBatch> & {
  }
;


export declare type DelegatedBatchedMarkersProxy_CreateMarkers_Result = {
  results: pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.FeaturedAppRight_CreateActivityMarkerResult[];
};

export declare const DelegatedBatchedMarkersProxy_CreateMarkers_Result:
  damlTypes.Serializable<DelegatedBatchedMarkersProxy_CreateMarkers_Result> & {
  }
;


export declare type DelegatedBatchedMarkersProxy_Archive = {
};

export declare const DelegatedBatchedMarkersProxy_Archive:
  damlTypes.Serializable<DelegatedBatchedMarkersProxy_Archive> & {
  }
;


export declare type DelegatedBatchedMarkersProxy_CreateMarkers = {
  featuredAppRightCid: damlTypes.ContractId<pkgdd22e3e168a8c7fd0313171922dabf1f7a3b131bd9bfc9ff98e606f8c57707ea.Splice.Api.FeaturedAppRightV2.FeaturedAppRight>;
  batches: RewardBatch[];
};

export declare const DelegatedBatchedMarkersProxy_CreateMarkers:
  damlTypes.Serializable<DelegatedBatchedMarkersProxy_CreateMarkers> & {
  }
;


export declare type DelegatedBatchedMarkersProxy = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
};

export declare interface DelegatedBatchedMarkersProxyInterface {
  DelegatedBatchedMarkersProxy_CreateMarkers: damlTypes.Choice<DelegatedBatchedMarkersProxy, DelegatedBatchedMarkersProxy_CreateMarkers, DelegatedBatchedMarkersProxy_CreateMarkers_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<DelegatedBatchedMarkersProxy, undefined>>;
  Archive: damlTypes.Choice<DelegatedBatchedMarkersProxy, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<DelegatedBatchedMarkersProxy, undefined>>;
  DelegatedBatchedMarkersProxy_Archive: damlTypes.Choice<DelegatedBatchedMarkersProxy, DelegatedBatchedMarkersProxy_Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<DelegatedBatchedMarkersProxy, undefined>>;
}
export declare const DelegatedBatchedMarkersProxy:
  damlTypes.Template<DelegatedBatchedMarkersProxy, undefined, '#utility-commercials-v0:Utility.Commercials.V0.Model.DelegatedBatchedMarkersProxy:DelegatedBatchedMarkersProxy'> &
  damlTypes.ToInterface<DelegatedBatchedMarkersProxy, never> &
  DelegatedBatchedMarkersProxyInterface;

export declare namespace DelegatedBatchedMarkersProxy {
}


