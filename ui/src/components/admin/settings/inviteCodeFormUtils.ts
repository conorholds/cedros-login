import type { CreateInviteCodeRequest, InviteCode, UpdateInviteCodeRequest } from '../../../types';

export function buildCreateInviteCodeRequest(
  code: string,
  maxUses: string,
  startsAt: string,
  expiresAt: string,
  discountPercent: string,
  discountMonths: string = ''
): CreateInviteCodeRequest {
  const request = {
    code: code.trim() || undefined,
    maxUses: parseMaxUses(maxUses),
    startsAt: toIso(startsAt),
    expiresAt: toIso(expiresAt),
    discountPercent: parseDiscountPercent(discountPercent),
    discountMonths: parseDiscountMonths(discountMonths, discountPercent),
  };
  validateDateWindow(request.startsAt, request.expiresAt);
  return request;
}

export function buildUpdateInviteCodeRequest(
  inviteCode: InviteCode,
  code: string,
  maxUses: string,
  startsAt: string,
  expiresAt: string,
  active: boolean,
  discountPercent: string,
  discountMonths: string = formatMaxUses(inviteCode.discountMonths)
): UpdateInviteCodeRequest {
  const trimmedCode = code.trim();
  if (!trimmedCode) throw new Error('Invite code is required.');

  const request: UpdateInviteCodeRequest = {};
  if (trimmedCode !== inviteCode.code) request.code = trimmedCode;

  const parsedMaxUses = parseMaxUses(maxUses);
  if (parsedMaxUses !== (inviteCode.maxUses ?? null)) request.maxUses = parsedMaxUses;

  assignDateUpdate(request, 'startsAt', startsAt, inviteCode.startsAt);
  assignDateUpdate(request, 'expiresAt', expiresAt, inviteCode.expiresAt);
  validateDateWindow(
    request.startsAt === undefined ? inviteCode.startsAt : request.startsAt,
    request.expiresAt === undefined ? inviteCode.expiresAt : request.expiresAt
  );
  if (active !== inviteCode.active) request.active = active;

  const parsedDiscount = parseDiscountPercent(discountPercent);
  if (parsedDiscount !== (inviteCode.discountPercent ?? null)) {
    request.discountPercent = parsedDiscount;
  }

  const months = parseDiscountMonths(discountMonths, discountPercent);
  if (months !== (inviteCode.discountMonths ?? null)) request.discountMonths = months;
  return request;
}

export function toDateTimeInput(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(
    date.getHours()
  )}:${pad2(date.getMinutes())}`;
}

export function formatMaxUses(value?: number | null): string {
  return value == null ? '' : String(value);
}

export function formatDiscountPercent(value?: number | null): string {
  return value == null ? '' : String(value);
}

function assignDateUpdate(
  request: UpdateInviteCodeRequest,
  key: 'startsAt' | 'expiresAt',
  value: string,
  current?: string | null
) {
  if (value !== toDateTimeInput(current)) request[key] = toIso(value);
}

function validateDateWindow(startsAt?: string | null, expiresAt?: string | null) {
  if (startsAt && expiresAt && expiresAt <= startsAt) {
    throw new Error('Expires at must be after starts at.');
  }
}

function parseMaxUses(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Max uses must be greater than 0.');
  }
  return parsed;
}

function parseDiscountMonths(value: string, percent: string): number | null {
  if (!percent.trim() || !value.trim()) return null;
  const months = Number(value);
  if (!Number.isInteger(months) || months < 1 || months > 2147483647) {
    throw new Error('Discount duration must be a positive whole number of months.');
  }
  return months;
}

function parseDiscountPercent(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new Error('Discount must be between 1 and 100 percent.');
  }
  return parsed;
}

function toIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Use valid start and expiration dates.');
  }
  return date.toISOString();
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}
