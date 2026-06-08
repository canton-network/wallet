# @canton-network/core-acs-reader

## Overview

The ACS Reader abstracts the complexity of querying and managing active contracts from the Canton ledger. It offers both standard and paginated access patterns, with intelligent caching to minimize network overhead and improve application performance.

## Installation

```bash
yarn add @canton-network/core-acs-reader
```

## Quick Start

```typescript
import { ACSReader } from '@canton-network/core-acs-reader'
import { ledgerProvider } from './your-ledger-setup'

// Initialize the reader
const reader = new ACSReader(ledgerProvider)

// Read active contracts with filtering
const contracts = await reader.read({
    templateIds: ['templateId'],
    parties: ['partyId'],
    offset: 0,
})

// Get JavaScript contract objects (convenience method)
const jsContracts = await reader.readJsContracts({
    templateIds: ['templateId'],
    parties: ['partyId'],
})
```

## Core Concepts

### ACS Reader

The `ACSReader` class is the primary interface for querying active contracts. It maintains an internal cache and provides methods for both raw and processed contract data.

### Options

**Standard Options** (`AcsOptions`):

- `offset`: Ledger offset to query from (automatically resolved if omitted)
- `templateIds`: Array of template IDs to filter by
- `interfaceIds`: Array of interface IDs to filter by
- `parties`: Array of party IDs to filter by
- `filterByParty`: Enable party-based filtering
- `limit`: Maximum number of results to return
- `continueUntilCompletion`: Continue fetching until all data is retrieved

**Paginated Options** (`PaginatedAcsOptions`):
Same as standard options, plus:

- `pageToken`: Token for fetching specific pages
- `maxPageSize`: Maximum number of contracts per page

### Cache Configuration

Configure cache behavior with `ACSCacheCollectionOptions`:

```typescript
const reader = new ACSReader(ledgerProvider, {
    maxEventsBeforePrune: 1000, // Events before compaction
    safeOffsetDeltaForPrune: 100, // Offset window to preserve
})
```

## Usage Examples

### Basic Contract Retrieval

```typescript
const reader = new ACSReader(ledgerProvider)

// Fetch all active contracts
const allContracts = await reader.read({})

// Filter by template ID
const tokenContracts = await reader.read({
    templateIds: ['templateId'],
})

// Filter by multiple parties
const partyContracts = await reader.read({
    parties: ['partyId', 'partyId2'],
    filterByParty: true,
})
```

### Working with JavaScript Contracts

The `readJsContracts` method returns contract data in a more accessible format:

```typescript
const jsContracts = await reader.readJsContracts({
    templateIds: ['templateId'],
    parties: ['partyId'],
})

// Each contract includes:
// - All fields from createdEvent
// - synchronizerId
jsContracts.forEach((contract) => {
    console.log(contract.contractId, contract.templateId)
    console.log(contract.createArgument)
})
```

### Paginated Access

For large datasets, use the paginated reader:

```typescript
const reader = new ACSReader(ledgerProvider)

// Fetch first page
const firstPage = await reader.paginated.read({
    templateIds: ['templateId'],
    maxPageSize: 100,
})

// Fetch next page using token
const nextPage = await reader.paginated.read({
    templateIds: ['templateId'],
    pageToken: firstPage.nextPageToken,
    maxPageSize: 100,
})

// Or fetch all pages at once
const allPages = await reader.paginated.read({
    templateIds: ['templateId'],
    continueUntilCompletion: true,
})
```

### Raw Data Access

Access raw contract responses without caching:

```typescript
const reader = new ACSReader(ledgerProvider)

// Standard raw access
const rawContracts = await reader.raw.read({
    templateIds: ['templateId'],
})

// Paginated raw access
const rawPage = await reader.paginated.raw.read({
    templateIds: ['templateId'],
    maxPageSize: 100,
})
```

### Continuous Fetching

Fetch all available data in a single call:

```typescript
const contracts = await reader.read({
    templateIds: ['templateId'],
    continueUntilCompletion: true,
    limit: 200, // Batch size for each query
})
```

## API Reference

### `ACSReader`

Main class for reading active contracts.

#### Constructor

```typescript
new ACSReader(
  ledger: AbstractLedgerProvider,
  cacheOptions?: ACSCacheCollectionOptions
)
```

## Configuration

### Cache Options (not applicable for pagination mode)

```typescript
interface ACSCacheCollectionOptions {
    // Compact history after this many events
    maxEventsBeforePrune?: number

    // Preserve events within this offset window
    safeOffsetDeltaForPrune?: number
}
```

- Set `maxEventsBeforePrune` to `0` for immediate compaction (efficient for monotonically increasing offsets)
- Set `safeOffsetDeltaForPrune` to `0` to compact everything outside the current window

## Best Practices

1. **Reuse Reader Instances**: Create one reader instance and reuse it to benefit from caching
2. **Filter Early**: Apply template and party filters to reduce data transfer and processing
3. **Use Pagination**: For large datasets, use paginated access to control memory usage
4. **Configure Cache**: Tune cache settings based on your query patterns
5. **Handle Offsets**: Let the reader resolve offsets automatically unless you need specific points in time
