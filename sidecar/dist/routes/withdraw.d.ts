/**
 * Withdrawal endpoints for withdrawing from user's Privacy Cash to company wallet
 *
 * POST /withdraw - Withdraw from a user's Privacy Cash account to company wallet
 * POST /withdraw/balance - Get a user's private balance in Privacy Cash
 *
 * Architecture:
 * - Withdrawal requires user's keypair (reconstructed from stored shares)
 * - Funds go from user's Privacy Cash account to company wallet
 * - This is the second half of the privacy flow (deposit → wait → withdraw)
 */
import { Router } from 'express';
import { PrivacyCashService } from '../services/privacy-cash.js';
export declare function normalizeWithdrawTargetCurrency(targetCurrency?: string): 'SOL';
export declare function createWithdrawRoutes(privacyCash: PrivacyCashService): Router;
