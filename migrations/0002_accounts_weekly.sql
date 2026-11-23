ALTER TABLE readers ADD COLUMN role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'admin'));

CREATE TABLE weekly_push (
  endpoint TEXT PRIMARY KEY,
  session_hash TEXT NOT NULL UNIQUE,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  sent_on TEXT NOT NULL DEFAULT ''
);

CREATE INDEX weekly_push_due ON weekly_push(weekday, sent_on);
