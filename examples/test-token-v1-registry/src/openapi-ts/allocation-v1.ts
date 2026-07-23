import type { Context, UnknownParams } from 'openapi-backend'

declare namespace Components {
    namespace Responses {
        export type $400 = Schemas.ErrorResponse
        export type $404 = Schemas.ErrorResponse
    }
    namespace Schemas {
        /**
         * The context required to exercise a choice on a contract via an interface.
         * Used to retrieve additional reference date that is passed in via disclosed contracts,
         * which are in turn referred to via their contract ID in the `choiceContextData`.
         *
         */
        export interface ChoiceContext {
            /**
             * The additional data to use when exercising the choice.
             */
            choiceContextData: {
                [key: string]: any
            }
            /**
             * The contracts that are required to be disclosed to the participant node for exercising
             * the choice.
             *
             */
            disclosedContracts: DisclosedContract[]
        }
        export interface DisclosedContract {
            templateId: string
            contractId: string
            createdEventBlob: string
            /**
             * The synchronizer to which the contract is currently assigned.
             * If the contract is in the process of being reassigned, then a "409" response is returned.
             *
             */
            synchronizerId: string
            /**
             * The name of the Daml package that was used to create the contract.
             * Use this data only if you trust the provider, as it might not match the data in the
             * `createdEventBlob`.
             *
             */
            debugPackageName?: string
            /**
             * The contract arguments that were used to create the contract.
             * Use this data only if you trust the provider, as it might not match the data in the
             * `createdEventBlob`.
             *
             */
            debugPayload?: {
                [key: string]: any
            }
            /**
             * The ledger effective time at which the contract was created.
             * Use this data only if you trust the provider, as it might not match the data in the
             * `createdEventBlob`.
             *
             */
            debugCreatedAt?: string // date-time
        }
        export interface ErrorResponse {
            error: string
        }
        /**
         * A request to get the context for executing a choice on a contract.
         *
         */
        export interface GetChoiceContextRequest {
            /**
             * Metadata that will be passed to the choice, and should be incorporated
             * into the choice context. Provided for extensibility.
             *
             */
            meta?: {
                [name: string]: string
            }
            /**
             * If set to true, the response will not include fields prefixed with 'debug'. Useful to save bandwidth.
             */
            excludeDebugFields?: boolean
        }
    }
}
declare namespace Paths {
    namespace GetAllocationCancelContext {
        namespace Parameters {
            export type AllocationId = string
        }
        export interface PathParameters {
            allocationId: Parameters.AllocationId
        }
        export type RequestBody =
            /**
             * A request to get the context for executing a choice on a contract.
             *
             */
            Components.Schemas.GetChoiceContextRequest
        namespace Responses {
            export type $200 =
                /**
                 * The context required to exercise a choice on a contract via an interface.
                 * Used to retrieve additional reference date that is passed in via disclosed contracts,
                 * which are in turn referred to via their contract ID in the `choiceContextData`.
                 *
                 */
                Components.Schemas.ChoiceContext
            export type $400 = Components.Responses.$400
            export type $404 = Components.Responses.$404
        }
    }
    namespace GetAllocationTransferContext {
        namespace Parameters {
            export type AllocationId = string
        }
        export interface PathParameters {
            allocationId: Parameters.AllocationId
        }
        export type RequestBody =
            /**
             * A request to get the context for executing a choice on a contract.
             *
             */
            Components.Schemas.GetChoiceContextRequest
        namespace Responses {
            export type $200 =
                /**
                 * The context required to exercise a choice on a contract via an interface.
                 * Used to retrieve additional reference date that is passed in via disclosed contracts,
                 * which are in turn referred to via their contract ID in the `choiceContextData`.
                 *
                 */
                Components.Schemas.ChoiceContext
            export type $400 = Components.Responses.$400
            export type $404 = Components.Responses.$404
        }
    }
    namespace GetAllocationWithdrawContext {
        namespace Parameters {
            export type AllocationId = string
        }
        export interface PathParameters {
            allocationId: Parameters.AllocationId
        }
        export type RequestBody =
            /**
             * A request to get the context for executing a choice on a contract.
             *
             */
            Components.Schemas.GetChoiceContextRequest
        namespace Responses {
            export type $200 =
                /**
                 * The context required to exercise a choice on a contract via an interface.
                 * Used to retrieve additional reference date that is passed in via disclosed contracts,
                 * which are in turn referred to via their contract ID in the `choiceContextData`.
                 *
                 */
                Components.Schemas.ChoiceContext
            export type $400 = Components.Responses.$400
            export type $404 = Components.Responses.$404
        }
    }
}

export interface Operations {
    /**
     * POST /registry/allocations/v1/{allocationId}/choice-contexts/execute-transfer
     */
    ['getAllocationTransferContext']: {
        requestBody: Paths.GetAllocationTransferContext.RequestBody
        params: Paths.GetAllocationTransferContext.PathParameters
        query: UnknownParams
        headers: UnknownParams
        cookies: UnknownParams
        context: Context<
            Paths.GetAllocationTransferContext.RequestBody,
            Paths.GetAllocationTransferContext.PathParameters,
            UnknownParams,
            UnknownParams,
            UnknownParams
        >
        response:
            | Paths.GetAllocationTransferContext.Responses.$200
            | Paths.GetAllocationTransferContext.Responses.$400
            | Paths.GetAllocationTransferContext.Responses.$404
    }
    /**
     * POST /registry/allocations/v1/{allocationId}/choice-contexts/withdraw
     */
    ['getAllocationWithdrawContext']: {
        requestBody: Paths.GetAllocationWithdrawContext.RequestBody
        params: Paths.GetAllocationWithdrawContext.PathParameters
        query: UnknownParams
        headers: UnknownParams
        cookies: UnknownParams
        context: Context<
            Paths.GetAllocationWithdrawContext.RequestBody,
            Paths.GetAllocationWithdrawContext.PathParameters,
            UnknownParams,
            UnknownParams,
            UnknownParams
        >
        response:
            | Paths.GetAllocationWithdrawContext.Responses.$200
            | Paths.GetAllocationWithdrawContext.Responses.$400
            | Paths.GetAllocationWithdrawContext.Responses.$404
    }
    /**
     * POST /registry/allocations/v1/{allocationId}/choice-contexts/cancel
     */
    ['getAllocationCancelContext']: {
        requestBody: Paths.GetAllocationCancelContext.RequestBody
        params: Paths.GetAllocationCancelContext.PathParameters
        query: UnknownParams
        headers: UnknownParams
        cookies: UnknownParams
        context: Context<
            Paths.GetAllocationCancelContext.RequestBody,
            Paths.GetAllocationCancelContext.PathParameters,
            UnknownParams,
            UnknownParams,
            UnknownParams
        >
        response:
            | Paths.GetAllocationCancelContext.Responses.$200
            | Paths.GetAllocationCancelContext.Responses.$400
            | Paths.GetAllocationCancelContext.Responses.$404
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

export type ChoiceContext = Components.Schemas.ChoiceContext
export type DisclosedContract = Components.Schemas.DisclosedContract
export type ErrorResponse = Components.Schemas.ErrorResponse
export type GetChoiceContextRequest = Components.Schemas.GetChoiceContextRequest
