/**
 * API key authentication middleware
 *
 * All endpoints (except /health) require a valid API key in the Authorization header.
 * Format: Authorization: Bearer <api-key>
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Create auth middleware with the given API key
 */
export declare function createAuthMiddleware(apiKey: string): (req: Request, res: Response, next: NextFunction) => void;
