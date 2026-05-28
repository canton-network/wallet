// Generated from Splice/Types.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

export declare type ForOwner = {
  dso: damlTypes.Party;
  owner: damlTypes.Party;
};

export declare const ForOwner:
  damlTypes.Serializable<ForOwner> & {
  }
;


export declare type ForRound = {
  dso: damlTypes.Party;
  round: Round;
};

export declare const ForRound:
  damlTypes.Serializable<ForRound> & {
  }
;


export declare type ForDso = {
  dso: damlTypes.Party;
};

export declare const ForDso:
  damlTypes.Serializable<ForDso> & {
  }
;


export declare type Round = {
  number: damlTypes.Int;
};

export declare const Round:
  damlTypes.Serializable<Round> & {
  }
;

