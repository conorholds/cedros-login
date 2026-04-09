import { A as n, h as s } from "./ErrorMessage-DObd7075.js";
class l {
  client;
  constructor(e, t, r, i) {
    this.client = new n({ baseUrl: e, timeoutMs: t, retryAttempts: r, getAccessToken: i });
  }
  /**
   * List all users in the system
   */
  async listUsers(e) {
    try {
      const t = new URLSearchParams();
      e?.limit && t.set("limit", String(e.limit)), e?.offset && t.set("offset", String(e.offset));
      const r = t.toString(), i = `/admin/users${r ? `?${r}` : ""}`;
      return await this.client.get(i);
    } catch (t) {
      throw s(t, "Failed to list users");
    }
  }
  /**
   * Get a specific user by ID
   */
  async getUser(e) {
    try {
      return await this.client.get(`/admin/users/${e}`);
    } catch (t) {
      throw s(t, "Failed to get user");
    }
  }
  /**
   * Set a user's system admin status
   */
  async setSystemAdmin(e, t) {
    try {
      await this.client.patch(`/admin/users/${e}/system-admin`, { isAdmin: t });
    } catch (r) {
      throw s(r, "Failed to update system admin status");
    }
  }
  /**
   * Update a user's profile
   */
  async updateUser(e, t) {
    try {
      return await this.client.patch(`/admin/users/${e}`, t);
    } catch (r) {
      throw s(r, "Failed to update user");
    }
  }
  /**
   * Delete a user
   */
  async deleteUser(e) {
    try {
      await this.client.delete(`/admin/users/${e}`);
    } catch (t) {
      throw s(t, "Failed to delete user");
    }
  }
  /**
   * Send a password reset email to a user
   */
  async forcePasswordReset(e) {
    try {
      await this.client.post(`/admin/users/${e}/force-password-reset`, {});
    } catch (t) {
      throw s(t, "Failed to send password reset email");
    }
  }
  /**
   * Adjust a user's credits
   */
  async adjustCredits(e, t) {
    try {
      await this.client.post(`/admin/users/${e}/credits`, t);
    } catch (r) {
      throw s(r, "Failed to adjust credits");
    }
  }
  /**
   * Get a user's deposit history
   */
  async getUserDeposits(e, t) {
    try {
      const r = new URLSearchParams();
      t?.limit && r.set("limit", String(t.limit)), t?.offset && r.set("offset", String(t.offset));
      const i = r.toString(), a = `/admin/users/${e}/deposits${i ? `?${i}` : ""}`;
      return await this.client.get(a);
    } catch (r) {
      throw s(r, "Failed to get user deposits");
    }
  }
  /**
   * Get a user's credit stats and transaction history
   */
  async getUserCredits(e, t) {
    try {
      const r = new URLSearchParams();
      t?.limit && r.set("limit", String(t.limit)), t?.offset && r.set("offset", String(t.offset));
      const i = r.toString(), a = `/admin/users/${e}/credits${i ? `?${i}` : ""}`;
      return await this.client.get(a);
    } catch (r) {
      throw s(r, "Failed to get user credits");
    }
  }
  /**
   * Get a user's withdrawal history
   */
  async getUserWithdrawalHistory(e, t) {
    try {
      const r = new URLSearchParams();
      t?.limit && r.set("limit", String(t.limit)), t?.offset && r.set("offset", String(t.offset));
      const i = r.toString(), a = `/admin/users/${e}/withdrawal-history${i ? `?${i}` : ""}`;
      return await this.client.get(a);
    } catch (r) {
      throw s(r, "Failed to get user withdrawal history");
    }
  }
  /**
   * Get a user's chat history (from cedros-pay)
   * Only available when cedros-pay is enabled.
   */
  async getUserChats(e, t) {
    try {
      const r = new URLSearchParams();
      t?.limit && r.set("limit", String(t.limit)), t?.offset && r.set("offset", String(t.offset));
      const i = r.toString(), a = `/admin/users/${e}/chats${i ? `?${i}` : ""}`;
      return await this.client.get(a);
    } catch (r) {
      throw s(r, "Failed to get user chat history");
    }
  }
  /**
   * Get the list of users directly referred by a given user
   */
  async getUserReferrals(e, t) {
    try {
      const r = new URLSearchParams();
      t?.limit && r.set("limit", String(t.limit)), t?.offset && r.set("offset", String(t.offset));
      const i = r.toString(), a = `/admin/users/${e}/referrals${i ? `?${i}` : ""}`;
      return await this.client.get(a);
    } catch (r) {
      throw s(r, "Failed to get user referrals");
    }
  }
  /**
   * Get a user's KYC status and session history
   */
  async getUserKyc(e) {
    try {
      return await this.client.get(`/admin/users/${e}/kyc`);
    } catch (t) {
      throw s(t, "Failed to get user KYC data");
    }
  }
  /**
   * Override a user's KYC status (system admin only)
   *
   * @param userId - target user ID
   * @param status - new status: "none" | "verified" | "failed"
   */
  async overrideUserKyc(e, t) {
    try {
      await this.client.post(`/admin/users/${e}/kyc/override`, { status: t });
    } catch (r) {
      throw s(r, "Failed to override KYC status");
    }
  }
  /**
   * Get a user's accreditation status and submission history
   */
  async getUserAccreditation(e) {
    try {
      return await this.client.get(
        `/admin/users/${e}/accreditation`
      );
    } catch (t) {
      throw s(t, "Failed to get user accreditation data");
    }
  }
  /**
   * Review an accreditation submission (approve or reject).
   *
   * @param submissionId - target submission ID
   * @param approved - true to approve, false to reject
   * @param reviewerNotes - optional internal notes
   * @param rejectionReason - required when approved is false
   * @param expiryDays - override default expiry (approve only)
   */
  async reviewAccreditation(e, t, r, i, a) {
    try {
      await this.client.post(`/admin/accreditation/${e}/review`, {
        approved: t,
        reviewerNotes: r,
        rejectionReason: i,
        expiryDays: a
      });
    } catch (c) {
      throw s(c, "Failed to review accreditation submission");
    }
  }
  /**
   * Override a user's accreditation status (system admin only).
   *
   * @param userId - target user ID
   * @param status - new status: "none" | "approved" | "rejected"
   */
  async overrideAccreditationStatus(e, t) {
    try {
      await this.client.post(`/admin/users/${e}/accreditation/override`, { status: t });
    } catch (r) {
      throw s(r, "Failed to override accreditation status");
    }
  }
  /**
   * Get user statistics by auth method
   */
  async getStats() {
    try {
      return await this.client.get("/admin/users/stats");
    } catch (e) {
      throw s(e, "Failed to get user stats");
    }
  }
  /**
   * List pending accreditation submissions (queue view).
   *
   * @param limit - page size (default 20)
   * @param offset - pagination offset
   */
  async listPendingAccreditations(e = 20, t = 0) {
    try {
      const r = new URLSearchParams();
      return r.set("limit", String(e)), r.set("offset", String(t)), await this.client.get(
        `/admin/accreditation/pending?${r.toString()}`
      );
    } catch (r) {
      throw s(r, "Failed to list pending accreditations");
    }
  }
  /**
   * Get full detail for a single accreditation submission.
   *
   * @param submissionId - submission UUID
   */
  async getAccreditationSubmission(e) {
    try {
      return await this.client.get(
        `/admin/accreditation/${e}`
      );
    } catch (t) {
      throw s(t, "Failed to get accreditation submission");
    }
  }
  /**
   * Get a presigned download URL for an accreditation document.
   *
   * @param docId - document UUID
   * @returns presigned URL string
   */
  async getAccreditationDocumentUrl(e) {
    try {
      return (await this.client.get(
        `/admin/accreditation/documents/${e}/url`
      )).url;
    } catch (t) {
      throw s(t, "Failed to get document URL");
    }
  }
  /**
   * Fetch sanctions screening stats.
   */
  async getSanctionsStats() {
    try {
      return await this.client.get("/admin/sanctions/stats");
    } catch (e) {
      throw s(e, "Failed to get sanctions stats");
    }
  }
  /**
   * Force-refresh the sanctions cache.
   */
  async refreshSanctions() {
    try {
      await this.client.post("/admin/sanctions/refresh", {});
    } catch (e) {
      throw s(e, "Failed to refresh sanctions cache");
    }
  }
  // ==========================================================================
  // Signup gating / access codes
  // ==========================================================================
  /**
   * Get signup stats for the current period.
   *
   * @returns count, limit, period, periodStart
   */
  async getSignupStats() {
    try {
      return await this.client.get("/admin/signup-stats");
    } catch (e) {
      throw s(e, "Failed to get signup stats");
    }
  }
  /**
   * List access codes with optional type filter.
   *
   * @param limit - page size (default 20)
   * @param offset - pagination offset (default 0)
   * @param codeType - filter by type: 'limited' | 'user_invite' etc.
   */
  async listAccessCodes(e = 20, t = 0, r) {
    try {
      const i = new URLSearchParams();
      return i.set("limit", String(e)), i.set("offset", String(t)), r && i.set("type", r), await this.client.get(
        `/admin/access-codes?${i.toString()}`
      );
    } catch (i) {
      throw s(i, "Failed to list access codes");
    }
  }
  /**
   * Create a new admin-managed access code.
   *
   * @param code - the code string
   * @param maxUses - max redemptions (null for unlimited)
   * @param expiresAt - optional ISO expiry timestamp
   */
  async createAccessCode(e, t, r) {
    try {
      return await this.client.post("/admin/access-codes", {
        code: e,
        maxUses: t,
        expiresAt: r
      });
    } catch (i) {
      throw s(i, "Failed to create access code");
    }
  }
  /**
   * Delete an access code by ID.
   *
   * @param id - access code UUID
   */
  async deleteAccessCode(e) {
    try {
      await this.client.delete(`/admin/access-codes/${e}`);
    } catch (t) {
      throw s(t, "Failed to delete access code");
    }
  }
}
export {
  l as A
};
