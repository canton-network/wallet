// Generated from Splice/Round.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946 from '@daml.js/daml-stdlib-DA-Time-Types-1.0.0';

import * as Splice_AmuletConfig from '../../Splice/AmuletConfig/module';
import * as Splice_Issuance from '../../Splice/Issuance/module';
import * as Splice_Types from '../../Splice/Types/module';

export declare type ClosedMiningRound = {
  dso: damlTypes.Party;
  round: Splice_Types.Round;
  issuancePerValidatorRewardCoupon: damlTypes.Numeric;
  issuancePerFeaturedAppRewardCoupon: damlTypes.Numeric;
  issuancePerUnfeaturedAppRewardCoupon: damlTypes.Numeric;
  issuancePerSvRewardCoupon: damlTypes.Numeric;
  optIssuancePerValidatorFaucetCoupon: damlTypes.Optional<damlTypes.Numeric>;
};

export declare interface ClosedMiningRoundInterface {
  Archive: damlTypes.Choice<ClosedMiningRound, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ClosedMiningRound, undefined>>;
}
export declare const ClosedMiningRound:
  damlTypes.Template<ClosedMiningRound, undefined, '#splice-amulet:Splice.Round:ClosedMiningRound'> &
  damlTypes.ToInterface<ClosedMiningRound, never> &
  ClosedMiningRoundInterface;

export declare namespace ClosedMiningRound {
}



export declare type IssuingMiningRound = {
  dso: damlTypes.Party;
  round: Splice_Types.Round;
  issuancePerValidatorRewardCoupon: damlTypes.Numeric;
  issuancePerFeaturedAppRewardCoupon: damlTypes.Numeric;
  issuancePerUnfeaturedAppRewardCoupon: damlTypes.Numeric;
  issuancePerSvRewardCoupon: damlTypes.Numeric;
  opensAt: damlTypes.Time;
  targetClosesAt: damlTypes.Time;
  optIssuancePerValidatorFaucetCoupon: damlTypes.Optional<damlTypes.Numeric>;
};

export declare interface IssuingMiningRoundInterface {
  Archive: damlTypes.Choice<IssuingMiningRound, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<IssuingMiningRound, undefined>>;
}
export declare const IssuingMiningRound:
  damlTypes.Template<IssuingMiningRound, undefined, '#splice-amulet:Splice.Round:IssuingMiningRound'> &
  damlTypes.ToInterface<IssuingMiningRound, never> &
  IssuingMiningRoundInterface;

export declare namespace IssuingMiningRound {
}



export declare type SummarizingMiningRound = {
  dso: damlTypes.Party;
  round: Splice_Types.Round;
  amuletPrice: damlTypes.Numeric;
  issuanceConfig: Splice_Issuance.IssuanceConfig;
  tickDuration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime;
};

export declare interface SummarizingMiningRoundInterface {
  Archive: damlTypes.Choice<SummarizingMiningRound, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<SummarizingMiningRound, undefined>>;
}
export declare const SummarizingMiningRound:
  damlTypes.Template<SummarizingMiningRound, undefined, '#splice-amulet:Splice.Round:SummarizingMiningRound'> &
  damlTypes.ToInterface<SummarizingMiningRound, never> &
  SummarizingMiningRoundInterface;

export declare namespace SummarizingMiningRound {
}



export declare type OpenMiningRound_Fetch = {
  p: damlTypes.Party;
};

export declare const OpenMiningRound_Fetch:
  damlTypes.Serializable<OpenMiningRound_Fetch> & {
  }
;


export declare type OpenMiningRound = {
  dso: damlTypes.Party;
  round: Splice_Types.Round;
  amuletPrice: damlTypes.Numeric;
  opensAt: damlTypes.Time;
  targetClosesAt: damlTypes.Time;
  issuingFor: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime;
  transferConfigUsd: Splice_AmuletConfig.TransferConfig<Splice_AmuletConfig.USD>;
  issuanceConfig: Splice_Issuance.IssuanceConfig;
  tickDuration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime;
};

export declare interface OpenMiningRoundInterface {
  Archive: damlTypes.Choice<OpenMiningRound, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<OpenMiningRound, undefined>>;
  OpenMiningRound_Fetch: damlTypes.Choice<OpenMiningRound, OpenMiningRound_Fetch, OpenMiningRound, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<OpenMiningRound, undefined>>;
}
export declare const OpenMiningRound:
  damlTypes.Template<OpenMiningRound, undefined, '#splice-amulet:Splice.Round:OpenMiningRound'> &
  damlTypes.ToInterface<OpenMiningRound, never> &
  OpenMiningRoundInterface;

export declare namespace OpenMiningRound {
}


