/**
 * BIP-39 mnemonic encoding/decoding using @scure/bip39
 *
 * Used to encode Share C as a human-readable recovery phrase.
 *
 * Security:
 * - Uses the official BIP-39 English wordlist
 * - 12 words = 128 bits of entropy (16 bytes)
 * - Matches standard Solana wallet format (Phantom, Solflare, etc.)
 * - Includes checksum for error detection
 */

import {
  generateMnemonic,
  mnemonicToEntropy,
  entropyToMnemonic,
  validateMnemonic,
} from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import type { Seed, ShamirShare } from './types';
import { toSeed, toShamirShare } from './types';

/** Number of words in recovery phrase (12 = 128 bits, standard Solana format) */
export const MNEMONIC_WORD_COUNT = 12;

/**
 * Encode a Shamir share as a BIP-39 mnemonic phrase
 *
 * @param share - 16-byte share to encode
 * @returns Array of 12 mnemonic words
 */
export function shareToMnemonic(share: ShamirShare): string[] {
  if (share.length !== 16) {
    throw new Error(`Invalid share length: expected 16, got ${share.length}`);
  }

  // entropyToMnemonic expects Uint8Array
  const mnemonic = entropyToMnemonic(share, wordlist);
  const words = mnemonic.split(' ');

  if (words.length !== MNEMONIC_WORD_COUNT) {
    throw new Error(`Unexpected word count: expected ${MNEMONIC_WORD_COUNT}, got ${words.length}`);
  }

  return words;
}

/**
 * Decode a BIP-39 mnemonic phrase back to a Shamir share
 *
 * @param words - Array of 12 mnemonic words
 * @returns 16-byte share
 * @throws Error if mnemonic is invalid
 */
export function mnemonicToShare(words: string[]): ShamirShare {
  if (words.length !== MNEMONIC_WORD_COUNT) {
    throw new Error(`Invalid word count: expected ${MNEMONIC_WORD_COUNT}, got ${words.length}`);
  }

  const mnemonic = words.join(' ').toLowerCase().trim();

  // Validate mnemonic checksum
  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error('Invalid recovery phrase: checksum mismatch');
  }

  // Convert back to entropy (our share)
  const entropy = mnemonicToEntropy(mnemonic, wordlist);

  if (entropy.length !== 16) {
    throw new Error(`Invalid entropy length: expected 16, got ${entropy.length}`);
  }

  return toShamirShare(entropy);
}

/**
 * Encode a 16-byte seed as a BIP-39 mnemonic phrase
 *
 * This is used for the recovery phrase which encodes the FULL SEED
 * (not a Shamir share) to allow complete wallet recovery.
 *
 * @param seed - 16-byte seed to encode
 * @returns Array of 12 mnemonic words
 */
export function seedToMnemonic(seed: Seed): string[] {
  if (seed.length !== 16) {
    throw new Error(`Invalid seed length: expected 16, got ${seed.length}`);
  }

  const mnemonic = entropyToMnemonic(seed, wordlist);
  const words = mnemonic.split(' ');

  if (words.length !== MNEMONIC_WORD_COUNT) {
    throw new Error(`Unexpected word count: expected ${MNEMONIC_WORD_COUNT}, got ${words.length}`);
  }

  return words;
}

/**
 * Decode a BIP-39 mnemonic phrase back to a seed
 *
 * This is used during recovery to restore the full wallet seed.
 *
 * @param words - Array of 12 mnemonic words
 * @returns 16-byte seed
 * @throws Error if mnemonic is invalid
 */
export function mnemonicToSeed(words: string[]): Seed {
  if (words.length !== MNEMONIC_WORD_COUNT) {
    throw new Error(`Invalid word count: expected ${MNEMONIC_WORD_COUNT}, got ${words.length}`);
  }

  const mnemonic = words.join(' ').toLowerCase().trim();

  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error('Invalid recovery phrase: checksum mismatch');
  }

  const entropy = mnemonicToEntropy(mnemonic, wordlist);

  if (entropy.length !== 16) {
    throw new Error(`Invalid entropy length: expected 16, got ${entropy.length}`);
  }

  return toSeed(entropy);
}

/**
 * Validate a mnemonic phrase without decoding
 *
 * @param words - Array of words to validate
 * @returns true if valid BIP-39 mnemonic
 */
export function isValidMnemonic(words: string[]): boolean {
  if (words.length !== MNEMONIC_WORD_COUNT) {
    return false;
  }

  const mnemonic = words.join(' ').toLowerCase().trim();
  return validateMnemonic(mnemonic, wordlist);
}

/**
 * Check if a single word is in the BIP-39 wordlist
 *
 * @param word - Word to check
 * @returns true if word is in the wordlist
 */
export function isValidWord(word: string): boolean {
  return wordlist.includes(word.toLowerCase().trim());
}

/**
 * Get word suggestions for autocomplete
 *
 * @param prefix - Partial word input
 * @param limit - Maximum number of suggestions
 * @returns Array of matching words from wordlist
 */
export function getWordSuggestions(prefix: string, limit: number = 5): string[] {
  const normalizedPrefix = prefix.toLowerCase().trim();

  if (normalizedPrefix.length === 0) {
    return [];
  }

  return wordlist.filter((word) => word.startsWith(normalizedPrefix)).slice(0, limit);
}

/**
 * Generate a random mnemonic for testing purposes
 *
 * WARNING: Do not use this for actual wallet generation.
 * Use the proper enrollment flow which generates a seed and splits it.
 *
 * @returns Array of 12 random words
 */
export function generateRandomMnemonic(): string[] {
  const mnemonic = generateMnemonic(wordlist, 128);
  return mnemonic.split(' ');
}

/**
 * Format mnemonic words for display (groups of 4)
 *
 * @param words - Array of mnemonic words
 * @returns Array of word groups
 */
export function formatMnemonicForDisplay(words: string[]): string[][] {
  const groups: string[][] = [];
  for (let i = 0; i < words.length; i += 4) {
    groups.push(words.slice(i, i + 4));
  }
  return groups;
}

/**
 * Parse user input into word array, handling various formats
 *
 * @param input - User input (space/comma/newline separated)
 * @returns Array of normalized words
 */
export function parseMnemonicInput(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[,\n\r\t]+/g, ' ') // Replace separators with space
    .split(/\s+/) // Split on whitespace
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

/**
 * Securely wipe mnemonic array
 *
 * @security CRYPTO-2: This is BEST-EFFORT only. JavaScript strings are immutable
 * and the original word values WILL persist in memory until garbage collected.
 * See secureWipe.ts wipeString() for details on JS string wiping limitations.
 *
 * @param words - Array of words to wipe
 */
export function wipeMnemonic(words: string[]): void {
  // Replace all words with empty strings (best-effort - see CRYPTO-2)
  for (let i = 0; i < words.length; i++) {
    words[i] = '';
  }
  words.length = 0;
}

/**
 * Get the BIP-39 wordlist for UI purposes (e.g., validation indicators)
 *
 * @returns Copy of the wordlist
 */
export function getWordlist(): readonly string[] {
  return wordlist;
}

/**
 * Calculate the index of a word in the wordlist
 *
 * @param word - Word to look up
 * @returns Index (0-2047) or -1 if not found
 */
export function getWordIndex(word: string): number {
  return wordlist.indexOf(word.toLowerCase().trim());
}
