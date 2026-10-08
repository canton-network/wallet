import { test, expect, describe } from 'vitest'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

const snippets = readdirSync('./snippets').filter(
    (f) =>
        f.endsWith('.ts') &&
        !readFileSync(`./snippets/${f}`).includes('// @disable-snapshot-test')
)

describe('testing doc snippets', () => {
    for (const filename of snippets) {
        const fullpath = path.join(import.meta.dirname, './snippets', filename)

        test(
            filename,
            async () => {
                const { default: fn } = await import(fullpath)
                expect(fn).toBeDefined()

                const result = await fn()
                // Run `pnpm snippets-update` to update snapshots for new changes
                expect(result).toMatchSnapshot()
            },
            120_000
        )
    }
})
