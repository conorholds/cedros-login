/**
 * Health check endpoint
 *
 * GET /health - Returns service health status
 */
import { Router } from 'express';
import { SolanaService } from '../services/solana.js';
import { PrivacyCashService } from '../services/privacy-cash.js';
export declare function createHealthRoutes(solana: SolanaService, privacyCash: PrivacyCashService): Router;
