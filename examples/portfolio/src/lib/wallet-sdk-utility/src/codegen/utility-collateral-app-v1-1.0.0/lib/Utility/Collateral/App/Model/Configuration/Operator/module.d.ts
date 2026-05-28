// Generated from Utility/Collateral/App/Model/Configuration/Operator.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg77df4e7b980c12de438d7b052141a762215fae790d81f71179c8fb534beb68f7 from '@daml.js/utility-credential-v0-0.0.3';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type OperatorConfiguration_Get_Result = {
  operatorConfiguration: OperatorConfiguration;
};

export declare const OperatorConfiguration_Get_Result:
  damlTypes.Serializable<OperatorConfiguration_Get_Result> & {
  }
;


export declare type OperatorConfiguration_Get = {
  actor: damlTypes.Party;
};

export declare const OperatorConfiguration_Get:
  damlTypes.Serializable<OperatorConfiguration_Get> & {
  }
;


export declare type OperatorConfiguration = {
  operator: damlTypes.Party;
  userRequirements: pkg77df4e7b980c12de438d7b052141a762215fae790d81f71179c8fb534beb68f7.Utility.Credential.V0.Credential.PartyCredentialRequirement[];
};

export declare interface OperatorConfigurationInterface {
  Archive: damlTypes.Choice<OperatorConfiguration, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<OperatorConfiguration, undefined>>;
  OperatorConfiguration_Get: damlTypes.Choice<OperatorConfiguration, OperatorConfiguration_Get, OperatorConfiguration_Get_Result, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<OperatorConfiguration, undefined>>;
}
export declare const OperatorConfiguration:
  damlTypes.Template<OperatorConfiguration, undefined, '#utility-collateral-app-v1:Utility.Collateral.App.Model.Configuration.Operator:OperatorConfiguration'> &
  damlTypes.ToInterface<OperatorConfiguration, never> &
  OperatorConfigurationInterface;

export declare namespace OperatorConfiguration {
}


