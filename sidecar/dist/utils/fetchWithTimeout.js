"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithTimeout = fetchWithTimeout;
async function fetchWithTimeout(fetchFn, input, init, timeoutMs) {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeout = setTimeout(() => {
        controller.abort();
    }, timeoutMs);
    try {
        const mergedInit = { ...init, signal };
        return await fetchFn(input, mergedInit);
    }
    finally {
        clearTimeout(timeout);
    }
}
