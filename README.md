# siphash-napi

Fast [SipHash-2-4](https://131002.net/siphash/) for Node.js and Bun, backed by a native Rust extension via [napi-rs](https://napi.rs/).

## Installation

```sh
# npm
npm install siphash-napi

# bun
bun add siphash-napi
```

Pre-built native binaries are bundled for the following targets:

| Platform | Architecture |
|---|---|
| macOS | x64, arm64 |
| Linux (glibc) | x64, arm64 |
| Linux (musl) | x64, arm64 |
| Windows | x64, arm64 |

## API

```ts
// Hash a Buffer with the default key (0, 0)
function siphash(data: Buffer): bigint

// Hash a Buffer with a custom 128-bit key supplied as two 64-bit BigInt halves
function siphashWithKey(data: Buffer, key0: bigint, key1: bigint): bigint

// Hash a file by path, reading in 8 KiB chunks (no full file load into memory)
function siphashFile(path: string): bigint
```

All functions return a `bigint` representing the unsigned 64-bit hash value.

## Usage

### Node.js (CommonJS)

```js
const { siphash, siphashWithKey, siphashFile } = require('siphash-napi')

const hash = siphash(Buffer.from('hello'))
console.log(hash) // 7659893686435503compute (bigint)

// Custom key
const keyed = siphashWithKey(Buffer.from('hello'), 1n, 2n)

// Hash a file
const fileHash = siphashFile('/path/to/file.bin')
```

### Node.js (ESM)

```js
import { siphash, siphashWithKey, siphashFile } from 'siphash-napi'

const hash = siphash(Buffer.from('hello'))

const keyed = siphashWithKey(Buffer.from('hello'), 1n, 2n)

const fileHash = siphashFile('/path/to/file.bin')
```

### TypeScript

```ts
import { siphash, siphashWithKey, siphashFile } from 'siphash-napi'

const hash: bigint = siphash(Buffer.from('hello'))

const keyed: bigint = siphashWithKey(Buffer.from('hello'), 1n, 2n)

const fileHash: bigint = siphashFile('/path/to/file.bin')
```

### Bun

```ts
import { siphash, siphashWithKey, siphashFile } from 'siphash-napi'

const hash = siphash(Buffer.from('hello'))

// Use as a map/cache key
const cache = new Map<bigint, string>()
cache.set(siphash(Buffer.from('key')), 'value')
```

## Notes

- **Default key**: `siphash()` uses the zero key `(0, 0)`. This is suitable for non-cryptographic use cases such as hash tables and content deduplication. Do not rely on SipHash for cryptographic security.
- **Custom key**: Use `siphashWithKey(data, key0, key1)` when you need a secret or per-instance key to prevent hash-flooding attacks.
- **File hashing**: `siphashFile()` streams the file in 8 KiB chunks, so arbitrarily large files can be hashed without loading them fully into memory.
- **Return type**: All functions return a `bigint`. Use `.toString()` or `.toString(16)` if you need a string representation.

## Building from source

Requires Rust and the [napi-rs CLI](https://napi.rs/docs/introduction/getting-started).

```sh
npm install
npm run build
```

For a debug build:

```sh
npm run build:debug
```
