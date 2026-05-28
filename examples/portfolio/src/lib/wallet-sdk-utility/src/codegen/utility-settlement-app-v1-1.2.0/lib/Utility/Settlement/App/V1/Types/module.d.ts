// Generated from Utility/Settlement/App/V1/Types.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b from '@daml.js/splice-api-token-holding-v1-1.0.0';

export declare type WithOperatorProposer = {
  operator: damlTypes.Party;
  proposer: damlTypes.Party;
};

export declare const WithOperatorProposer:
  damlTypes.Serializable<WithOperatorProposer> & {
  }
;


export declare type WithOperatorAcceptor = {
  operator: damlTypes.Party;
  acceptor: damlTypes.Party;
};

export declare const WithOperatorAcceptor:
  damlTypes.Serializable<WithOperatorAcceptor> & {
  }
;


export declare type WithOperator = {
  operator: damlTypes.Party;
};

export declare const WithOperator:
  damlTypes.Serializable<WithOperator> & {
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

