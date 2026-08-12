// Generated from ../../../../../Splice/Testing/Tokens/TestTokenV2/Transfer/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099 from '@daml.js/splice-api-token-transfer-instruction-v2-1.0.0';
import * as pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 from '@daml.js/splice-api-token-transfer-instruction-v1-1.0.0';
import * as pkg5c1097a9bad0af4bcfe6d3fb0fe55112d3d11f18eae57ddfb14c20836fee226c from '@daml.js/splice-api-token-transfer-events-v2-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type TokenTransferOffer = {
  actionAuthorizers: damlTypes.Map<pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionAction, damlTypes.Party[]>,
  availableActions: damlTypes.Map<pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstructionAction, damlTypes.Party[][]>,
  transfer: pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.Transfer,
  originalInstructionCid: damlTypes.Optional<damlTypes.ContractId<pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstruction>>,
  mintAmount: damlTypes.Numeric,
}

export declare interface TokenTransferOfferInterface {
  Archive: 
    damlTypes.Choice<TokenTransferOffer, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenTransferOffer, undefined>>;
}
export declare const TokenTransferOffer:
  damlTypes.Template<TokenTransferOffer, undefined, '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Transfer:TokenTransferOffer'> &
  damlTypes.ToInterface<TokenTransferOffer, pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferInstruction | pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferInstruction | pkg5c1097a9bad0af4bcfe6d3fb0fe55112d3d11f18eae57ddfb14c20836fee226c.Splice.Api.Token.TransferEventsV2.EventLog> &
  TokenTransferOfferInterface
