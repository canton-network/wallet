// Generated from ../../../../Splice/Testing/Tokens/TestTokenV2/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439 from '@daml.js/splice-api-token-allocation-v2-1.0.0';
import * as pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520 from '@daml.js/splice-api-token-allocation-instruction-v1-1.0.0';
import * as pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099 from '@daml.js/splice-api-token-transfer-instruction-v2-1.0.0';
import * as pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 from '@daml.js/splice-api-token-holding-v2-1.0.0';
import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281 from '@daml.js/splice-api-token-transfer-instruction-v1-1.0.0';
import * as pkg5c1097a9bad0af4bcfe6d3fb0fe55112d3d11f18eae57ddfb14c20836fee226c from '@daml.js/splice-api-token-transfer-events-v2-1.0.0';
import * as pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c from '@daml.js/splice-api-token-allocation-instruction-v2-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

import * as Splice_Testing_Tokens_TestTokenV2_AccountConfig from '../../../../Splice/Testing/Tokens/TestTokenV2/AccountConfig/module';
import * as Splice_Testing_Tokens_TestTokenV2_Transfer from '../../../../Splice/Testing/Tokens/TestTokenV2/Transfer/module';

export declare type TokenRules = {
  admin: damlTypes.Party,
}

export declare interface TokenRulesInterface {
  Archive: 
    damlTypes.Choice<TokenRules, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenRules, undefined>>;
  TokenRules_OfferMint: 
    damlTypes.Choice<TokenRules, TokenRules_OfferMint, TokenRules_OfferMintResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenRules, undefined>>;
}
export declare const TokenRules:
  damlTypes.Template<TokenRules, undefined, '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2:TokenRules'> &
  damlTypes.ToInterface<TokenRules, pkg29317e3b7b165d2bbf16721bcca0ec4869e53eddb2738bddf790d61af28e0099.Splice.Api.Token.TransferInstructionV2.TransferFactory | pkg55ba4deb0ad4662c4168b39859738a0e91388d252286480c7331b3f71a517281.Splice.Api.Token.TransferInstructionV1.TransferFactory | pkg051a3b0563a6fa4df4cb34448081e48b061e555aa1a265abf6ae8f3f4cafe439.Splice.Api.Token.AllocationV2.SettlementFactory | pkg275064aacfe99cea72ee0c80563936129563776f67415ef9f13e4297eecbc520.Splice.Api.Token.AllocationInstructionV1.AllocationFactory | pkg9818a0b5b827109de03a04c8f6151cde9d1e7fe5123dbb2dfeb0e52d7271287c.Splice.Api.Token.AllocationInstructionV2.AllocationFactory | pkg5c1097a9bad0af4bcfe6d3fb0fe55112d3d11f18eae57ddfb14c20836fee226c.Splice.Api.Token.TransferEventsV2.EventLog> &
  TokenRulesInterface

export declare type TokenRules_OfferMint = {
  receiver: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account,
  amount: damlTypes.Numeric,
  instrumentId: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.InstrumentId,
  offeredAt: damlTypes.Time,
  receiverConfig: Splice_Testing_Tokens_TestTokenV2_AccountConfig.AccountConfig,
}

export declare const TokenRules_OfferMint:
  damlTypes.Serializable<TokenRules_OfferMint>

export declare type TokenRules_OfferMintResult = {
  offerCid: damlTypes.ContractId<Splice_Testing_Tokens_TestTokenV2_Transfer.TokenTransferOffer>,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const TokenRules_OfferMintResult:
  damlTypes.Serializable<TokenRules_OfferMintResult>
