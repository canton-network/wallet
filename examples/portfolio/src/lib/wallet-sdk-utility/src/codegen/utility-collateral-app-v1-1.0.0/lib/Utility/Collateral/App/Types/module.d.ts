// Generated from Utility/Collateral/App/Types.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b from '@daml.js/splice-api-token-holding-v1-1.0.0';

export declare type WithOperatorCounterparty = {
  operator: damlTypes.Party;
  counterparty: damlTypes.Party;
};

export declare const WithOperatorCounterparty:
  damlTypes.Serializable<WithOperatorCounterparty> & {
  }
;


export declare type WithOperatorRequestor = {
  operator: damlTypes.Party;
  requestor: damlTypes.Party;
};

export declare const WithOperatorRequestor:
  damlTypes.Serializable<WithOperatorRequestor> & {
  }
;


export declare type WithOperator = {
  operator: damlTypes.Party;
};

export declare const WithOperator:
  damlTypes.Serializable<WithOperator> & {
  }
;


export declare type CollateralPosition = {
  pledgor: damlTypes.Party;
  securedParty: damlTypes.Party;
  instrument: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId;
  amount: damlTypes.Numeric;
};

export declare const CollateralPosition:
  damlTypes.Serializable<CollateralPosition> & {
  }
;


export declare type Terms = {
  eligibleCollateral: EligibilitySchedule;
};

export declare const Terms:
  damlTypes.Serializable<Terms> & {
  }
;


export declare type InstrumentQuantity = {
  instrument: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId;
  amount: damlTypes.Numeric;
};

export declare const InstrumentQuantity:
  damlTypes.Serializable<InstrumentQuantity> & {
  }
;


export declare type EligibilitySchedule = {
  eligibleInstruments: EligibleInstrument[];
};

export declare const EligibilitySchedule:
  damlTypes.Serializable<EligibilitySchedule> & {
  }
;


export declare type EligibleInstrument = {
  instrument: pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.InstrumentId;
};

export declare const EligibleInstrument:
  damlTypes.Serializable<EligibleInstrument> & {
  }
;

