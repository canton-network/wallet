// Generated from Utility/Registry/V0/Configuration/AppReward.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda from '@daml.js/splice-api-featured-app-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type AppRewardConfigurationDetails = {
  dso: damlTypes.Party;
  operatorAppRewardBeneficiary: pkg7804375fe5e4c6d5afe067bd314c42fe0b7d005a1300019c73154dd939da4dda.Splice.Api.FeaturedAppRightV1.AppRewardBeneficiary;
};

export declare const AppRewardConfigurationDetails:
  damlTypes.Serializable<AppRewardConfigurationDetails> & {
  }
;


export declare type AppRewardConfiguration_Modify = {
  details: AppRewardConfigurationDetails;
};

export declare const AppRewardConfiguration_Modify:
  damlTypes.Serializable<AppRewardConfiguration_Modify> & {
  }
;


export declare type AppRewardConfiguration = {
  operator: damlTypes.Party;
  provider: damlTypes.Party;
  details: AppRewardConfigurationDetails;
};

export declare interface AppRewardConfigurationInterface {
  Archive: damlTypes.Choice<AppRewardConfiguration, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AppRewardConfiguration, undefined>>;
  AppRewardConfiguration_Modify: damlTypes.Choice<AppRewardConfiguration, AppRewardConfiguration_Modify, damlTypes.ContractId<AppRewardConfiguration>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AppRewardConfiguration, undefined>>;
}
export declare const AppRewardConfiguration:
  damlTypes.Template<AppRewardConfiguration, undefined, '#utility-registry-v0:Utility.Registry.V0.Configuration.AppReward:AppRewardConfiguration'> &
  damlTypes.ToInterface<AppRewardConfiguration, never> &
  AppRewardConfigurationInterface;

export declare namespace AppRewardConfiguration {
}


