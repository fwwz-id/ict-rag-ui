export class AppError extends Error {
  constructor(
    message: string,
    public code: number,
    public details: unknown[],
  ) {
    super(message);
  }
}
