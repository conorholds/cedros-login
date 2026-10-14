export function createAutosaveProblem(status: number, message: string) {
  return {
    isApiError: true,
    status,
    data: { message },
    retryable: status >= 500 || status === 429,
  };
}
