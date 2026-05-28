// Generated from Splice/Fees.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 from '@daml.js/daml-prim-DA-Types-1.0.0';

import * as Splice_Types from '../../Splice/Types/module';

export declare type RatePerDay = {
  rate: damlTypes.Numeric;
};

export declare const RatePerDay:
  damlTypes.Serializable<RatePerDay> & {
  }
;


export declare type ExpiringAmount = {
  initialAmount: damlTypes.Numeric;
  createdAt: Splice_Types.Round;
  ratePerRound: RatePerRound;
};

export declare const ExpiringAmount:
  damlTypes.Serializable<ExpiringAmount> & {
  }
;


export declare type SteppedRate = {
  initialRate: damlTypes.Numeric;
  steps: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<damlTypes.Numeric, damlTypes.Numeric>[];
};

export declare const SteppedRate:
  damlTypes.Serializable<SteppedRate> & {
  }
;


export declare type FixedFee = {
  fee: damlTypes.Numeric;
};

export declare const FixedFee:
  damlTypes.Serializable<FixedFee> & {
  }
;


export declare type RatePerRound = {
  rate: damlTypes.Numeric;
};

export declare const RatePerRound:
  damlTypes.Serializable<RatePerRound> & {
  }
;

