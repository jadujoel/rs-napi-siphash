import { siphash, siphashWithKey, siphashFile } from "siphash-napi";
import { writeFileSync, unlinkSync } from "fs";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}${detail ? ": " + detail : ""}`);
    failed++;
  }
}

console.log("siphash-napi smoke tests\n");

// --- siphash(buffer) ---
console.log("siphash()");
const h1 = siphash(Buffer.from("hello"));
assert("returns a bigint", typeof h1 === "bigint");
assert("deterministic", siphash(Buffer.from("hello")) === h1);
assert("different input → different hash", siphash(Buffer.from("world")) !== h1);
assert("empty buffer works", typeof siphash(Buffer.alloc(0)) === "bigint");

// --- siphashWithKey(buffer, k0, k1) ---
console.log("\nsiphashWithKey()");
const h2 = siphashWithKey(Buffer.from("hello"), 1n, 2n);
assert("returns a bigint", typeof h2 === "bigint");
assert("different key → different hash", h2 !== h1);
assert(
  "deterministic with same key",
  siphashWithKey(Buffer.from("hello"), 1n, 2n) === h2,
);
assert(
  "different key → different result",
  siphashWithKey(Buffer.from("hello"), 3n, 4n) !== h2,
);

// --- siphashFile(path) ---
console.log("\nsiphashFile()");
const tmpFile = "smoke_test_tmp.txt";
writeFileSync(tmpFile, "hello");
const h3 = siphashFile(tmpFile);
assert("returns a bigint", typeof h3 === "bigint");
assert(
  "matches siphash(buffer) for same content",
  h3 === siphash(Buffer.from("hello")),
);
unlinkSync(tmpFile);

let threw = false;
try {
  siphashFile("nonexistent_file_that_does_not_exist.txt");
} catch {
  threw = true;
}
assert("throws on missing file", threw);

// --- summary ---
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
