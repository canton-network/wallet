// Generated from Utility/Registry/Holding/V0/Holding.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b from '@daml.js/splice-api-token-holding-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff from '@daml.js/daml-stdlib-DA-Set-Types-1.0.0';

import * as Utility_Registry_Holding_V0_Types from '../../../../../Utility/Registry/Holding/V0/Types/module';

export declare type Holding_Transfer_Result = {
  holdingCid: damlTypes.ContractId<Holding>;
};

export declare const Holding_Transfer_Result:
  damlTypes.Serializable<Holding_Transfer_Result> & {
  }
;


export declare type Holding_Merge_Result = {
  holdingCid: damlTypes.ContractId<Holding>;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const Holding_Merge_Result:
  damlTypes.Serializable<Holding_Merge_Result> & {
  }
;


export declare type Holding_Split_Result = {
  splitCids: damlTypes.ContractId<Holding>[];
  remaining: damlTypes.Optional<damlTypes.ContractId<Holding>>;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const Holding_Split_Result:
  damlTypes.Serializable<Holding_Split_Result> & {
  }
;


export declare type Holding_Unlock_Result = {
  holdingCid: damlTypes.ContractId<Holding>;
  meta: damlTypes.Optional<pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata>;
};

export declare const Holding_Unlock_Result:
  damlTypes.Serializable<Holding_Unlock_Result> & {
  }
;


export declare type Holding_Lock_Result = {
  holdingCid: damlTypes.ContractId<Holding>;
};

export declare const Holding_Lock_Result:
  damlTypes.Serializable<Holding_Lock_Result> & {
  }
;


export declare type Lock = {
  lockers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set<damlTypes.Party>;
  context: string;
  observers: damlTypes.Optional<pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set<damlTypes.Party>>;
};

export declare const Lock:
  damlTypes.Serializable<Lock> & {
  }
;


export declare type Holding_Merge = {
  holdingCids: damlTypes.ContractId<Holding>[];
};

export declare const Holding_Merge:
  damlTypes.Serializable<Holding_Merge> & {
  }
;


export declare type Holding_Split = {
  amounts: damlTypes.Numeric[];
};

export declare const Holding_Split:
  damlTypes.Serializable<Holding_Split> & {
  }
;


export declare type Holding_Transfer = {
  newOwner: damlTypes.Party;
  newLabel: string;
};

export declare const Holding_Transfer:
  damlTypes.Serializable<Holding_Transfer> & {
  }
;


export declare type Holding_Unlock = {
};

export declare const Holding_Unlock:
  damlTypes.Serializable<Holding_Unlock> & {
  }
;


export declare type Holding_Lock = {
  lockers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set<damlTypes.Party>;
  context: string;
  observers: damlTypes.Optional<pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set<damlTypes.Party>>;
};

export declare const Holding_Lock:
  damlTypes.Serializable<Holding_Lock> & {
  }
;


export declare type Holding = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  registrar: damlTypes.Party;
  owner: damlTypes.Party;
  instrument: Utility_Registry_Holding_V0_Types.InstrumentIdentifier;
  label: string;
  amount: damlTypes.Numeric;
  lock: damlTypes.Optional<Lock>;
};

export declare interface HoldingInterface {
  Archive: damlTypes.Choice<Holding, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Holding, undefined>>;
  Holding_Unlock: damlTypes.Choice<Holding, Holding_Unlock, Holding_Unlock_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Holding, undefined>>;
  Holding_Merge: damlTypes.Choice<Holding, Holding_Merge, Holding_Merge_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Holding, undefined>>;
  Holding_Lock: damlTypes.Choice<Holding, Holding_Lock, Holding_Lock_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Holding, undefined>>;
  Holding_Transfer: damlTypes.Choice<Holding, Holding_Transfer, Holding_Transfer_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Holding, undefined>>;
  Holding_Split: damlTypes.Choice<Holding, Holding_Split, Holding_Split_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Holding, undefined>>;
}
export declare const Holding:
  damlTypes.Template<Holding, undefined, '#utility-registry-holding-v0:Utility.Registry.Holding.V0.Holding:Holding'> &
  damlTypes.ToInterface<Holding, pkg718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b.Splice.Api.Token.HoldingV1.Holding> &
  HoldingInterface;

export declare namespace Holding {
}


