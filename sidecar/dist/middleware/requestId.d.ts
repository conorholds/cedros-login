/**
 * Request correlation ID middleware.
 *
 * Propagates incoming X-Request-ID header from the Rust server,
 * or generates a new one if absent. Sets it on the response
 * and makes it available via `req.headers['x-request-id']`.
 */
import { Request, Response, NextFunction } from 'express';
export declare function createRequestIdMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
