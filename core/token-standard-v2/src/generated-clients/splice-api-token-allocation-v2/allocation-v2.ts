// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface paths {
    '/registry/allocation/v2/settlement-factory': {
        parameters: {
            query?: never
            header?: never
            path?: never
            cookie?: never
        }
        get?: never
        put?: never
        /**
         * @description Get the factory and choice context for settling allocations using the
         *     `SettlementFactory_SettleBatch` choice.
         *
         *     Registries MAY limit the size of the settlement requests that they support.
         *
         *     To ensure wide compatibility with apps, registries MUST support all
         *     settlement requests that involve at most 25 transfer legs. In a worst
         *     case scenario this means supporting a settlement request involving:
         *
         *     - 25 transfer legs
         *     - 25 distinct instrument ids
         *     - 50 allocations
         *     - 50 distinct accounts
         *     - 100 distinct parties
         *
         *     Registries MAY support larger settlement requests.
         */
        post: operations['getSettlementFactory']
        delete?: never
        options?: never
        head?: never
        patch?: never
        trace?: never
    }
    '/registry/allocations/v2/{allocationId}/choice-contexts/withdraw': {
        parameters: {
            query?: never
            header?: never
            path?: never
            cookie?: never
        }
        get?: never
        put?: never
        /** @description Get the choice context to withdraw an allocation. */
        post: operations['getAllocationWithdrawContext']
        delete?: never
        options?: never
        head?: never
        patch?: never
        trace?: never
    }
    '/registry/allocations/v2/{allocationId}/choice-contexts/cancel': {
        parameters: {
            query?: never
            header?: never
            path?: never
            cookie?: never
        }
        get?: never
        put?: never
        /** @description Get the choice context to cancel an allocation. */
        post: operations['getAllocationCancelContext']
        delete?: never
        options?: never
        head?: never
        patch?: never
        trace?: never
    }
}
export type webhooks = Record<string, never>
export interface components {
    schemas: {
        GetFactoryRequest: {
            /**
             * @description The arguments that are intended to be passed to the choice provided by the factory.
             *     To avoid repeating the Daml type definitions, they are specified as JSON objects.
             *     However the concrete format is given by how the choice arguments are encoded using the Daml JSON API
             *     (with the `extraArgs.context` and `extraArgs.meta` fields set to the empty object).
             *
             *     The choice arguments are provided so that the registry can also provide choice-argument
             *     specific contracts, e.g., the configuration for a specific instrument-id.
             */
            choiceArguments: Record<string, never>
            /**
             * @description If set to true, the response will not include fields prefixed with 'debug'. Useful to save bandwidth.
             * @default false
             */
            excludeDebugFields: boolean
        }
        /**
         * @description A factory contract together with the choice context required to exercise the choice
         *     provided by the factory. Typically used to implement the generic initiation of on-ledger workflows
         *     via a Daml interface.
         *
         *     Clients SHOULD avoid reusing the same `FactoryWithChoiceContext` for exercising multiple choices,
         *     as the choice context MAY be specific to the choice being exercised.
         */
        FactoryWithChoiceContext: {
            /** @description The contract ID of the contract implementing the factory interface. */
            factoryId: string
            choiceContext: components['schemas']['ChoiceContext']
        }
        /** @description A request to get the context for executing a choice on a contract. */
        GetChoiceContextRequest: {
            /**
             * @description Metadata that will be passed to the choice, and should be incorporated
             *     into the choice context. Provided for extensibility.
             */
            meta?: {
                [key: string]: string
            }
            /**
             * @description If set to true, the response will not include fields prefixed with 'debug'. Useful to save bandwidth.
             * @default false
             */
            excludeDebugFields: boolean
        }
        /**
         * @description The context required to exercise a choice on a contract via an interface.
         *     Used to retrieve additional reference data that is passed in via disclosed contracts,
         *     which are in turn referred to via their contract ID in the `choiceContextData`.
         *
         *     Asset implementations SHOULD avoid that this value depends on contract-ids passed
         *     in the choice arguments, so that clients can prefetch choice contexts when chaining
         *     multiple token standard actions together in a single Daml transaction.
         */
        ChoiceContext: {
            /** @description The additional data to use when exercising the choice. */
            choiceContextData: Record<string, never>
            /**
             * @description The contracts that are required to be disclosed to the participant node for exercising
             *     the choice.
             */
            disclosedContracts: components['schemas']['DisclosedContract'][]
        }
        DisclosedContract: {
            /** @description The fully qualified template identifier of the disclosed contract. */
            templateId: string
            /** @description The contract ID of the disclosed contract. */
            contractId: string
            /**
             * @description The serialized created event of the disclosed contract, forwarded unchanged as retrieved
             *     from the JSON Ledger API.
             */
            createdEventBlob: string
            /**
             * @description The synchronizer to which the contract is currently assigned.
             *     If the contract is in the process of being reassigned, then a "409" response is returned.
             */
            synchronizerId: string
            /**
             * @description The name of the Daml package that was used to create the contract.
             *     Use this data only if you trust the provider, as it might not match the data in the
             *     `createdEventBlob`.
             */
            debugPackageName?: string
            /**
             * @description The contract arguments that were used to create the contract.
             *     Use this data only if you trust the provider, as it might not match the data in the
             *     `createdEventBlob`.
             */
            debugPayload?: Record<string, never>
            /**
             * Format: date-time
             * @description The ledger effective time at which the contract was created.
             *     Use this data only if you trust the provider, as it might not match the data in the
             *     `createdEventBlob`.
             */
            debugCreatedAt?: string
        }
        ErrorResponse: {
            error: string
        }
    }
    responses: {
        /** @description bad request */
        400: {
            headers: {
                [name: string]: unknown
            }
            content: {
                'application/json': components['schemas']['ErrorResponse']
            }
        }
        /** @description not found */
        404: {
            headers: {
                [name: string]: unknown
            }
            content: {
                'application/json': components['schemas']['ErrorResponse']
            }
        }
        /** @description conflict */
        409: {
            headers: {
                [name: string]: unknown
            }
            content: {
                'application/json': components['schemas']['ErrorResponse']
            }
        }
    }
    parameters: never
    requestBodies: never
    headers: never
    pathItems: never
}
export type $defs = Record<string, never>
export interface operations {
    getSettlementFactory: {
        parameters: {
            query?: never
            header?: never
            path?: never
            cookie?: never
        }
        requestBody: {
            content: {
                'application/json': components['schemas']['GetFactoryRequest']
            }
        }
        responses: {
            /** @description ok */
            200: {
                headers: {
                    [name: string]: unknown
                }
                content: {
                    'application/json': components['schemas']['FactoryWithChoiceContext']
                }
            }
            400: components['responses']['400']
            404: components['responses']['404']
            409: components['responses']['409']
        }
    }
    getAllocationWithdrawContext: {
        parameters: {
            query?: never
            header?: never
            path: {
                /** @description The contract ID of the allocation to withdraw. */
                allocationId: string
            }
            cookie?: never
        }
        requestBody: {
            content: {
                'application/json': components['schemas']['GetChoiceContextRequest']
            }
        }
        responses: {
            /** @description ok */
            200: {
                headers: {
                    [name: string]: unknown
                }
                content: {
                    'application/json': components['schemas']['ChoiceContext']
                }
            }
            400: components['responses']['400']
            404: components['responses']['404']
            409: components['responses']['409']
        }
    }
    getAllocationCancelContext: {
        parameters: {
            query?: never
            header?: never
            path: {
                /** @description The contract ID of the allocation to cancel. */
                allocationId: string
            }
            cookie?: never
        }
        requestBody: {
            content: {
                'application/json': components['schemas']['GetChoiceContextRequest']
            }
        }
        responses: {
            /** @description ok */
            200: {
                headers: {
                    [name: string]: unknown
                }
                content: {
                    'application/json': components['schemas']['ChoiceContext']
                }
            }
            400: components['responses']['400']
            404: components['responses']['404']
            409: components['responses']['409']
        }
    }
}
