/**
 * User withdrawal transfer endpoints
 *
 * POST /transfer/sol      - Transfer SOL from user wallet to external address
 * POST /transfer/spl      - Transfer SPL tokens from user wallet to external address
 * POST /transfer/balances - Get all token balances for a wallet address
 *
 * These routes are called by the Rust backend after authenticating the user
 * and reconstructing their private key from Shamir shares.
 */
import { Router } from 'express';
import { SolanaService } from '../services/solana.js';
export declare function isUnsignedIntegerString(value: string): boolean;
export declare function createTransferRoutes(solanaService: SolanaService): Router;
