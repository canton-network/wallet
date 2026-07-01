// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'

import fs from 'node:fs'
import path from 'node:path'
import dts from 'rollup-plugin-dts'

const DAML_JS_BASE = path.resolve(
    import.meta.dirname,
    '../../damljs/splice-test-token-v1'
)

/** Auto-discover every @daml.js/* package present in baseDir. */
function discoverDamlJsPackages(baseDir) {
    const packages = {}
    for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        const pkgJsonPath = path.join(baseDir, entry.name, 'package.json')
        if (!fs.existsSync(pkgJsonPath)) continue
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
        if (pkgJson.name?.startsWith('@daml.js/')) {
            packages[pkgJson.name] = path.join(baseDir, entry.name)
        }
    }
    return packages
}

function buildPathsMap(packageDirs) {
    const map = {}
    for (const [name, pkgDir] of Object.entries(packageDirs)) {
        const pkgJson = JSON.parse(
            fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')
        )
        const typesRel = pkgJson.types || pkgJson.typings || 'lib/index.d.ts'
        const typesAbs = path.resolve(pkgDir, typesRel)
        const libDir = path.resolve(pkgDir, 'lib')
        map[name] = [typesAbs]
        map[`${name}/*`] = [path.join(libDir, '*')]
        map[`${name}/lib/*/module.js`] = [path.join(libDir, '*/module.d.ts')]
        map[`${name}/lib/*/index.js`] = [path.join(libDir, '*/index.d.ts')]
    }
    return map
}

function buildAliasEntries(packageDirs) {
    const entries = []
    for (const [name, pkgDir] of Object.entries(packageDirs)) {
        const pkgJson = JSON.parse(
            fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')
        )
        const mainAbs = path.resolve(pkgDir, pkgJson.main || 'lib/index.js')
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        entries.push({
            find: new RegExp(`^${escapedName}/(.+)$`),
            replacement: `${pkgDir}/$1`,
        })
        entries.push({ find: name, replacement: mainAbs })
    }
    return entries
}

const DAML_JS_PACKAGES = discoverDamlJsPackages(DAML_JS_BASE)
const pathsMap = buildPathsMap(DAML_JS_PACKAGES)
const damlJsAlias = alias({ entries: buildAliasEntries(DAML_JS_PACKAGES) })
const commonjsPlugin = commonjs({
    transformMixedEsModules: true,
    esmExternals: true,
    requireReturnsDefault: false,
})

const pkgPath = path.resolve(process.cwd(), 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

const exceptions = [
    '@daml/types',
    '@daml/ledger',
    '@mojotech/json-type-validation',
]
const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
].filter((dep) => !exceptions.includes(dep))

function isExternal(id) {
    if (id.startsWith('node:')) return true
    return external.some((dep) => id === dep || id.startsWith(`${dep}/`))
}

// bundle ESM
const codeEsm = {
    input: 'src/index.ts',
    output: { file: 'dist/index.js', format: 'es', sourcemap: true },
    external,
    plugins: [damlJsAlias, json(), commonjsPlugin, nodeResolve(), typescript()],
}

// bundle CJS
const codeCjs = {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.cjs',
        format: 'cjs',
        interop: 'auto',
        sourcemap: true,
        exports: 'named',
    },
    external,
    plugins: [damlJsAlias, json(), commonjsPlugin, nodeResolve(), typescript()],
}

// bundle for browser
const codeBrowser = {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.browser.js',
        format: 'es',
        sourcemap: true,
    },
    external,
    plugins: [
        damlJsAlias,
        json(),
        commonjsPlugin,
        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),
        typescript(),
    ],
}

// bundle DTS including types from codegen
const types = {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [
        dts({
            respectExternal: false,
            compilerOptions: {
                baseUrl: '.',
                paths: pathsMap,
                declaration: true,
                emitDeclarationOnly: true,
            },
        }),
    ],
}

const registryTsOptions = {
    compilerOptions: { declaration: false, declarationMap: false },
}
const registryEsm = {
    input: 'src/registry/index.ts',
    output: { file: 'dist/registry/index.js', format: 'es', sourcemap: true },
    external: isExternal,
    plugins: [
        json(),
        commonjsPlugin,
        nodeResolve(),
        typescript(registryTsOptions),
    ],
}

const registryCjs = {
    input: 'src/registry/index.ts',
    output: {
        file: 'dist/registry/index.cjs',
        format: 'cjs',
        interop: 'auto',
        sourcemap: true,
        exports: 'named',
    },
    external: isExternal,
    plugins: [
        json(),
        commonjsPlugin,
        nodeResolve(),
        typescript(registryTsOptions),
    ],
}

const registryTypes = {
    input: 'src/registry/index.ts',
    output: { file: 'dist/registry/index.d.ts', format: 'es' },
    external: isExternal,
    plugins: [
        dts({
            respectExternal: false,
            compilerOptions: {
                baseUrl: '.',
                declaration: true,
                emitDeclarationOnly: true,
            },
        }),
    ],
}

export default [
    codeEsm,
    codeCjs,
    codeBrowser,
    types,
    registryEsm,
    registryCjs,
    registryTypes,
]
