// Generated from Utility/Commercials/V0/Model/Types.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 from '@daml.js/splice-amulet-0.1.16';

export declare type BillingCycleParams = {
  amuletPrice: damlTypes.Numeric;
  feeAmountCc: damlTypes.Numeric;
  newBilledUntil: damlTypes.Time;
  depositExpiresAt: damlTypes.Time;
};

export declare const BillingCycleParams:
  damlTypes.Serializable<BillingCycleParams> & {
  }
;


export declare type BillingContext = {
  openRoundCid: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound>;
  openRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound;
  featuredTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
  unfeaturedTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
};

export declare const BillingContext:
  damlTypes.Serializable<BillingContext> & {
  }
;


export declare type UtilityFees = {
  credentialBillingFeeUsd: damlTypes.Optional<damlTypes.Numeric>;
  baseFee: damlTypes.Optional<FixedFee>;
};

export declare const UtilityFees:
  damlTypes.Serializable<UtilityFees> & {
  }
;


export declare type FixedFee = {
  feePerDayUsd: RatePerDay;
  billingPeriodMinutes: damlTypes.Int;
};

export declare const FixedFee:
  damlTypes.Serializable<FixedFee> & {
  }
;


export declare type RatePerDay = {
  rate: damlTypes.Numeric;
};

export declare const RatePerDay:
  damlTypes.Serializable<RatePerDay> & {
  }
;


export declare type EventBillingState = {
  status: BillingStatus;
  lastBilledAt: damlTypes.Time;
  lastBilledOffset: damlTypes.Int;
  migrationId: damlTypes.Optional<string>;
};

export declare const EventBillingState:
  damlTypes.Serializable<EventBillingState> & {
  }
;


export declare type BillingState = {
  status: BillingStatus;
  lastBilledAt: damlTypes.Time;
  billedUntil: damlTypes.Time;
};

export declare const BillingState:
  damlTypes.Serializable<BillingState> & {
  }
;


export declare type BillingStatus =
  |  { tag: 'Success'; value: {} }
  |  { tag: 'Failure'; value: BillingStatus.Failure }
  |  { tag: 'New'; value: {} }
;

export declare const BillingStatus:
  damlTypes.Serializable<BillingStatus> & {
  Failure: damlTypes.Serializable<BillingStatus.Failure>;
  }
;


export namespace BillingStatus {
  type Failure = {
    reason: string;
    context: string;
  };
} //namespace BillingStatus

