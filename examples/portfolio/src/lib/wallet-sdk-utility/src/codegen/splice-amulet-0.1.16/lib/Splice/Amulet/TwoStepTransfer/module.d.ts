// Generated from Splice/Amulet/TwoStepTransfer.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

export declare type TwoStepTransfer = {
  dso: damlTypes.Party;
  sender: damlTypes.Party;
  receiver: damlTypes.Party;
  amount: damlTypes.Numeric;
  lockContext: string;
  transferBefore: damlTypes.Time;
  transferBeforeDeadline: string;
  provider: damlTypes.Party;
  allowFeaturing: boolean;
};

export declare const TwoStepTransfer:
  damlTypes.Serializable<TwoStepTransfer> & {
  }
;

