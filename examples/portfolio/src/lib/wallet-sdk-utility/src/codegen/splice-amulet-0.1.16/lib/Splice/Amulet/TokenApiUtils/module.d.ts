// Generated from Splice/Amulet/TokenApiUtils.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

export declare type TxKind =
  | 'TxKind_Transfer'
  | 'TxKind_Unlock'
  | 'TxKind_MergeSplit'
  | 'TxKind_Burn'
  | 'TxKind_Mint'
  | 'TxKind_ExpireDust'
;

export declare const TxKind:
  damlTypes.Serializable<TxKind> & {
  }
& { readonly keys: TxKind[] } & { readonly [e in TxKind]: e }
;

