"use strict";
/**
 * SC-18: Shared path constants for middleware to avoid duplication.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEALTH_PATH = void 0;
/** Health check path — exempt from auth and rate limiting. */
exports.HEALTH_PATH = '/health';
