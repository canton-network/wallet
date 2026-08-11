// Generated from ../../../../Splice/Api/Token/TransferEventsV2/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032 from '@daml.js/splice-api-token-holding-v2-1.0.0';
import * as pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f from '@daml.js/splice-api-token-metadata-v1-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type EventLog = damlTypes.Interface<'#splice-api-token-transfer-events-v2:Splice.Api.Token.TransferEventsV2:EventLog'> & EventLogView
export declare interface EventLogInterface {
  Archive:
    damlTypes.Choice<EventLog, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<EventLog, undefined>>;
  EventLog_HoldingsChange:
    damlTypes.Choice<EventLog, EventLog_HoldingsChange, EventLog_HoldingsChangeResult, undefined> &
    damlTypes.ChoiceFrom<damlTypes.InterfaceCompanion<EventLog, undefined>>;
}
export declare const EventLog:
  damlTypes.InterfaceCompanion<EventLog, undefined, '#splice-api-token-transfer-events-v2:Splice.Api.Token.TransferEventsV2:EventLog'> &
  damlTypes.FromTemplate<EventLog, unknown> &
  EventLogInterface

export declare type EventLogView = {
  admin: damlTypes.Party,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const EventLogView:
  damlTypes.Serializable<EventLogView>

export declare type EventLog_HoldingsChange = {
  admin: damlTypes.Party,
  account: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account,
  inputHoldingCids: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[],
  transferLegSides: TransferLegSide[],
  outputHoldingCids: damlTypes.ContractId<pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Holding>[],
  observers: damlTypes.Party[],
  extraArgs: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.ExtraArgs,
}

export declare const EventLog_HoldingsChange:
  damlTypes.Serializable<EventLog_HoldingsChange>

export declare type EventLog_HoldingsChangeResult = {
}

export declare const EventLog_HoldingsChangeResult:
  damlTypes.Serializable<EventLog_HoldingsChangeResult>

export declare type TransferLegSide = {
  transferLegId: string,
  side: TransferSide,
  otherside: pkg4b7ecfc366d79ccc5ed07c80f26fe489cf2dfd43ce2856c06a78e6a048db7032.Splice.Api.Token.HoldingV2.Account,
  amount: damlTypes.Numeric,
  instrumentId: string,
  meta: pkg4ded6b668cb3b64f7a88a30874cd41c75829f5e064b3fbbadf41ec7e8363354f.Splice.Api.Token.MetadataV1.Metadata,
}

export declare const TransferLegSide:
  damlTypes.Serializable<TransferLegSide>

export declare type TransferSide =
  | 'SenderSide'
  | 'ReceiverSide'


export declare const TransferSide:
  damlTypes.Serializable<TransferSide> & { readonly keys: TransferSide[] } & { readonly [e in TransferSide]: e }
