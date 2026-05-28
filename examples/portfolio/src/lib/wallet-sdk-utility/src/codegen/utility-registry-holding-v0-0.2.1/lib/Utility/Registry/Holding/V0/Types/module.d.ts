// Generated from Utility/Registry/Holding/V0/Types.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

export declare type WithOperatorRegistrarHolderInstrument = {
  operator: damlTypes.Party;
  registrar: damlTypes.Party;
  holder: damlTypes.Party;
  instrument: InstrumentIdentifier;
};

export declare const WithOperatorRegistrarHolderInstrument:
  damlTypes.Serializable<WithOperatorRegistrarHolderInstrument> & {
  }
;


export declare type WithOperatorProviderRegistrarHolderInstrument = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  holder: damlTypes.Party;
  instrument: InstrumentIdentifier;
};

export declare const WithOperatorProviderRegistrarHolderInstrument:
  damlTypes.Serializable<WithOperatorProviderRegistrarHolderInstrument> & {
  }
;


export declare type WithOperatorProviderRegistrarHolder = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  holder: damlTypes.Party;
};

export declare const WithOperatorProviderRegistrarHolder:
  damlTypes.Serializable<WithOperatorProviderRegistrarHolder> & {
  }
;


export declare type WithOperatorRegistrar = {
  operator: damlTypes.Party;
  registrar: damlTypes.Party;
};

export declare const WithOperatorRegistrar:
  damlTypes.Serializable<WithOperatorRegistrar> & {
  }
;


export declare type WithOperatorProviderRegistrar = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
};

export declare const WithOperatorProviderRegistrar:
  damlTypes.Serializable<WithOperatorProviderRegistrar> & {
  }
;


export declare type WithOperatorProvider = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
};

export declare const WithOperatorProvider:
  damlTypes.Serializable<WithOperatorProvider> & {
  }
;


export declare type WithOperator = {
  operator: damlTypes.Party;
};

export declare const WithOperator:
  damlTypes.Serializable<WithOperator> & {
  }
;


export declare type InstrumentIdentifier = {
  source: damlTypes.Party;
  id: string;
  scheme: string;
};

export declare const InstrumentIdentifier:
  damlTypes.Serializable<InstrumentIdentifier> & {
  }
;

