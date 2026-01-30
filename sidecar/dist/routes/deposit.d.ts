/**
 * Deposit endpoints for Privacy Cash deposits (SSS embedded wallets only)
 *
 * POST /deposit - Execute a deposit to the user's Privacy Cash account
 * POST /deposit/swap-and-deposit - Swap SPL token to SOL and deposit (gasless)
 *
 * Architecture:
 * - User's keypair is reconstructed server-side from SSS shares
 * - Deposit goes to user's Privacy Cash account (user's pubkey)
 * - Server stores Share B during privacy period for later withdrawal
 */
import { Router } from 'express';
import { PrivacyCashService } from '../services/privacy-cash.js';
import { JupiterService } from '../services/jupiter.js';
export declare function createDepositRoutes(privacyCash: PrivacyCashService, jupiter: JupiterService): Router;
