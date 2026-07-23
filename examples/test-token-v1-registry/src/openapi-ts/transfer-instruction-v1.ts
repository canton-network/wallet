import type { Context, UnknownParams } from 'openapi-backend'

declare namespace Components {
    namespace Responses {
        export type $400 = Schemas.ErrorResponse
        export type $404 = Schemas.ErrorResponse
    }
    namespace Schemas {
        /**
         * The context required to exercise a choice on a contract via an interface.
         * Used to retrieve additional reference data that is passed in via disclosed contracts,
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
        export interface GetFactoryRequest {
            /**
             * The arguments that are intended to be passed to the choice provided by the factory.
             * To avoid repeating the Daml type definitions, they are specified as JSON objects.
             * However the concrete format is given by how the choice arguments are encoded using the Daml JSON API
             * (with the `extraArgs.context` and `extraArgs.meta` fields set to the empty object).
             *
             * The choice arguments are provided so that the registry can also provide choice-argument
             * specific contracts, e.g., the configuration for a specific instrument-id.
             *
             */
            choiceArguments: {
                [key: string]: any
            }
            /**
             * If set to true, the response will not include fields prefixed with 'debug'. Useful to save bandwidth.
             */
            excludeDebugFields?: boolean
        }
        /**
         * The transfer factory contract together with the choice context required to exercise the choice
         * provided by the factory. Typically used to implement the generic initiation of on-ledger workflows
         * via a Daml interface.
         *
         * Clients SHOULD avoid reusing the same `FactoryWithChoiceContext` for exercising multiple choices,
         * as the choice context MAY be specific to the choice being exercised.
         *
         */
        export interface TransferFactoryWithChoiceContext {
            /**
             * The contract ID of the contract implementing the factory interface.
             */
            factoryId: string
            /**
             * The kind of transfer workflow that will be used:
             * * `offer`: offer a transfer to the receiver and only transfer if they accept
             * * `direct`: transfer directly to the receiver without asking them for approval.
             *   Only chosen if the receiver has pre-approved direct transfers.
             * * `self`: a self-transfer where the sender and receiver are the same party.
             *   No approval is required, and the transfer is typically immediate.
             *
             */
            transferKind: 'self' | 'direct' | 'offer'
            choiceContext /**
             * The context required to exercise a choice on a contract via an interface.
             * Used to retrieve additional reference data that is passed in via disclosed contracts,
             * which are in turn referred to via their contract ID in the `choiceContextData`.
             *
             */: ChoiceContext
        }
    }
}
declare namespace Paths {
    namespace GetTransferFactory {
        export type RequestBody = Components.Schemas.GetFactoryRequest
        namespace Responses {
            export type $200 =
                /**
                 * The transfer factory contract together with the choice context required to exercise the choice
                 * provided by the factory. Typically used to implement the generic initiation of on-ledger workflows
                 * via a Daml interface.
                 *
                 * Clients SHOULD avoid reusing the same `FactoryWithChoiceContext` for exercising multiple choices,
                 * as the choice context MAY be specific to the choice being exercised.
                 *
                 */
                Components.Schemas.TransferFactoryWithChoiceContext
            export type $400 = Components.Responses.$400
            export type $404 = Components.Responses.$404
        }
    }
    namespace GetTransferInstructionAcceptContext {
        namespace Parameters {
            export type TransferInstructionId = string
        }
        export interface PathParameters {
            transferInstructionId: Parameters.TransferInstructionId
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
                 * Used to retrieve additional reference data that is passed in via disclosed contracts,
                 * which are in turn referred to via their contract ID in the `choiceContextData`.
                 *
                 */
                Components.Schemas.ChoiceContext
            export type $400 = Components.Responses.$400
            export type $404 = Components.Responses.$404
        }
    }
    namespace GetTransferInstructionRejectContext {
        namespace Parameters {
            export type TransferInstructionId = string
        }
        export interface PathParameters {
            transferInstructionId: Parameters.TransferInstructionId
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
                 * Used to retrieve additional reference data that is passed in via disclosed contracts,
                 * which are in turn referred to via their contract ID in the `choiceContextData`.
                 *
                 */
                Components.Schemas.ChoiceContext
            export type $400 = Components.Responses.$400
            export type $404 = Components.Responses.$404
        }
    }
    namespace GetTransferInstructionWithdrawContext {
        namespace Parameters {
            export type TransferInstructionId = string
        }
        export interface PathParameters {
            transferInstructionId: Parameters.TransferInstructionId
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
                 * Used to retrieve additional reference data that is passed in via disclosed contracts,
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
     * POST /registry/transfer-instruction/v1/transfer-factory
     */
    ['getTransferFactory']: {
        requestBody: Paths.GetTransferFactory.RequestBody
        params: UnknownParams
        query: UnknownParams
        headers: UnknownParams
        cookies: UnknownParams
        context: Context<
            Paths.GetTransferFactory.RequestBody,
            UnknownParams,
            UnknownParams,
            UnknownParams,
            UnknownParams
        >
        response:
            | Paths.GetTransferFactory.Responses.$200
            | Paths.GetTransferFactory.Responses.$400
            | Paths.GetTransferFactory.Responses.$404
    }
    /**
     * POST /registry/transfer-instruction/v1/{transferInstructionId}/choice-contexts/accept
     */
    ['getTransferInstructionAcceptContext']: {
        requestBody: Paths.GetTransferInstructionAcceptContext.RequestBody
        params: Paths.GetTransferInstructionAcceptContext.PathParameters
        query: UnknownParams
        headers: UnknownParams
        cookies: UnknownParams
        context: Context<
            Paths.GetTransferInstructionAcceptContext.RequestBody,
            Paths.GetTransferInstructionAcceptContext.PathParameters,
            UnknownParams,
            UnknownParams,
            UnknownParams
        >
        response:
            | Paths.GetTransferInstructionAcceptContext.Responses.$200
            | Paths.GetTransferInstructionAcceptContext.Responses.$400
            | Paths.GetTransferInstructionAcceptContext.Responses.$404
    }
    /**
     * POST /registry/transfer-instruction/v1/{transferInstructionId}/choice-contexts/reject
     */
    ['getTransferInstructionRejectContext']: {
        requestBody: Paths.GetTransferInstructionRejectContext.RequestBody
        params: Paths.GetTransferInstructionRejectContext.PathParameters
        query: UnknownParams
        headers: UnknownParams
        cookies: UnknownParams
        context: Context<
            Paths.GetTransferInstructionRejectContext.RequestBody,
            Paths.GetTransferInstructionRejectContext.PathParameters,
            UnknownParams,
            UnknownParams,
            UnknownParams
        >
        response:
            | Paths.GetTransferInstructionRejectContext.Responses.$200
            | Paths.GetTransferInstructionRejectContext.Responses.$400
            | Paths.GetTransferInstructionRejectContext.Responses.$404
    }
    /**
     * POST /registry/transfer-instruction/v1/{transferInstructionId}/choice-contexts/withdraw
     */
    ['getTransferInstructionWithdrawContext']: {
        requestBody: Paths.GetTransferInstructionWithdrawContext.RequestBody
        params: Paths.GetTransferInstructionWithdrawContext.PathParameters
        query: UnknownParams
        headers: UnknownParams
        cookies: UnknownParams
        context: Context<
            Paths.GetTransferInstructionWithdrawContext.RequestBody,
            Paths.GetTransferInstructionWithdrawContext.PathParameters,
            UnknownParams,
            UnknownParams,
            UnknownParams
        >
        response:
            | Paths.GetTransferInstructionWithdrawContext.Responses.$200
            | Paths.GetTransferInstructionWithdrawContext.Responses.$400
            | Paths.GetTransferInstructionWithdrawContext.Responses.$404
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
export type GetFactoryRequest = Components.Schemas.GetFactoryRequest
export type TransferFactoryWithChoiceContext =
    Components.Schemas.TransferFactoryWithChoiceContext
