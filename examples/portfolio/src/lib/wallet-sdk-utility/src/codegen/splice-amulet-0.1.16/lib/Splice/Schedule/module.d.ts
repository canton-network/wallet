// Generated from Splice/Schedule.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 from '@daml.js/daml-prim-DA-Types-1.0.0';

export declare type Schedule<t, a> = {
  initialValue: a;
  futureValues: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<t, a>[];
};

export declare const Schedule :
  (<t, a>(t: damlTypes.Serializable<t>, a: damlTypes.Serializable<a>) => damlTypes.Serializable<Schedule<t, a>>) & {
};

