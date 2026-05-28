// Generated from DA/Numeric.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

export declare type RoundingMode =
  | 'RoundingUp'
  | 'RoundingDown'
  | 'RoundingCeiling'
  | 'RoundingFloor'
  | 'RoundingHalfUp'
  | 'RoundingHalfDown'
  | 'RoundingHalfEven'
  | 'RoundingUnnecessary'
;

export declare const RoundingMode:
  damlTypes.Serializable<RoundingMode> & {
  }
& { readonly keys: RoundingMode[] } & { readonly [e in RoundingMode]: e }
;

