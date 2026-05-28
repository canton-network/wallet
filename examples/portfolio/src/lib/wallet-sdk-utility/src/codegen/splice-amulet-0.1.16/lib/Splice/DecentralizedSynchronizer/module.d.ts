// Generated from Splice/DecentralizedSynchronizer.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946 from '@daml.js/daml-stdlib-DA-Time-Types-1.0.0';
import * as pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff from '@daml.js/daml-stdlib-DA-Set-Types-1.0.0';

export declare type ForMemberTraffic = {
  dso: damlTypes.Party;
  memberId: string;
  synchronizerId: string;
  migrationId: damlTypes.Int;
};

export declare const ForMemberTraffic:
  damlTypes.Serializable<ForMemberTraffic> & {
  }
;


export declare type MemberTraffic = {
  dso: damlTypes.Party;
  memberId: string;
  synchronizerId: string;
  migrationId: damlTypes.Int;
  totalPurchased: damlTypes.Int;
  numPurchases: damlTypes.Int;
  amuletSpent: damlTypes.Numeric;
  usdSpent: damlTypes.Numeric;
};

export declare interface MemberTrafficInterface {
  Archive: damlTypes.Choice<MemberTraffic, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MemberTraffic, undefined>>;
}
export declare const MemberTraffic:
  damlTypes.Template<MemberTraffic, undefined, '#splice-amulet:Splice.DecentralizedSynchronizer:MemberTraffic'> &
  damlTypes.ToInterface<MemberTraffic, never> &
  MemberTrafficInterface;

export declare namespace MemberTraffic {
}



export declare type SynchronizerFeesConfig = {
  baseRateTrafficLimits: BaseRateTrafficLimits;
  extraTrafficPrice: damlTypes.Numeric;
  readVsWriteScalingFactor: damlTypes.Int;
  minTopupAmount: damlTypes.Int;
};

export declare const SynchronizerFeesConfig:
  damlTypes.Serializable<SynchronizerFeesConfig> & {
  }
;


export declare type BaseRateTrafficLimits = {
  burstAmount: damlTypes.Int;
  burstWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime;
};

export declare const BaseRateTrafficLimits:
  damlTypes.Serializable<BaseRateTrafficLimits> & {
  }
;


export declare type AmuletDecentralizedSynchronizerConfig = {
  requiredSynchronizers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set<string>;
  activeSynchronizer: string;
  fees: SynchronizerFeesConfig;
};

export declare const AmuletDecentralizedSynchronizerConfig:
  damlTypes.Serializable<AmuletDecentralizedSynchronizerConfig> & {
  }
;

