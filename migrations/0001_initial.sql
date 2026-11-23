CREATE TABLE IF NOT EXISTS readers (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  profile TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  reader_id TEXT NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS entries (
  reader_id TEXT NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (reader_id, id)
);

CREATE TABLE IF NOT EXISTS auth_attempts (
  id TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS auth_attempt_expiry ON auth_attempts(expires_at);
