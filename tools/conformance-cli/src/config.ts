// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'node:path'
import { z } from 'zod'
import { ConfigSchema } from '@canton-network/tool-conformance-dapp'

/** Relative paths resolve against `baseDir`, i.e. the config file's directory. */
export function cliConfigSchema(baseDir = '.') {
    const path = z
        .string()
        .trim()
        .min(1)
        .transform((value) => resolve(baseDir, value))
    return z.strictObject({
        serve: z
            .strictObject({
                port: z.number().int().min(0).max(65535).default(8082),
                host: z.string().trim().min(1).default('127.0.0.1'),
            })
            .prefault({}),
        run: z
            .strictObject({
                suite: ConfigSchema,
                out: path.prefault('cip103-ctrf.json'),
                signingKey: path.optional(),
                headed: z.boolean().default(false),
                extension: path.optional(),
                disableWebSecurity: z.boolean().default(false),
            })
            .optional(),
        sign: z
            .strictObject({
                artifact: path,
                signingKey: path,
                out: path.optional(),
            })
            .optional(),
        verify: z
            .strictObject({
                artifact: path,
                /** Defaults to `<artifact>.sig`; `null` skips signature verification. */
                artifactSignature: path.nullable().optional(),
                publicKey: path.optional(),
            })
            .optional(),
    })
}
export type CliConfig = z.output<ReturnType<typeof cliConfigSchema>>

const { shape } = cliConfigSchema()
export const ServeConfigSchema = shape.serve.unwrap()
export const RunOptionsSchema = shape.run.unwrap()
export const SignOptionsSchema = shape.sign.unwrap()
export const VerifyOptionsSchema = shape.verify.unwrap()
export type ServeOptions = z.input<typeof ServeConfigSchema>
export type RunOptions = z.input<typeof RunOptionsSchema>
