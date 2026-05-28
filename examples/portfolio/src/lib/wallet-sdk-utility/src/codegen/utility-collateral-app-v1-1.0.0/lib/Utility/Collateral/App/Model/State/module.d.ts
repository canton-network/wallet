// Generated from Utility/Collateral/App/Model/State.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Utility_Collateral_App_Types from '../../../../../Utility/Collateral/App/Types/module';

export declare type CollateralState = {
  partyA: damlTypes.Party;
  partyB: damlTypes.Party;
  operator: damlTypes.Party;
  id: string;
  collateralPositions: Utility_Collateral_App_Types.CollateralPosition[];
};

export declare interface CollateralStateInterface {
  Archive: damlTypes.Choice<CollateralState, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<CollateralState, undefined>>;
}
export declare const CollateralState:
  damlTypes.Template<CollateralState, undefined, '#utility-collateral-app-v1:Utility.Collateral.App.Model.State:CollateralState'> &
  damlTypes.ToInterface<CollateralState, never> &
  CollateralStateInterface;

export declare namespace CollateralState {
}


