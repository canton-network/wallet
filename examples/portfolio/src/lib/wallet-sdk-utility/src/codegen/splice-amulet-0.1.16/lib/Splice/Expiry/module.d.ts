// Generated from Splice/Expiry.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

export declare type TimeLock = {
  holders: damlTypes.Party[];
  expiresAt: damlTypes.Time;
  optContext: damlTypes.Optional<string>;
};

export declare const TimeLock:
  damlTypes.Serializable<TimeLock> & {
  }
;


export declare type BoundedSet<a> =
  |  { tag: 'Singleton'; value: a }
  |  { tag: 'AfterMaxBound'; value: {} }
;

export declare const BoundedSet :
  (<a>(a: damlTypes.Serializable<a>) => damlTypes.Serializable<BoundedSet<a>>) & {
};

