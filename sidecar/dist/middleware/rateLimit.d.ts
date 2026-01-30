import type { NextFunction, Request, Response } from 'express';
export interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
}
export declare function createRateLimitMiddleware({ windowMs, maxRequests }: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => void;
