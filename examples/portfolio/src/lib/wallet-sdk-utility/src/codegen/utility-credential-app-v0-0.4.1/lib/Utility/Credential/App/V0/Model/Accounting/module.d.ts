// Generated from Utility/Credential/App/V0/Model/Accounting.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23 from '@daml.js/splice-amulet-0.1.16';

export declare type RewardRecord_Archive_Result = {
};

export declare const RewardRecord_Archive_Result:
  damlTypes.Serializable<RewardRecord_Archive_Result> & {
  }
;


export declare type RewardRecord_Archive = {
};

export declare const RewardRecord_Archive:
  damlTypes.Serializable<RewardRecord_Archive> & {
  }
;


export declare type RewardRecord = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  user: damlTypes.Party;
  ccRewardsEarned: damlTypes.Numeric;
  round: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Types.Round;
  reference: string;
};

export declare interface RewardRecordInterface {
  Archive: damlTypes.Choice<RewardRecord, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RewardRecord, undefined>>;
  RewardRecord_Archive: damlTypes.Choice<RewardRecord, RewardRecord_Archive, RewardRecord_Archive_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<RewardRecord, undefined>>;
}
export declare const RewardRecord:
  damlTypes.Template<RewardRecord, undefined, '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Accounting:RewardRecord'> &
  damlTypes.ToInterface<RewardRecord, never> &
  RewardRecordInterface;

export declare namespace RewardRecord {
}



export declare type FeeRecord_Archive_Result = {
};

export declare const FeeRecord_Archive_Result:
  damlTypes.Serializable<FeeRecord_Archive_Result> & {
  }
;


export declare type FeeRecord_Archive = {
};

export declare const FeeRecord_Archive:
  damlTypes.Serializable<FeeRecord_Archive> & {
  }
;


export declare type FeeRecord_CalculateReward = {
  issuingMiningRound: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Round.IssuingMiningRound;
};

export declare const FeeRecord_CalculateReward:
  damlTypes.Serializable<FeeRecord_CalculateReward> & {
  }
;


export declare type FeeRecord = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  user: damlTypes.Party;
  dso: damlTypes.Party;
  ccFeesBurned: damlTypes.Numeric;
  extraFeaturedAppCcFeesBurned: damlTypes.Numeric;
  isFeatured: boolean;
  round: pkgc208d7ead1e4e9b610fc2054d0bf00716144ad444011bce0b02dcd6cd0cb8a23.Splice.Types.Round;
  reference: string;
};

export declare interface FeeRecordInterface {
  FeeRecord_CalculateReward: damlTypes.Choice<FeeRecord, FeeRecord_CalculateReward, damlTypes.ContractId<RewardRecord>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FeeRecord, undefined>>;
  FeeRecord_Archive: damlTypes.Choice<FeeRecord, FeeRecord_Archive, FeeRecord_Archive_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FeeRecord, undefined>>;
  Archive: damlTypes.Choice<FeeRecord, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<FeeRecord, undefined>>;
}
export declare const FeeRecord:
  damlTypes.Template<FeeRecord, undefined, '#utility-credential-app-v0:Utility.Credential.App.V0.Model.Accounting:FeeRecord'> &
  damlTypes.ToInterface<FeeRecord, never> &
  FeeRecordInterface;

export declare namespace FeeRecord {
}


