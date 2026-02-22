/**
 * Batch swap route for micro deposit batching
 *
 * POST /batch/swap - Swap SOL to output currency via Jupiter
 *
 * Used by the micro batch worker to convert accumulated SOL deposits
 * into the company's preferred currency (USDC/USDT).
 */
import { Router } from 'express';
import { JupiterService } from '../services/jupiter.js';
export declare function createBatchRouter(jupiterService: JupiterService): Router;
