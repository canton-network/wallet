// Generated from Utility/Registry/V0/Types.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

export declare type Batch = {
  id: string;
  size: damlTypes.Int;
  settlementFrom: damlTypes.Optional<damlTypes.Time>;
  settlementUntil: damlTypes.Optional<damlTypes.Time>;
};

export declare const Batch:
  damlTypes.Serializable<Batch> & {
  }
;

