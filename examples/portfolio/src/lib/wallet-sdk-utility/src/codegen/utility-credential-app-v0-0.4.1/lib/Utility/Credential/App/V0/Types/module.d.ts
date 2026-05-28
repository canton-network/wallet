// Generated from Utility/Credential/App/V0/Types.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 from '@daml.js/splice-amulet-0.1.16';

export declare type WithOperatorIssuerHolder = {
  operator: damlTypes.Party;
  issuer: damlTypes.Party;
  holder: damlTypes.Party;
};

export declare const WithOperatorIssuerHolder:
  damlTypes.Serializable<WithOperatorIssuerHolder> & {
  }
;


export declare type WithOperatorHolder = {
  operator: damlTypes.Party;
  holder: damlTypes.Party;
};

export declare const WithOperatorHolder:
  damlTypes.Serializable<WithOperatorHolder> & {
  }
;


export declare type WithOperator = {
  operator: damlTypes.Party;
};

export declare const WithOperator:
  damlTypes.Serializable<WithOperator> & {
  }
;


export declare type WithDsoOperatorHolder = {
  dso: damlTypes.Party;
  operator: damlTypes.Party;
  holder: damlTypes.Party;
};

export declare const WithDsoOperatorHolder:
  damlTypes.Serializable<WithDsoOperatorHolder> & {
  }
;


export declare type WithDsoOperatorIssuer = {
  dso: damlTypes.Party;
  operator: damlTypes.Party;
  issuer: damlTypes.Party;
};

export declare const WithDsoOperatorIssuer:
  damlTypes.Serializable<WithDsoOperatorIssuer> & {
  }
;


export declare type WithDsoOperator = {
  dso: damlTypes.Party;
  operator: damlTypes.Party;
};

export declare const WithDsoOperator:
  damlTypes.Serializable<WithDsoOperator> & {
  }
;


export declare type BillingContext = {
  now: damlTypes.Time;
  amuletRulesCid: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AmuletRules>;
  openRoundCid: damlTypes.ContractId<pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound>;
  openRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.OpenMiningRound;
  featuredTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
  unfeaturedTransferContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.AppTransferContext;
  feeComputationContext: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.AmuletRules.TransferContext;
};

export declare const BillingContext:
  damlTypes.Serializable<BillingContext> & {
  }
;


export declare type BillingCycleParams = {
  amuletPrice: damlTypes.Numeric;
  credentialFeeCc: damlTypes.Numeric;
  newBilledUntil: damlTypes.Time;
  depositExpiresAt: damlTypes.Time;
};

export declare const BillingCycleParams:
  damlTypes.Serializable<BillingCycleParams> & {
  }
;


export declare type BillingState = {
  createdAt: damlTypes.Time;
  status: BillingStatus;
  lastBilledAt: damlTypes.Time;
  billedUntil: damlTypes.Time;
  lastBilledInRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Types.Round;
  totalCcFeesPaidIssuerCc: damlTypes.Numeric;
  totalCcFeesPaidHolderCc: damlTypes.Numeric;
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


export declare type BalanceState = {
  currentDepositAmountCc: damlTypes.Numeric;
  totalCredentialFeesPaidCc: damlTypes.Numeric;
  totalDistributedCc: damlTypes.Numeric;
  totalPaidOutCc: damlTypes.Numeric;
  totalUserDepositCc: damlTypes.Numeric;
};

export declare const BalanceState:
  damlTypes.Serializable<BalanceState> & {
  }
;


export declare type BillingParams = {
  feePerDayUsd: RatePerDay;
  billingPeriodMinutes: damlTypes.Int;
  depositTargetAmountUsd: damlTypes.Numeric;
  holderActivityWeight: damlTypes.Optional<damlTypes.Numeric>;
};

export declare const BillingParams:
  damlTypes.Serializable<BillingParams> & {
  }
;


export declare type RatePerDay = {
  rate: damlTypes.Numeric;
};

export declare const RatePerDay:
  damlTypes.Serializable<RatePerDay> & {
  }
;

