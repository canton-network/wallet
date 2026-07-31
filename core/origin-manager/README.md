# @canton-network/core-origin-manager

This package provides a secure cross-window communication mechanism for verifying the origin of messages in a browser environment. It implements a handshake protocol to validate and track allowed origins before permitting inter-window communication.

## Installation

```sh
yarn add @canton-network/core-origin-manager
```

## Overview

The origin-check package provides origin validation for secure cross-window communication in browser applications. It uses a bidirectional handshake protocol to establish trust between parent and child windows before allowing message passing.

## Key Components

### [OriginHandshake](./src/types.ts)

A Zod-validated schema defining the structure of origin handshake messages. Contains:

- `message`: The type of handshake message (`SPLICE_WALLET_BROADCAST_ORIGIN` or `SPLICE_WALLET_BROADCAST_ORIGIN_ACK`)
- `origin`: The origin string being communicated

### [OriginManager](./src/manager.ts)

Abstract base class that manages origin validation through a message-based handshake protocol. Provides:

- Automatic listener registration for `window.message` events
- Origin allowlist management
- Message validation using Zod schemas
- `assert(origin)`: Check if an origin is allowed
- `postMessage(message, origin)`: Send a message to an allowed origin (safely validates origin first)
- `removeListener()`: Clean up the message event listener

### [ParentWindowOriginManager](./src/manager.ts)

Extends `OriginManager` for use in parent windows. Features:

- `poll(origin)`: Initiates polling to establish connection with a child window
- `postMessage(message, origin)`: Send a message to the child window (only succeeds if handshake completed)
- Automatically clears polling intervals upon successful handshake

### [ChildWindowOriginManager](./src/manager.ts)

Extends `OriginManager` for use in child windows. Features:

- `postMessage(message, origin)`: Send a message to the parent window (only succeeds if handshake completed)
- Automatic handshake acknowledgment when receiving origin broadcasts
- Cleans up listeners after successful handshake

## Usage

### Parent Window Example

```typescript
import { ParentWindowOriginManager } from '@canton-network/core-origin-check'

// Create a manager instance
const originManager = new ParentWindowOriginManager()

// Start polling for a specific origin
const childOrigin = 'https://child.example.com'
originManager.poll(childOrigin)

// Send a message using the safe postMessage method
// This will only succeed if the handshake is complete
originManager.postMessage({ type: 'greeting', data: 'hello' }, childOrigin)

// Or manually check before sending
if (originManager.assert(childOrigin)) {
    window.postMessage(data, childOrigin)
}
```

### Child Window Example

```typescript
import { ChildWindowOriginManager } from '@canton-network/core-origin-check'

// Create a manager instance
const originManager = new ChildWindowOriginManager()

// The handshake is automatic; once complete, listener is removed

// Send a message using the safe postMessage method
// This will only succeed if the handshake is complete
const parentOrigin = window.opener?.location.origin
if (parentOrigin) {
    originManager.postMessage({ type: 'response', data: 'world' }, parentOrigin)
}

// Or manually check before sending
if (parentOrigin && originManager.assert(parentOrigin)) {
    window.opener?.postMessage(data, parentOrigin)
}
```

## Security Considerations

- Always validate origins before posting messages across window boundaries
- The handshake protocol ensures that both sides confirm the other's origin
- Use `postMessage()` method to automatically validate origins before sending
- The `assert()` method checks if an origin has completed the handshake
- Attempting `postMessage()` to an unapproved origin will silently fail
- Call `removeListener()` to clean up event listeners when done
