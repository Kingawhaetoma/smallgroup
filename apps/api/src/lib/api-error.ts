/**
 * Unwrap Drizzle/postgres errors so the API returns the underlying cause.
 * Drizzle wraps DB errors in DrizzleQueryError with message "Failed query: ...";
 * the real error (e.g. prepared statement, connection) is in .cause.
 */
export function getApiErrorMessage(e: unknown): string {
  const err = e instanceof Error ? e : new Error(String(e));
  const cause = (err as Error & { cause?: Error & { code?: string; name?: string } }).cause;

  // Supabase pooler auth failures are easy to misread as auth-provider issues.
  // Return an actionable message so setup problems are obvious from the UI.
  if (
    cause instanceof Error &&
    cause.name === "PostgresError" &&
    cause.message === "Tenant or user not found"
  ) {
    return "Database connection failed: Supabase pooler rejected DATABASE_URL (tenant/user not found). Verify project ref, DB password, and pooler host.";
  }

  if (cause instanceof Error && cause.message) {
    return cause.message;
  }

  return err.message;
}
