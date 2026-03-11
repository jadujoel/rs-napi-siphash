use napi::bindgen_prelude::*;
use napi_derive::napi;
use siphasher::sip::SipHasher;
use std::hash::Hasher;
use std::io::Read;

/// Compute SipHash-2-4 of a buffer using the default key (0, 0).
/// Returns the 64-bit hash as a BigInt.
#[napi]
pub fn siphash(data: Buffer) -> BigInt {
    let mut hasher = SipHasher::new();
    hasher.write(data.as_ref());
    let hash = hasher.finish();
    BigInt::from(hash)
}

/// Compute SipHash-2-4 of a buffer with a caller-supplied 128-bit key
/// provided as two 64-bit halves (BigInt). Returns the hash as a BigInt.
#[napi]
pub fn siphash_with_key(data: Buffer, key0: BigInt, key1: BigInt) -> Result<BigInt> {
    let (_, k0, _) = key0.get_u128();
    let (_, k1, _) = key1.get_u128();
    let mut hasher = SipHasher::new_with_keys(k0 as u64, k1 as u64);
    hasher.write(data.as_ref());
    let hash = hasher.finish();
    Ok(BigInt::from(hash))
}

/// Compute SipHash-2-4 of a file at the given path using the default key (0, 0).
/// Reads the file in 8 KiB chunks so large files don't need to fit in memory.
/// Returns the 64-bit hash as a BigInt.
#[napi]
pub fn siphash_file(path: String) -> Result<BigInt> {
    let mut file = std::fs::File::open(&path)
        .map_err(|e| Error::from_reason(format!("failed to open {path}: {e}")))?;
    let mut hasher = SipHasher::new();
    let mut buf = [0u8; 8192];
    loop {
        let n = file
            .read(&mut buf)
            .map_err(|e| Error::from_reason(format!("failed to read {path}: {e}")))?;
        if n == 0 {
            break;
        }
        hasher.write(&buf[..n]);
    }
    Ok(BigInt::from(hasher.finish()))
}
