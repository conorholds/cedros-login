import type {
  DepositResponse,
  DepositStatusResponse,
  DepositConfigResponse,
  DepositListResponse,
  DepositQuoteResponse,
  PublicDepositRequest,
  MicroDepositRequest,
  TieredDepositResponse,
  CreditBalanceResponse,
  BalancesResponse,
  CreditHistoryResponse,
} from "../../types";
import type ApiClient from "./client";

export class DepositApi {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async deposit(amountLamports: number): Promise<DepositResponse> {
    const response = await this.client.post<DepositResponse>(
      "/auth/deposit",
      { amount_lamports: amountLamports },
    );
    return response.data;
  }

  async getStatus(sessionId: string): Promise<DepositStatusResponse> {
    const response = await this.client.get<DepositStatusResponse>(
      `/auth/deposit/status/${encodeURIComponent(sessionId)}`,
    );
    return response.data;
  }

  async getConfig(): Promise<DepositConfigResponse> {
    const response =
      await this.client.get<DepositConfigResponse>("/auth/deposit/config");
    return response.data;
  }

  async listDeposits(options?: {
    limit?: number;
    offset?: number;
  }): Promise<DepositListResponse> {
    const params: Record<string, string> = {};
    if (options?.limit !== undefined) params.limit = String(options.limit);
    if (options?.offset !== undefined) params.offset = String(options.offset);
    const response = await this.client.get<DepositListResponse>(
      "/auth/deposits",
      Object.keys(params).length > 0 ? params : undefined,
    );
    return response.data;
  }

  async getQuote(params: {
    inputMint: string;
    amount: number;
    taker: string;
  }): Promise<DepositQuoteResponse> {
    const response = await this.client.get<DepositQuoteResponse>(
      "/auth/deposit/quote",
      {
        input_mint: params.inputMint,
        amount: String(params.amount),
        taker: params.taker,
      },
    );
    return response.data;
  }

  async publicDeposit(
    request: PublicDepositRequest,
  ): Promise<TieredDepositResponse> {
    const response = await this.client.post<TieredDepositResponse>(
      "/auth/deposit/public",
      request,
    );
    return response.data;
  }

  async microDeposit(
    request: MicroDepositRequest,
  ): Promise<TieredDepositResponse> {
    const response = await this.client.post<TieredDepositResponse>(
      "/auth/deposit/micro",
      request,
    );
    return response.data;
  }

  async getBalance(): Promise<CreditBalanceResponse> {
    const response = await this.client.get<CreditBalanceResponse>(
      "/auth/credits/balance/sol",
    );
    return response.data;
  }

  async getAllBalances(): Promise<CreditBalanceResponse[]> {
    const response =
      await this.client.get<BalancesResponse>("/auth/credits/balance");
    return response.data.balances;
  }

  async getHistory(options?: {
    currency?: string;
    limit?: number;
    offset?: number;
  }): Promise<CreditHistoryResponse> {
    const params: Record<string, string> = {};
    if (options?.currency) params.currency = options.currency;
    if (options?.limit) params.limit = String(options.limit);
    if (options?.offset) params.offset = String(options.offset);
    const response = await this.client.get<CreditHistoryResponse>(
      "/auth/credits/history",
      Object.keys(params).length > 0 ? params : undefined,
    );
    return response.data;
  }
}

export default DepositApi;
