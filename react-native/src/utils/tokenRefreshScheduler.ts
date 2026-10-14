const REFRESH_BUFFER_MS = 60_000;

/** Own refresh timing and in-flight deduplication for one token manager. */
export class TokenRefreshScheduler {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private callback: (() => Promise<void>) | null = null;
  private inFlight: Promise<void> | null = null;
  private destroyed = false;

  setCallback(callback: () => Promise<void>): void {
    this.callback = callback;
  }

  refresh(): Promise<void> {
    if (this.destroyed || !this.callback) {
      return Promise.reject(new Error("Token refresh is unavailable"));
    }
    if (this.inFlight) return this.inFlight;
    const refresh = Promise.resolve().then(this.callback);
    this.inFlight = refresh;
    refresh.then(
      () => this.clearInFlight(refresh),
      () => this.clearInFlight(refresh),
    );
    return refresh;
  }

  schedule(expiresAt: number, active: boolean, onFailure: () => void): void {
    this.clearTimer();
    if (!active || !this.callback || this.destroyed) return;
    const delay = expiresAt - REFRESH_BUFFER_MS - Date.now();
    if (delay <= 0) this.run(onFailure);
    else {
      this.timer = setTimeout(() => this.run(onFailure), delay);
    }
  }

  clearTimer(): void {
    if (!this.timer) return;
    clearTimeout(this.timer);
    this.timer = null;
  }

  destroy(): void {
    this.destroyed = true;
    this.clearTimer();
    this.callback = null;
    this.inFlight = null;
  }

  private run(onFailure: () => void): void {
    if (this.destroyed) return;
    void this.refresh().catch(onFailure);
  }

  private clearInFlight(refresh: Promise<void>): void {
    if (this.inFlight === refresh) this.inFlight = null;
  }
}
