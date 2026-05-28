// Generated from Utility/Registry/Holding/V0/Util.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 from '@daml.js/daml-prim-DA-Types-1.0.0';
import * as pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff from '@daml.js/daml-stdlib-DA-Set-Types-1.0.0';

import * as Utility_Registry_Holding_V0_Holding from '../../../../../Utility/Registry/Holding/V0/Holding/module';

export declare type ExpectedLock = {
  lockers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set<damlTypes.Party>;
  context: string;
};

export declare const ExpectedLock:
  damlTypes.Serializable<ExpectedLock> & {
  }
;


export declare type CollapseAction_Result = {
  output: damlTypes.Optional<pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<damlTypes.ContractId<Utility_Registry_Holding_V0_Holding.Holding>, Utility_Registry_Holding_V0_Holding.Holding>>;
  remaining: damlTypes.Optional<damlTypes.ContractId<Utility_Registry_Holding_V0_Holding.Holding>>;
};

export declare const CollapseAction_Result:
  damlTypes.Serializable<CollapseAction_Result> & {
  }
;


export declare type CollapseAction =
  |  { tag: 'MergeSplit'; value: {} }
  |  { tag: 'MergeSplitLock'; value: Utility_Registry_Holding_V0_Holding.Lock }
  |  { tag: 'MergeSplitBurn'; value: {} }
  |  { tag: 'UnlockMergeSplitBurn'; value: ExpectedLock }
  |  { tag: 'MergeSplitTransfer'; value: damlTypes.Party }
  |  { tag: 'UnlockMergeSplitTransfer'; value: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<ExpectedLock, damlTypes.Party> }
  |  { tag: 'AutoUnlockMergeSplitTransfer'; value: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<ExpectedLock, damlTypes.Party> }
  |  { tag: 'UnlockMergeSplitLockRemaining'; value: {} }
;

export declare const CollapseAction:
  damlTypes.Serializable<CollapseAction> & {
  }
;

