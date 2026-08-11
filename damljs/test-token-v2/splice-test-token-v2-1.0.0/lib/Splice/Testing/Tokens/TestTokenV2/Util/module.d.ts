// Generated from ../../../../../Splice/Testing/Tokens/TestTokenV2/Util/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

export declare type CallSource =
  | 'CalledFromV1'
  | 'CalledFromV2'


export declare const CallSource:
  damlTypes.Serializable<CallSource> & { readonly keys: CallSource[] } & { readonly [e in CallSource]: e }
