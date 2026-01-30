import { Seed, ShamirShare } from './types';
/** Number of words in recovery phrase (12 = 128 bits, standard Solana format) */
export declare const MNEMONIC_WORD_COUNT = 12;
/**
 * Encode a Shamir share as a BIP-39 mnemonic phrase
 *
 * @param share - 16-byte share to encode
 * @returns Array of 12 mnemonic words
 */
export declare function shareToMnemonic(share: ShamirShare): string[];
/**
 * Decode a BIP-39 mnemonic phrase back to a Shamir share
 *
 * @param words - Array of 12 mnemonic words
 * @returns 16-byte share
 * @throws Error if mnemonic is invalid
 */
export declare function mnemonicToShare(words: string[]): ShamirShare;
/**
 * Encode a 16-byte seed as a BIP-39 mnemonic phrase
 *
 * This is used for the recovery phrase which encodes the FULL SEED
 * (not a Shamir share) to allow complete wallet recovery.
 *
 * @param seed - 16-byte seed to encode
 * @returns Array of 12 mnemonic words
 */
export declare function seedToMnemonic(seed: Seed): string[];
/**
 * Decode a BIP-39 mnemonic phrase back to a seed
 *
 * This is used during recovery to restore the full wallet seed.
 *
 * @param words - Array of 12 mnemonic words
 * @returns 16-byte seed
 * @throws Error if mnemonic is invalid
 */
export declare function mnemonicToSeed(words: string[]): Seed;
/**
 * Validate a mnemonic phrase without decoding
 *
 * @param words - Array of words to validate
 * @returns true if valid BIP-39 mnemonic
 */
export declare function isValidMnemonic(words: string[]): boolean;
/**
 * Check if a single word is in the BIP-39 wordlist
 *
 * @param word - Word to check
 * @returns true if word is in the wordlist
 */
export declare function isValidWord(word: string): boolean;
/**
 * Get word suggestions for autocomplete
 *
 * @param prefix - Partial word input
 * @param limit - Maximum number of suggestions
 * @returns Array of matching words from wordlist
 */
export declare function getWordSuggestions(prefix: string, limit?: number): string[];
/**
 * Generate a random mnemonic for testing purposes
 *
 * WARNING: Do not use this for actual wallet generation.
 * Use the proper enrollment flow which generates a seed and splits it.
 *
 * @returns Array of 12 random words
 */
export declare function generateRandomMnemonic(): string[];
/**
 * Format mnemonic words for display (groups of 4)
 *
 * @param words - Array of mnemonic words
 * @returns Array of word groups
 */
export declare function formatMnemonicForDisplay(words: string[]): string[][];
/**
 * Parse user input into word array, handling various formats
 *
 * @param input - User input (space/comma/newline separated)
 * @returns Array of normalized words
 */
export declare function parseMnemonicInput(input: string): string[];
/**
 * Securely wipe mnemonic array
 *
 * @security CRYPTO-2: This is BEST-EFFORT only. JavaScript strings are immutable
 * and the original word values WILL persist in memory until garbage collected.
 * See secureWipe.ts wipeString() for details on JS string wiping limitations.
 *
 * @param words - Array of words to wipe
 */
export declare function wipeMnemonic(words: string[]): void;
/**
 * Get the BIP-39 wordlist for UI purposes (e.g., validation indicators)
 *
 * @returns Copy of the wordlist
 */
export declare function getWordlist(): readonly string[];
/**
 * Calculate the index of a word in the wordlist
 *
 * @param word - Word to look up
 * @returns Index (0-2047) or -1 if not found
 */
export declare function getWordIndex(word: string): number;
