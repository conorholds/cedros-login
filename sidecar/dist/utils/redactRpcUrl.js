"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactRpcUrl = redactRpcUrl;
function redactRpcUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.host;
    }
    catch {
        return '<invalid-url>';
    }
}
