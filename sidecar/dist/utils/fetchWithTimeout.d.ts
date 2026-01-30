export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;
export declare function fetchWithTimeout(fetchFn: FetchLike, input: string, init: RequestInit | undefined, timeoutMs: number): Promise<Response>;
