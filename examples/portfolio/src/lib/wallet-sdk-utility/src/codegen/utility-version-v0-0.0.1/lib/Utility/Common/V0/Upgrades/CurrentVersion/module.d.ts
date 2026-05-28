// Generated from Utility/Common/V0/Upgrades/CurrentVersion.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type CurrentVersion_Update_Result = {
  newCurrentVersionCid: damlTypes.ContractId<CurrentVersion>;
};

export declare const CurrentVersion_Update_Result:
  damlTypes.Serializable<CurrentVersion_Update_Result> & {
  }
;


export declare type CurrentVersion_InUse = {
  newPackageIdInUse: string;
};

export declare const CurrentVersion_InUse:
  damlTypes.Serializable<CurrentVersion_InUse> & {
  }
;


export declare type CurrentVersion_UpdatePackageId = {
  newPackageId: string;
};

export declare const CurrentVersion_UpdatePackageId:
  damlTypes.Serializable<CurrentVersion_UpdatePackageId> & {
  }
;


export declare type CurrentVersion = {
  operator: damlTypes.Party;
  user: damlTypes.Party;
  packageName: string;
  packageId: string;
  packageIdInUse: damlTypes.Optional<string>;
};

export declare interface CurrentVersionInterface {
  CurrentVersion_UpdatePackageId: damlTypes.Choice<CurrentVersion, CurrentVersion_UpdatePackageId, CurrentVersion_Update_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CurrentVersion, undefined>>;
  Archive: damlTypes.Choice<CurrentVersion, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CurrentVersion, undefined>>;
  CurrentVersion_InUse: damlTypes.Choice<CurrentVersion, CurrentVersion_InUse, CurrentVersion_Update_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CurrentVersion, undefined>>;
}
export declare const CurrentVersion:
  damlTypes.Template<CurrentVersion, undefined, '#utility-version-v0:Utility.Common.V0.Upgrades.CurrentVersion:CurrentVersion'> &
  damlTypes.ToInterface<CurrentVersion, never> &
  CurrentVersionInterface;

export declare namespace CurrentVersion {
}


