import type { Context, UnknownParams } from 'openapi-backend'

declare namespace Components {
    namespace Responses {
        export type $400 = Schemas.ErrorResponse
        export type $404 = Schemas.ErrorResponse
        export type $409 = Schemas.ErrorResponse
        export type $500 = Schemas.ErrorResponse
    }
    namespace Schemas {
        /**
         * Which single account input field wallets should show in forms.
         *
         */
        export type AccountInputFieldToShow = 'provider' | 'accountId'
        /**
         * Which account input field(s) wallets should show in forms.
         *
         */
        export type AccountInputFieldsToShow =
            /**
             * Which single account input field wallets should show in forms.
             *
             */
            AccountInputFieldToShow[]
        export interface ErrorResponse {
            error: string
        }
        export interface GetRegistryInfoResponse {
            /**
             * The Daml party representing the registry app
             */
            adminId: string
            /**
             * The token standard APIs supported by the registry. Note that this only includes the registry-wide APIs. Use the instrument lookup endpoints to see which APIs are supported for a given instrument
             */
            supportedApis /**
             * Map from token standard API name to the minor version of the API supported, e.g.,
             * splice-api-token-metadata-v1 -> 1 where the `1` corresponds to the minor version.
             *
             */: SupportedApis
        }
        export interface Instrument {
            /**
             * The unique identifier assigned by the admin to the instrument.
             */
            id: string
            /**
             * The display name for the instrument recommended by the instrument admin. This is not necessarily unique.
             */
            name: string
            /**
             * The symbol for the instrument recommended by the instrument admin. This is not necessarily unique.
             */
            symbol: string
            /**
             * Decimal encoded current total supply of the instrument.
             */
            totalSupply?: string
            /**
             * The timestamp when the total supply was last computed.
             */
            totalSupplyAsOf?: string // date-time
            /**
             * The number of decimal places used by the instrument.
             *
             * Must be a number between 0 and 10, as the Daml interfaces represent holding amounts as
             * `Decimal` values, which use 10 decimal places and are precise for 38 digits.
             * Setting this to 0 means that the instrument can only be held in whole units.
             *
             * This number SHOULD be used for display purposes in a wallet to decide how many
             * decimal places to show and accept when displaying or entering amounts.
             *
             */
            decimals: number // int8
            /**
             * Indicates whether the instrument is currently paused. A paused instrument cannot be
             * transferred or allocated.
             *
             */
            paused?: boolean
            pauseInfo /**
             * Additional information about the instrument pause state.
             *
             */?: PauseInfo
            supportedApis /**
             * Map from token standard API name to the minor version of the API supported, e.g.,
             * splice-api-token-metadata-v1 -> 1 where the `1` corresponds to the minor version.
             *
             */: SupportedApis
            /**
             * Informs wallets whether the instrument supports non-basic accounts
             * and the wallet should thus show input fields for both the account
             * provider and the account id in input forms for transfers and allocations.
             *
             * Note that wallets should always show non-null account providers and
             * account ids when displaying transfers and allocations.
             *
             * This property is deprecated in favor of the more fine-grained
             * `accountInputFieldsToShow` property.
             *
             */
            showAccountInputFields?: boolean
            /**
             * Fine-grained control for account input field display in wallets.
             *
             * If set, then wallets should only display the specified input
             * field(s) in transfer and allocation input forms
             * *independently* of the `showAccountInputFields` property.
             *
             * Note that wallets should always show non-null account providers and
             * account ids when displaying transfers and allocations.
             *
             */
            accountInputFieldsToShow /**
             * Which account input field(s) wallets should show in forms.
             *
             */?: AccountInputFieldsToShow
        }
        export interface ListInstrumentsResponse {
            instruments: Instrument[]
            /**
             * The token for the next page of results, to be used as the lastInstrumentId for the next page.
             */
            nextPageToken?: string
        }
        /**
         * Additional information about the instrument pause state.
         *
         */
        export interface PauseInfo {
            /**
             * Why the instrument is paused.
             *
             */
            reason?: string
            /**
             * Timestamp (exclusive) until which the instrument is paused, if known.
             *
             */
            until?: string // date-time
        }
        /**
         * Map from token standard API name to the minor version of the API supported, e.g.,
         * splice-api-token-metadata-v1 -> 1 where the `1` corresponds to the minor version.
         *
         */
        export interface SupportedApis {
            [name: string]: number // int32
        }
    }
}
declare namespace Paths {
    namespace GetInstrument {
        namespace Parameters {
            export type InstrumentId = string
        }
        export interface PathParameters {
            instrumentId: Parameters.InstrumentId
        }
        namespace Responses {
            export type $200 = Components.Schemas.Instrument
            export type $404 = Components.Responses.$404
            export type $500 = Components.Responses.$500
        }
    }
    namespace GetRegistryInfo {
        namespace Responses {
            export type $200 = Components.Schemas.GetRegistryInfoResponse
            export type $404 = Components.Responses.$404
            export type $500 = Components.Responses.$500
        }
    }
    namespace ListInstruments {
        namespace Parameters {
            export type PageSize = number // int32
            export type PageToken = string
        }
        export interface QueryParameters {
            pageSize?: Parameters.PageSize /* int32 */
            pageToken?: Parameters.PageToken
        }
        namespace Responses {
            export type $200 = Components.Schemas.ListInstrumentsResponse
            export type $404 = Components.Responses.$404
            export type $500 = Components.Responses.$500
        }
    }
}

export interface Operations {
    /**
     * GET /registry/metadata/v1/info
     */
    ['getRegistryInfo']: {
        requestBody: any
        params: UnknownParams
        query: UnknownParams
        headers: UnknownParams
        cookies: UnknownParams
        context: Context<
            any,
            UnknownParams,
            UnknownParams,
            UnknownParams,
            UnknownParams
        >
        response:
            | Paths.GetRegistryInfo.Responses.$200
            | Paths.GetRegistryInfo.Responses.$404
            | Paths.GetRegistryInfo.Responses.$500
    }
    /**
     * GET /registry/metadata/v1/instruments
     */
    ['listInstruments']: {
        requestBody: any
        params: UnknownParams
        query: Paths.ListInstruments.QueryParameters
        headers: UnknownParams
        cookies: UnknownParams
        context: Context<
            any,
            UnknownParams,
            Paths.ListInstruments.QueryParameters,
            UnknownParams,
            UnknownParams
        >
        response:
            | Paths.ListInstruments.Responses.$200
            | Paths.ListInstruments.Responses.$404
            | Paths.ListInstruments.Responses.$500
    }
    /**
     * GET /registry/metadata/v1/instruments/{instrumentId}
     */
    ['getInstrument']: {
        requestBody: any
        params: Paths.GetInstrument.PathParameters
        query: UnknownParams
        headers: UnknownParams
        cookies: UnknownParams
        context: Context<
            any,
            Paths.GetInstrument.PathParameters,
            UnknownParams,
            UnknownParams,
            UnknownParams
        >
        response:
            | Paths.GetInstrument.Responses.$200
            | Paths.GetInstrument.Responses.$404
            | Paths.GetInstrument.Responses.$500
    }
}

export type OperationContext<operationId extends keyof Operations> =
    Operations[operationId]['context']
export type OperationResponse<operationId extends keyof Operations> =
    Operations[operationId]['response']
export type HandlerResponse<
    ResponseBody,
    ResponseModel = Record<string, any>,
> = ResponseModel & { _t?: ResponseBody }
export type OperationHandlerResponse<operationId extends keyof Operations> =
    HandlerResponse<OperationResponse<operationId>>
export type OperationHandler<
    operationId extends keyof Operations,
    HandlerArgs extends unknown[] = unknown[],
> = (
    ...params: [OperationContext<operationId>, ...HandlerArgs]
) => Promise<OperationHandlerResponse<operationId>>

export type AccountInputFieldToShow = Components.Schemas.AccountInputFieldToShow
export type AccountInputFieldsToShow =
    Components.Schemas.AccountInputFieldsToShow
export type ErrorResponse = Components.Schemas.ErrorResponse
export type GetRegistryInfoResponse = Components.Schemas.GetRegistryInfoResponse
export type Instrument = Components.Schemas.Instrument
export type ListInstrumentsResponse = Components.Schemas.ListInstrumentsResponse
export type PauseInfo = Components.Schemas.PauseInfo
export type SupportedApis = Components.Schemas.SupportedApis
