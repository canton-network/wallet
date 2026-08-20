// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export class Env {
    static FIREBLOCKS_API_KEY = () => Env.get('FIREBLOCKS_API_KEY')
    static FIREBLOCKS_SECRET = () => Env.get('FIREBLOCKS_SECRET')
    static FIREBLOCKS_API_PATH = () => Env.get('FIREBLOCKS_API_PATH')
    static BLOCKDAEMON_API_URL = () => Env.get('BLOCKDAEMON_API_URL')
    static BLOCKDAEMON_API_KEY = () => Env.get('BLOCKDAEMON_API_KEY')
    static BLOCKDAEMON_CAIP2 = () => Env.get('BLOCKDAEMON_CAIP2')
    static SECUROSYS_TSB_BASE_URL = () => Env.get('SECUROSYS_TSB_BASE_URL')
    static SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY = () =>
        Env.get('SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY')
    static SECUROSYS_TSB_KEY_OPERATION_API_KEY = () =>
        Env.get('SECUROSYS_TSB_KEY_OPERATION_API_KEY')
    static SECUROSYS_TSB_BEARER_TOKEN = () =>
        Env.get('SECUROSYS_TSB_BEARER_TOKEN')
    static SECUROSYS_TSB_MTLS_P12_PATH = () =>
        Env.get('SECUROSYS_TSB_MTLS_P12_PATH')
    static SECUROSYS_TSB_MTLS_P12_PASSWORD = () =>
        Env.get('SECUROSYS_TSB_MTLS_P12_PASSWORD')
    static SECUROSYS_TSB_KEY_PASSWORD = () =>
        Env.get('SECUROSYS_TSB_KEY_PASSWORD')
    static SECUROSYS_TSB_SIGNATURE_ALGORITHM = () =>
        Env.get('SECUROSYS_TSB_SIGNATURE_ALGORITHM')
    static DFNS_ORG_ID = () => Env.get('DFNS_ORG_ID')
    static DFNS_BASE_URL = () => Env.get('DFNS_BASE_URL')
    static DFNS_CRED_ID = () => Env.get('DFNS_CRED_ID')
    static DFNS_PRIVATE_KEY = () => Env.get('DFNS_PRIVATE_KEY')
    static DFNS_AUTH_TOKEN = () => Env.get('DFNS_AUTH_TOKEN')

    static get(
        key: string,
        options: { required?: boolean; fallback: string }
    ): string
    static get(
        key: string,
        options: { required: true; fallback?: string }
    ): string
    static get(
        key: string,
        options?: { required?: boolean; fallback?: string } | undefined
    ): string | undefined
    static get(
        key: string,
        options?: { required?: boolean; fallback?: string } | undefined
    ): string | undefined {
        const { fallback, required } = options || {}
        const value = process.env[key]?.trim() || fallback?.trim()

        if (required && !value) {
            throw new Error(`Required environment variable (${key}) missing.`)
        }

        return value
    }
}
