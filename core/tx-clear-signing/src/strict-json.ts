// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * A JSON parser that rejects input RFC 8785 cannot sign faithfully.
 *
 * `JSON.parse` keeps the last of a duplicated member name and accepts a lone surrogate. RFC 8785
 * requires I-JSON (RFC 7493), which forbids both. A descriptor is text until this parser has
 * accepted it, so a duplicate cannot be dropped before the signature is checked.
 *
 * A member named `__proto__` is stored as an own data property. Nesting deeper than
 * {@link MAX_JSON_NESTING_DEPTH} is rejected, which RFC 8259 section 9 allows: past that depth the
 * parser would throw a `RangeError` instead of reporting the document.
 */
export class StrictJsonError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'StrictJsonError'
    }
}

const NUMBER = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/

/**
 * The deepest array or object accepted, counting the root as 1.
 * `canonicalize` uses the same limit.
 */
export const MAX_JSON_NESTING_DEPTH = 64

/** The largest descriptor text accepted, in UTF-8 bytes. Longer text is refused before it is parsed. */
export const MAX_DESCRIPTOR_BYTES = 256 * 1024

/**
 * Throws when `text` is longer than {@link MAX_DESCRIPTOR_BYTES} in UTF-8. A UTF-16 code unit is at
 * least one UTF-8 byte, so text with more code units than the cap is refused without encoding it.
 *
 * @throws StrictJsonError
 */
export function assertDescriptorSize(text: string): void {
    const tooLong =
        text.length > MAX_DESCRIPTOR_BYTES ||
        new TextEncoder().encode(text).length > MAX_DESCRIPTOR_BYTES
    if (tooLong) {
        throw new StrictJsonError(
            `descriptor is larger than ${MAX_DESCRIPTOR_BYTES} bytes`
        )
    }
}

/** Parses `text` as I-JSON. @throws StrictJsonError */
export function parseJsonStrict(text: string): unknown {
    const parser = new Parser(text)
    const value = parser.parseValue('$', 1)
    parser.skipWs()
    if (!parser.done()) {
        throw new StrictJsonError(`trailing data at offset ${parser.offset()}`)
    }
    return value
}

class Parser {
    private i = 0

    constructor(private readonly text: string) {}

    offset(): number {
        return this.i
    }

    done(): boolean {
        return this.i >= this.text.length
    }

    parseValue(path: string, depth: number): unknown {
        this.skipWs()
        const c = this.peek()
        if (c === '{') return this.parseObject(path, depth)
        if (c === '[') return this.parseArray(path, depth)
        if (c === '"') return this.parseString(path)
        if (c === 't') return this.literal('true', true)
        if (c === 'f') return this.literal('false', false)
        if (c === 'n') return this.literal('null', null)
        if (c === '-' || (c !== undefined && c >= '0' && c <= '9')) {
            return this.parseNumber(path)
        }
        throw this.fail(
            c === undefined
                ? `expected a value at ${path}`
                : `unexpected character at offset ${this.i}`
        )
    }

    skipWs(): void {
        while (
            this.peek() === ' ' ||
            this.peek() === '\n' ||
            this.peek() === '\r' ||
            this.peek() === '\t'
        ) {
            this.i++
        }
    }

    private parseObject(path: string, depth: number): Record<string, unknown> {
        this.assertDepth(path, depth)
        this.expect('{')
        this.skipWs()
        const object: Record<string, unknown> = {}
        const seen = new Set<string>()
        if (this.peek() === '}') {
            this.i++
            return object
        }
        for (;;) {
            this.skipWs()
            if (this.peek() !== '"') {
                throw this.fail(`expected a member name at ${path}`)
            }
            const key = this.parseString(path)
            if (seen.has(key)) {
                throw this.fail(`duplicate key '${key}' at ${path}`)
            }
            seen.add(key)
            this.skipWs()
            this.expect(':')
            setMember(
                object,
                key,
                this.parseValue(childPath(path, key), depth + 1)
            )
            this.skipWs()
            const next = this.peek()
            if (next === ',') {
                this.i++
                continue
            }
            if (next === '}') {
                this.i++
                return object
            }
            throw this.fail(`expected ',' or '}' at ${path}`)
        }
    }

    private parseArray(path: string, depth: number): unknown[] {
        this.assertDepth(path, depth)
        this.expect('[')
        this.skipWs()
        const items: unknown[] = []
        if (this.peek() === ']') {
            this.i++
            return items
        }
        for (;;) {
            items.push(this.parseValue(`${path}[${items.length}]`, depth + 1))
            this.skipWs()
            const next = this.peek()
            if (next === ',') {
                this.i++
                continue
            }
            if (next === ']') {
                this.i++
                return items
            }
            throw this.fail(`expected ',' or ']' at ${path}`)
        }
    }

    private parseString(path: string): string {
        this.expect('"')
        let value = ''
        while (!this.done()) {
            const c = this.text.charCodeAt(this.i)
            if (c === 0x22) {
                this.i++
                return value
            }
            if (c === 0x5c) {
                value += this.escape(path)
                continue
            }
            if (c <= 0x1f) {
                throw this.fail(`unescaped control character at ${path}`)
            }
            value += this.codeUnit(c, path)
        }
        throw this.fail(`unterminated string at ${path}`)
    }

    private escape(path: string): string {
        this.i++
        const c = this.peek()
        this.i++
        switch (c) {
            case '"':
            case '\\':
            case '/':
                return c
            case 'b':
                return '\b'
            case 'f':
                return '\f'
            case 'n':
                return '\n'
            case 'r':
                return '\r'
            case 't':
                return '\t'
            case 'u':
                return this.unicode(path)
            default:
                throw this.fail(`invalid escape at ${path}`)
        }
    }

    private unicode(path: string): string {
        const unit = this.hex4(path)
        if (unit >= 0xd800 && unit <= 0xdbff) {
            if (this.text.startsWith('\\u', this.i)) {
                this.i += 2
                const low = this.hex4(path)
                if (low >= 0xdc00 && low <= 0xdfff) {
                    return String.fromCharCode(unit, low)
                }
            }
            throw this.fail(`lone surrogate at ${path}`)
        }
        if (unit >= 0xdc00 && unit <= 0xdfff) {
            throw this.fail(`lone surrogate at ${path}`)
        }
        return String.fromCharCode(unit)
    }

    private hex4(path: string): number {
        const digits = this.text.slice(this.i, this.i + 4)
        if (!/^[0-9a-fA-F]{4}$/.test(digits)) {
            throw this.fail(`invalid unicode escape at ${path}`)
        }
        this.i += 4
        return Number.parseInt(digits, 16)
    }

    /** One source code unit, or a surrogate pair already present in the text. */
    private codeUnit(code: number, path: string): string {
        this.i++
        if (code >= 0xd800 && code <= 0xdbff) {
            const low = this.text.charCodeAt(this.i)
            if (low >= 0xdc00 && low <= 0xdfff) {
                this.i++
                return String.fromCharCode(code, low)
            }
            throw this.fail(`lone surrogate at ${path}`)
        }
        if (code >= 0xdc00 && code <= 0xdfff) {
            throw this.fail(`lone surrogate at ${path}`)
        }
        return String.fromCharCode(code)
    }

    private parseNumber(path: string): number {
        const match = NUMBER.exec(this.text.slice(this.i))
        if (!match) throw this.fail(`invalid number at ${path}`)
        const token = match[0]
        this.i += token.length
        const value = Number(token)
        if (!Number.isFinite(value)) {
            throw this.fail(`non-finite number at ${path}`)
        }
        return value
    }

    private literal<T>(word: string, value: T): T {
        if (!this.text.startsWith(word, this.i)) {
            throw this.fail(`expected '${word}' at offset ${this.i}`)
        }
        this.i += word.length
        return value
    }

    private expect(c: string): void {
        if (this.peek() !== c) {
            throw this.fail(`expected '${c}' at offset ${this.i}`)
        }
        this.i++
    }

    private peek(): string | undefined {
        return this.text[this.i]
    }

    private assertDepth(path: string, depth: number): void {
        if (depth > MAX_JSON_NESTING_DEPTH) {
            throw this.fail(
                `nesting is deeper than ${MAX_JSON_NESTING_DEPTH} at ${path}`
            )
        }
    }

    private fail(message: string): StrictJsonError {
        return new StrictJsonError(message)
    }
}

/**
 * Stores `key` as an own data property.
 *
 * `__proto__` is a setter on `Object.prototype`. An own data property keeps the member and leaves
 * the object's prototype unchanged, so the text that was signed is the text that is parsed.
 */
function setMember(
    object: Record<string, unknown>,
    key: string,
    value: unknown
): void {
    if (key !== '__proto__') {
        object[key] = value
        return
    }
    Object.defineProperty(object, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
    })
}

function childPath(path: string, key: string): string {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key)
        ? `${path}.${key}`
        : `${path}[${JSON.stringify(key)}]`
}
