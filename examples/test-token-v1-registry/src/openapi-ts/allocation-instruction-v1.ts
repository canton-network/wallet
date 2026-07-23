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
         * A factory contract together with the choice context required to exercise the choice
         * provided by the factory. Typically used to implement the generic initiation of on-ledger workflows
         * via a Daml interface.
         *
         * Clients SHOULD avoid reusing the same `FactoryWithChoiceContext` for exercising multiple choices,
         * as the choice context MAY be specific to the choice being exercised.
         *
         */
        export interface FactoryWithChoiceContext {
            /**
             * The contract ID of the contract implementing the factory interface.
             */
            factoryId: string
            choiceContext /**
             * The context required to exercise a choice on a contract via an interface.
             * Used to retrieve additional reference date that is passed in via disclosed contracts,
             * which are in turn referred to via their contract ID in the `choiceContextData`.
             *
             */: ChoiceContext
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
    }
}
declare namespace Paths {
    namespace GetAllocationFactory {
        export type RequestBody = Components.Schemas.GetFactoryRequest
        namespace Responses {
            export type $200 =
                /**
                 * A factory contract together with the choice context required to exercise the choice
                 * provided by the factory. Typically used to implement the generic initiation of on-ledger workflows
                 * via a Daml interface.
                 *
                 * Clients SHOULD avoid reusing the same `FactoryWithChoiceContext` for exercising multiple choices,
                 * as the choice context MAY be specific to the choice being exercised.
                 *
                 */
                Components.Schemas.FactoryWithChoiceContext
            export type $400 = Components.Responses.$400
            export type $404 = Components.Responses.$404
        }
    }
}

export interface Operations {
    /**
     * POST /registry/allocation-instruction/v1/allocation-factory
     */
    ['getAllocationFactory']: {
        requestBody: Paths.GetAllocationFactory.RequestBody
        params: UnknownParams
        query: UnknownParams
        headers: UnknownParams
        cookies: UnknownParams
        context: Context<
            Paths.GetAllocationFactory.RequestBody,
            UnknownParams,
            UnknownParams,
            UnknownParams,
            UnknownParams
        >
        response:
            | Paths.GetAllocationFactory.Responses.$200
            | Paths.GetAllocationFactory.Responses.$400
            | Paths.GetAllocationFactory.Responses.$404
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
export type FactoryWithChoiceContext =
    Components.Schemas.FactoryWithChoiceContext
export type GetFactoryRequest = Components.Schemas.GetFactoryRequest
