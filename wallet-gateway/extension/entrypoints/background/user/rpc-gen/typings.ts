// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 *
 * The network ID the wallet corresponds to.
 *
 */
export type NetworkId = string
export type Name = string
/**
 *
 * Description of network
 *
 */
export type Description = string
/**
 *
 * Synchronizer ID
 *
 */
export type SynchronizerId = string
/**
 *
 * Identity Provider ID
 *
 */
export type IdentityProviderId = string
export type Method = string
export type Scope = string
export type ClientId = string
export type ClientSecret = string
/**
 *
 * Issuer of identity provider
 *
 */
export type Issuer = string
export type Audience = string
/**
 *
 * Represents the type of auth for a specified network
 *
 */
export interface Auth {
    method: Method
    scope: Scope
    clientId: ClientId
    clientSecret?: ClientSecret
    issuer?: Issuer
    audience: Audience
}
/**
 *
 * Ledger api url
 *
 */
export type LedgerApi = string
/**
 *
 * Connected network metadata. Privileged credentials (adminAuth, serviceAccountAuth) are included only for the admin user.
 *
 */
export interface Network {
    id: NetworkId
    name: Name
    description: Description
    synchronizerId?: SynchronizerId
    identityProviderId: IdentityProviderId
    auth: Auth
    adminAuth?: Auth
    serviceAccountAuth?: Auth
    ledgerApi: LedgerApi
}
/**
 *
 * Ledger api url
 *
 */
export type NetworkName = string
export type Id = string
/**
 *
 * Type of identity provider (oauth / self_signed)
 *
 */
export type Type = any
/**
 *
 * The configuration URL for the identity provider.
 *
 */
export type ConfigUrl = string
/**
 *
 * Structure representing the Identity Providers
 *
 */
export interface Idp {
    id: Id
    type: Type
    issuer: Issuer
    configUrl?: ConfigUrl
}
/**
 *
 * Set as primary wallet for dApp usage.
 *
 */
export type Primary = boolean
/**
 *
 * The party hint and name of the wallet.
 *
 */
export type PartyHint = string
/**
 *
 * The signing provider ID the wallet corresponds to.
 *
 */
export type SigningProviderId = string
/**
 *
 * Name of signing provider's key to use for getting keys.
 *
 */
export type KeyName = string
/**
 *
 * The party ID corresponding to the wallet.
 *
 */
export type PartyId = string
/**
 *
 * Filter wallets by network IDs.
 *
 */
export type NetworkIds = NetworkId[]
/**
 *
 * Filter wallets by signing provider IDs.
 *
 */
export type SigningProviderIds = SigningProviderId[]
/**
 *
 * Filter for the wallets to be returned.
 *
 */
export interface WalletFilter {
    networkIds?: NetworkIds
    signingProviderIds?: SigningProviderIds
}
/**
 *
 * The internal transaction identifier.
 *
 */
export type TransactionId = string
/**
 *
 * The internal identifier of the pending message-signing request.
 *
 */
export type MessageId = string
/**
 *
 * The signature of the message.
 *
 */
export type Signature = string
export type SignedBy = string
/**
 *
 * The origin (dApp URL) that initiated this transaction request.
 *
 */
export type Origin = string
/**
 *
 * Limit of transactions to return.
 *
 */
export type Limit = number
/**
 *
 * Cursor for next page of results.
 *
 */
export type CursorAsString = string
/**
 *
 * Cursor for next page of results.
 *
 */
export type Cursor = CursorAsString
/**
 *
 * The public key of the party.
 *
 */
export type PublicKey = string
/**
 *
 * Authentication method configured for this network
 *
 */
export type AuthMethod = string
/**
 *
 * Network metadata exposed by listNetworks without sensitive auth configuration
 *
 */
export interface PublicNetwork {
    id: NetworkId
    name: Name
    description: Description
    synchronizerId?: SynchronizerId
    identityProviderId: IdentityProviderId
    ledgerApi: LedgerApi
    authMethod: AuthMethod
    clientId?: ClientId
    scope?: Scope
    audience?: Audience
}
export type Networks = PublicNetwork[]
/**
 *
 * The access token for the session.
 *
 */
export type AccessToken = string
export type Idps = Idp[]
/**
 *
 * The status of the wallet.
 *
 */
export type WalletStatus = 'initialized' | 'allocated' | 'removed'
/**
 *
 * The party hint and name of the wallet.
 *
 */
export type Hint = string
/**
 *
 * The namespace of the party.
 *
 */
export type Namespace = string
/**
 *
 * Unique identifier of the signed transaction given by the Signing Provider. This may not be the same as the internal txId given by the Wallet Gateway.
 *
 */
export type ExternalTxId = string
/**
 *
 * The topology transactions
 *
 */
export type TopologyTransactions = string
/**
 *
 * Whether the wallet is disabled. Wallets are disabled when no signing provider matches the party's namespace during sync. Disabled wallets use participant as the default signing provider.
 *
 */
export type Disabled = boolean
/**
 *
 * Reason for the wallet state, e.g., 'no signing provider matched'.
 *
 */
export type Reason = string
export type PartyLevelRight = any
/**
 *
 * The rights of the wallet.
 *
 */
export type Rights = PartyLevelRight[]
/**
 *
 * Structure representing a wallet
 *
 */
export interface Wallet {
    primary: Primary
    partyId: PartyId
    status: WalletStatus
    hint: Hint
    publicKey: PublicKey
    namespace: Namespace
    networkId: NetworkId
    signingProviderId: SigningProviderId
    externalTxId?: ExternalTxId
    topologyTransactions?: TopologyTransactions
    disabled?: Disabled
    reason?: Reason
    rights: Rights
}
type AlwaysTrue = any
/**
 *
 * Non-disabled wallets added in this syncWallets call.
 *
 */
export type SyncWalletsResultAdded = Wallet[]
/**
 *
 * Existing wallets that either got downgraded to status initialized or their rights changed in this syncWallets call.
 *
 */
export type SyncWalletsResultUpdated = Wallet[]
/**
 *
 * Either wallets added in this iteration that are disabled, or existing wallet that were updated to be disabled in this syncWallets call.
 *
 */
export type SyncWalletsResultDisabled = Wallet[]
/**
 *
 * Whether wallet sync is needed. Returns true if there are disabled wallets or parties on the ledger that aren't in the store.
 *
 */
export type WalletSyncNeeded = boolean
export type TxStatusSigned = 'signed'
export interface SignResultSigned {
    status: TxStatusSigned
    signature: Signature
    signedBy: SignedBy
    partyId: PartyId
    externalTxId?: ExternalTxId
}
export type TxStatusPending = 'pending'
export interface SignResultPending {
    status: TxStatusPending
    partyId: PartyId
    externalTxId: ExternalTxId
}
export type TxStatusRejected = 'rejected'
export interface SignResultRejected {
    status: TxStatusRejected
    partyId: PartyId
    externalTxId: ExternalTxId
}
export type TxStatusFailed = 'failed'
export interface SignResultFailed {
    status: TxStatusFailed
    partyId: PartyId
    externalTxId: ExternalTxId
}
/**
 *
 * The status of the transaction.
 *
 */
export type Status = string
/**
 *
 * The message to sign.
 *
 */
export type Message = string
/**
 *
 * The timestamp when the API key was created.
 *
 */
export type CreatedAt = string
/**
 *
 * The timestamp when the transaction was signed.
 *
 */
export type SignedAt = string
export interface MessageRaw {
    id: MessageId
    status: Status
    partyId: PartyId
    publicKey: PublicKey
    message: Message
    origin?: Origin
    createdAt: CreatedAt
    signedAt?: SignedAt
    signature?: Signature
}
export type Messages = MessageRaw[]
export type UserLevelRight = any
/**
 *
 * Structure representing the connected network session
 *
 */
export interface Session {
    id: Id
    origin?: Origin
    network: Network
    idp: Idp
    accessToken: AccessToken
    status: Status
    reason?: Reason
    rights: Rights
}
export type Sessions = Session[]
/**
 *
 * The unique identifier of the command associated with the transaction.
 *
 */
export type CommandId = string
/**
 *
 * The transaction data corresponding to the command ID.
 *
 */
export type PreparedTransaction = string
/**
 *
 * The hash of the prepared transaction.
 *
 */
export type PreparedTransactionHash = string
/**
 *
 * Optional payload associated with the transaction.
 *
 */
export type Payload = string
/**
 *
 * Reason for why the transaction failed.
 *
 */
export type FailureReason = string
export interface Transaction {
    id: TransactionId
    commandId: CommandId
    status: Status
    createdAt?: CreatedAt
    signedAt?: SignedAt
    preparedTransaction: PreparedTransaction
    preparedTransactionHash: PreparedTransactionHash
    payload?: Payload
    origin?: Origin
    externalTxId?: ExternalTxId
    failureReason?: FailureReason
}
export type Transactions = Transaction[]
/**
 *
 * Cursor for next page of results.
 *
 */
export type NextCursor = string
/**
 *
 * Number of total transactions for the user.
 *
 */
export type Count = number
/**
 *
 * The unique identifier of the current user.
 *
 */
export type UserIdentifier = string
/**
 *
 * Whether the current user is an admin.
 *
 */
export type IsAdminFlag = boolean
/**
 *
 * The generated API key.
 *
 */
export type ApiKeyResult = string
export interface ApiKey {
    id: Id
    name: Name
    createdAt: CreatedAt
}
/**
 *
 * The list of API keys.
 *
 */
export type ApiKeys = ApiKey[]
export interface Key {
    id: Id
    name: Name
    publicKey: PublicKey
}
/**
 *
 * The list of signing provider's available keys.
 *
 */
export type Keys = Key[]
/**
 *
 * Represents a null value, used in responses where no data is returned.
 *
 */
export type Null = null
export interface AddNetworkParams {
    network: Network
}
export interface RemoveNetworkParams {
    networkName: NetworkName
}
export interface GetNetworkParams {
    networkId: NetworkId
}
export interface SelfSignedAccessTokenParams {
    networkId: NetworkId
    clientId: ClientId
    clientSecret: ClientSecret
}
export interface AddIdpParams {
    idp: Idp
}
export interface RemoveIdpParams {
    identityProviderId: IdentityProviderId
}
export interface CreateWalletParams {
    primary?: Primary
    partyHint: PartyHint
    signingProviderId: SigningProviderId
    keyName?: KeyName
}
export interface AllocatePartyForWalletParams {
    partyId: PartyId
}
export interface SetPrimaryWalletParams {
    partyId: PartyId
}
export interface RemoveWalletParams {
    partyId: PartyId
}
export interface ListWalletsParams {
    filter?: WalletFilter
}
export interface SignParams {
    transactionId: TransactionId
    partyId: PartyId
}
export interface SignMessageParams {
    messageId: MessageId
    partyId?: PartyId
}
export interface GetMessageToSignParams {
    messageId: MessageId
}
export interface DeleteMessageToSignParams {
    messageId: MessageId
}
export interface ExecuteParams {
    signature: Signature
    partyId: PartyId
    transactionId: TransactionId
    signedBy: SignedBy
}
export interface AddSessionParams {
    origin: Origin
    networkId: NetworkId
}
export interface GetTransactionParams {
    transactionId: TransactionId
}
export interface GetTransactionStatusParams {
    transactionId: TransactionId
}
export interface ListTransactionsParams {
    limit?: Limit
    cursor?: Cursor
}
export interface DeleteTransactionParams {
    transactionId: TransactionId
}
export interface GenerateApiKeyParams {
    name: Name
}
export interface RemoveApiKeyParams {
    id: Id
}
export interface ListSigningProviderKeysParams {
    signingProviderId: SigningProviderId
}
export interface GetWalletParams {
    partyId: PartyId
}
export interface ChangeSigningProviderParams {
    signingProviderId: SigningProviderId
    partyId: PartyId
    publicKey: PublicKey
}
export interface ListNetworksResult {
    networks: Networks
}
export interface GetNetworkResult {
    network: Network
}
export interface SelfSignedAccessTokenResult {
    accessToken: AccessToken
}
export interface ListIdpsResult {
    idps: Idps
}
export interface CreateWalletResult {
    wallet: Wallet
}
export interface AllocatePartyForWalletResult {
    wallet: Wallet
}
export interface RemovePartyResult {
    [key: string]: any
}
/**
 *
 * An array of wallets that match the filter criteria.
 *
 */
export type ListWalletsResult = Wallet[]
/**
 *
 * Added, updated  and disabled wallets as a result of the sync.
 *
 */
export interface SyncWalletsResult {
    added: SyncWalletsResultAdded
    updated: SyncWalletsResultUpdated
    disabled: SyncWalletsResultDisabled
}
export interface IsWalletSyncNeededResult {
    walletSyncNeeded: WalletSyncNeeded
}
export type SignResult =
    SignResultSigned | SignResultPending | SignResultRejected | SignResultFailed
export interface SignMessageResult {
    signature: Signature
    publicKey: PublicKey
}
export interface GetMessageToSignResult {
    message: MessageRaw
}
export interface ListMessagesToSignResult {
    messages: Messages
}
export interface ExecuteResult {
    [key: string]: any
}
/**
 *
 * Structure representing the connected network session
 *
 */
export interface AddSessionResult {
    id: Id
    origin?: Origin
    network: Network
    idp: Idp
    accessToken: AccessToken
    status: Status
    reason?: Reason
    rights: Rights
}
export interface ListSessionsResult {
    sessions: Sessions
}
export interface GetTransactionResult {
    id: TransactionId
    commandId: CommandId
    status: Status
    createdAt?: CreatedAt
    signedAt?: SignedAt
    preparedTransaction: PreparedTransaction
    preparedTransactionHash: PreparedTransactionHash
    payload?: Payload
    origin?: Origin
    externalTxId?: ExternalTxId
    failureReason?: FailureReason
}
export interface GetTransactionStatusResult {
    status: Status
    externalTxId?: ExternalTxId
    failureReason?: FailureReason
}
export interface ListTransactionsResult {
    transactions: Transactions
    nextCursor?: NextCursor
    count: Count
}
export interface GetUserResult {
    userId: UserIdentifier
    isAdmin: IsAdminFlag
}
export interface GeneratedApiKey {
    id: Id
    apiKey: ApiKeyResult
}
export interface ListApiKeysResult {
    apiKeys: ApiKeys
}
export interface ListSigningProviderKeysResult {
    keys: Keys
}
export type GetWalletResult = Wallet | Null
/**
 *
 * Generated! Represents an alias to any of the provided schemas
 *
 */

export type AddNetwork = (params: AddNetworkParams) => Promise<Null>
export type RemoveNetwork = (params: RemoveNetworkParams) => Promise<Null>
export type ListNetworks = () => Promise<ListNetworksResult>
export type GetNetwork = (params: GetNetworkParams) => Promise<GetNetworkResult>
export type SelfSignedAccessToken = (
    params: SelfSignedAccessTokenParams
) => Promise<SelfSignedAccessTokenResult>
export type AddIdp = (params: AddIdpParams) => Promise<Null>
export type RemoveIdp = (params: RemoveIdpParams) => Promise<Null>
export type ListIdps = () => Promise<ListIdpsResult>
export type CreateWallet = (
    params: CreateWalletParams
) => Promise<CreateWalletResult>
export type AllocatePartyForWallet = (
    params: AllocatePartyForWalletParams
) => Promise<AllocatePartyForWalletResult>
export type SetPrimaryWallet = (params: SetPrimaryWalletParams) => Promise<Null>
export type RemoveWallet = (
    params: RemoveWalletParams
) => Promise<RemovePartyResult>
export type ListWallets = (
    params: ListWalletsParams
) => Promise<ListWalletsResult>
export type SyncWallets = () => Promise<SyncWalletsResult>
export type IsWalletSyncNeeded = () => Promise<IsWalletSyncNeededResult>
export type Sign = (params: SignParams) => Promise<SignResult>
export type SignMessage = (
    params: SignMessageParams
) => Promise<SignMessageResult>
export type GetMessageToSign = (
    params: GetMessageToSignParams
) => Promise<GetMessageToSignResult>
export type ListMessagesToSign = () => Promise<ListMessagesToSignResult>
export type DeleteMessageToSign = (
    params: DeleteMessageToSignParams
) => Promise<Null>
export type Execute = (params: ExecuteParams) => Promise<ExecuteResult>
export type AddSession = (params: AddSessionParams) => Promise<AddSessionResult>
export type RemoveSession = () => Promise<Null>
export type ListSessions = () => Promise<ListSessionsResult>
export type GetTransaction = (
    params: GetTransactionParams
) => Promise<GetTransactionResult>
export type GetTransactionStatus = (
    params: GetTransactionStatusParams
) => Promise<GetTransactionStatusResult>
export type ListTransactions = (
    params: ListTransactionsParams
) => Promise<ListTransactionsResult>
export type DeleteTransaction = (
    params: DeleteTransactionParams
) => Promise<Null>
export type GetUser = () => Promise<GetUserResult>
export type GenerateApiKey = (
    params: GenerateApiKeyParams
) => Promise<GeneratedApiKey>
export type ListApiKeys = () => Promise<ListApiKeysResult>
export type RemoveApiKey = (params: RemoveApiKeyParams) => Promise<Null>
export type ListSigningProviderKeys = (
    params: ListSigningProviderKeysParams
) => Promise<ListSigningProviderKeysResult>
export type GetWallet = (params: GetWalletParams) => Promise<GetWalletResult>
export type ChangeSigningProvider = (
    params: ChangeSigningProviderParams
) => Promise<Null>
