interface SqlError {
  code?: string;
  errno?: number;
  sql?: string;
  sqlState?: string;
  sqlMessage?: string;
}

export function isSqlError(err: unknown): err is SqlError {
  if (typeof err !== 'object' || err === null) {
    return false;
  }

  if (!('sql' in err)) {
    return false;
  }

  if (!err.sql || typeof err.sql !== 'string') {
    return false;
  }

  return true;
}
