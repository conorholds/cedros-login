#!/usr/bin/env node
// Runs the actual web cache module without bundling; Node heap is not browser heap.
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { performance } from "node:perf_hooks";

const source = await readFile(
  new URL("../ui/src/utils/requestCache.ts", import.meta.url),
  "utf8",
);
const cache = await import(
  `data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString("base64")}`
);
const reads = 10_000;
const heap = () => {
  globalThis.gc?.();
  return process.memoryUsage().heapUsed;
};
const before = heap();
let loads = 0;
const started = performance.now();
for (let i = 0; i < reads; i++) {
  await cache.sharedRead(
    "fixture",
    `fixture\0${i}`,
    async () => {
      loads++;
      return {
        id: i,
        payload: Array.from({ length: 256 }, (_, n) => `${i}:${n}`).join("|"),
      };
    },
    { cacheTtlMs: 10_000 },
  );
}
const uniqueMs = performance.now() - started;
const retained = heap() - before;
const hitsStarted = performance.now();
for (let i = 0; i < reads; i++) {
  await cache.sharedRead("fixture", `fixture\0${reads - 1}`, async () => {
    throw new Error("warm cache missed");
  });
}
const hitsMs = performance.now() - hitsStarted;
cache.clearSharedReads();
console.log(
  JSON.stringify(
    {
      kind: "client-cache-kernel",
      runtime: process.version,
      gc_available: Boolean(globalThis.gc),
      reads,
      loads,
      settled_entry_budget: cache.MAX_SETTLED_READS,
      unique_ms: uniqueMs,
      warm_hits_ms: hitsMs,
      retained_heap_delta_bytes: retained,
      after_clear_heap_delta_bytes: heap() - before,
      note: "Node heap delta includes runtime/JIT overhead; use repeated fixed-hardware runs. This does not measure browser paint or Native device memory.",
    },
    null,
    2,
  ),
);
