/**
 * API key authentication middleware
 *
 * All endpoints (except /health) require a valid API key in the Authorization header.
 * Format: Authorization: Bearer <api-key>
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Create auth middleware with the given API key.
 *
 * Both keys are SHA-256 hashed before comparison. This eliminates
 * the length-leak timing side-channel (S-03r) while keeping
 * constant-time equality via timingSafeEqual on fixed 32-byte digests.
 */
export declare function createAuthMiddleware(apiKey: string): (req: Request, res: Response, next: NextFunction) => void;
