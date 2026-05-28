// Generated from Splice/AmuletConfig.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946 from '@daml.js/daml-stdlib-DA-Time-Types-1.0.0';

import * as Splice_DecentralizedSynchronizer from '../../Splice/DecentralizedSynchronizer/module';
import * as Splice_Fees from '../../Splice/Fees/module';
import * as Splice_Issuance from '../../Splice/Issuance/module';
import * as Splice_Schedule from '../../Splice/Schedule/module';

export declare type PackageConfig = {
  amulet: string;
  amuletNameService: string;
  dsoGovernance: string;
  validatorLifecycle: string;
  wallet: string;
  walletPayments: string;
};

export declare const PackageConfig:
  damlTypes.Serializable<PackageConfig> & {
  }
;


export declare type AmuletConfig<unit> = {
  transferConfig: TransferConfig<unit>;
  issuanceCurve: Splice_Schedule.Schedule<pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime, Splice_Issuance.IssuanceConfig>;
  decentralizedSynchronizer: Splice_DecentralizedSynchronizer.AmuletDecentralizedSynchronizerConfig;
  tickDuration: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime;
  packageConfig: PackageConfig;
  transferPreapprovalFee: damlTypes.Optional<damlTypes.Numeric>;
  featuredAppActivityMarkerAmount: damlTypes.Optional<damlTypes.Numeric>;
  optDevelopmentFundManager: damlTypes.Optional<damlTypes.Party>;
};

export declare const AmuletConfig :
  (<unit>(unit: damlTypes.Serializable<unit>) => damlTypes.Serializable<AmuletConfig<unit>>) & {
};


export declare type TransferConfig<unit> = {
  createFee: Splice_Fees.FixedFee;
  holdingFee: Splice_Fees.RatePerRound;
  transferFee: Splice_Fees.SteppedRate;
  lockHolderFee: Splice_Fees.FixedFee;
  extraFeaturedAppRewardAmount: damlTypes.Numeric;
  maxNumInputs: damlTypes.Int;
  maxNumOutputs: damlTypes.Int;
  maxNumLockHolders: damlTypes.Int;
};

export declare const TransferConfig :
  (<unit>(unit: damlTypes.Serializable<unit>) => damlTypes.Serializable<TransferConfig<unit>>) & {
};


export declare type USD =
  | 'USD'
;

export declare const USD:
  damlTypes.Serializable<USD> & {
  }
& { readonly keys: USD[] } & { readonly [e in USD]: e }
;


export declare type Amulet =
  | 'Amulet'
;

export declare const Amulet:
  damlTypes.Serializable<Amulet> & {
  }
& { readonly keys: Amulet[] } & { readonly [e in Amulet]: e }
;

