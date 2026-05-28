// Generated from GHC/Stack/Types.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 from '@daml.js/daml-prim-DA-Types-1.0.0';

export declare type CallStack =
  |  { tag: 'EmptyCallStack'; value: {} }
  |  { tag: 'PushCallStack'; value: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple3<string, SrcLoc, CallStack> }
  |  { tag: 'FreezeCallStack'; value: CallStack }
;

export declare const CallStack:
  damlTypes.Serializable<CallStack> & {
  }
;


export declare type SrcLoc = {
  srcLocPackage: string;
  srcLocModule: string;
  srcLocFile: string;
  srcLocStartLine: damlTypes.Int;
  srcLocStartCol: damlTypes.Int;
  srcLocEndLine: damlTypes.Int;
  srcLocEndCol: damlTypes.Int;
};

export declare const SrcLoc:
  damlTypes.Serializable<SrcLoc> & {
  }
;

