// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const DB_NAME = 'com.splice.wallet.crypto'
const DB_VERSION = 1
const KEY_STORE = 'keys'
const KEY_ID = 'access-token-key'

interface EncryptedPayload {
    ciphertext: number[]
    iv: number[]
}

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = () => {
            const db = req.result
            if (!db.objectStoreNames.contains(KEY_STORE)) {
                db.createObjectStore(KEY_STORE)
            }
        }

        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

async function get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await openDb()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly')
        const req = tx.objectStore(storeName).get(key)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

async function set<T>(storeName: string, key: string, value: T): Promise<void> {
    const db = await openDb()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite')
        tx.objectStore(storeName).put(value, key)

        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

async function remove(storeName: string, key: string): Promise<void> {
    const db = await openDb()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite')
        tx.objectStore(storeName).delete(key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

let keyPromise: Promise<CryptoKey> | null = null

function getKey(): Promise<CryptoKey> {
    if (!keyPromise) {
        keyPromise = (async () => {
            const existing = await get<CryptoKey>(KEY_STORE, KEY_ID)
            if (existing) return existing
            const key = await crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            )
            await set(KEY_STORE, KEY_ID, key)
            return key
        })()
    }
    return keyPromise
}

export async function encryptString(plaintext: string): Promise<string> {
    const key = await getKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(plaintext)
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    )

    const payload: EncryptedPayload = {
        ciphertext: Array.from(new Uint8Array(ciphertext)),
        iv: Array.from(iv),
    }

    return JSON.stringify(payload)
}

export async function decryptString(encryptedString: string): Promise<string> {
    const { ciphertext, iv } = JSON.parse(encryptedString)
    const key = await getKey()

    const decryptedString = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(ciphertext)
    )

    return new TextDecoder().decode(decryptedString)
}

export async function destroyTokenKey(): Promise<void> {
    await remove(KEY_STORE, KEY_ID)
    keyPromise = null
}
