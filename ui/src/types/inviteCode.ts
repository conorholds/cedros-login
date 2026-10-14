/** Invite code returned by account/admin invite-code APIs. */
export interface InviteCode {
  id: string;
  code: string;
  maxUses?: number | null;
  usesCount: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  active: boolean;
  ownerUserId?: string | null;
  /** Subscription discount granted on redemption (1-100; 100 = free). */
  discountPercent?: number | null;
  /** Fixed discount term in months; null or absent means lifetime. */
  discountMonths?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListInviteCodesResponse {
  codes: InviteCode[];
}

export interface CreateInviteCodeRequest {
  code?: string;
  maxUses?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  discountPercent?: number | null;
  /** Fixed discount term in months; null or absent means lifetime. */
  discountMonths?: number | null;
}

export interface UpdateInviteCodeRequest {
  code?: string;
  maxUses?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  active?: boolean;
  discountPercent?: number | null;
  /** Fixed discount term in months; null or absent means lifetime. */
  discountMonths?: number | null;
}

/** Discount granted by a redeemed invite code (redeem response + account lookup). */
export interface InviteDiscount {
  /** Percent off the subscription price (1-100; 100 = free). */
  percentOff: number;
  /** Months from subscription start; null or absent means lifetime. */
  durationMonths?: number | null;
  /** The invite code that granted the discount. */
  code: string;
}
