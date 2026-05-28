// Generated from Splice/AmuletTransferInstruction.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 from '@daml.js/splice-api-token-transfer-instruction-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Splice_Amulet from '../../Splice/Amulet/module';

export declare type AmuletTransferInstruction = {
  lockedAmulet: damlTypes.ContractId<Splice_Amulet.LockedAmulet>;
  transfer: pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.Transfer;
};

export declare interface AmuletTransferInstructionInterface {
  Archive: damlTypes.Choice<AmuletTransferInstruction, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AmuletTransferInstruction, undefined>>;
}
export declare const AmuletTransferInstruction:
  damlTypes.Template<AmuletTransferInstruction, undefined, '#splice-amulet:Splice.AmuletTransferInstruction:AmuletTransferInstruction'> &
  damlTypes.ToInterface<AmuletTransferInstruction, pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferInstruction> &
  AmuletTransferInstructionInterface;

export declare namespace AmuletTransferInstruction {
}


