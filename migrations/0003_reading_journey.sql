CREATE TABLE IF NOT EXISTS reading_credit (
  reader_id TEXT NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  entry_id TEXT NOT NULL,
  chapters INTEGER NOT NULL CHECK (chapters >= 0),
  completed INTEGER NOT NULL CHECK (completed IN (0, 1)),
  PRIMARY KEY (reader_id, entry_id)
);

CREATE TABLE IF NOT EXISTS reading_awards_seen (
  reader_id TEXT PRIMARY KEY REFERENCES readers(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 111)
);

INSERT INTO reading_credit (reader_id, entry_id, chapters, completed)
SELECT reader_id, id, json_extract(payload, '$.done'),
       CAST(json_extract(payload, '$.done') >= json_extract(payload, '$.total') AS INTEGER)
FROM entries
WHERE json_extract(payload, '$.type') = 'book' AND json_extract(payload, '$.done') > 0
ON CONFLICT (reader_id, entry_id) DO UPDATE SET
  chapters = max(chapters, excluded.chapters),
  completed = max(completed, excluded.completed);

-- The highest positive power of two representable as a SQLite INTEGER is 2^62.
WITH RECURSIVE levels(level, xp) AS (
  VALUES (1, 1)
  UNION ALL SELECT level + 1, xp * 2 FROM levels WHERE level < 63
),
totals AS (
  SELECT reader_id, sum(chapters) + sum(completed) AS xp
  FROM reading_credit GROUP BY reader_id
)
INSERT OR IGNORE INTO reading_awards_seen (reader_id, level)
SELECT reader_id, (SELECT max(level) FROM levels WHERE levels.xp <= totals.xp)
FROM totals WHERE xp > 0;

CREATE TRIGGER IF NOT EXISTS reading_credit_insert AFTER INSERT ON entries
WHEN json_extract(NEW.payload, '$.type') = 'book' AND json_extract(NEW.payload, '$.done') > 0
BEGIN
  INSERT INTO reading_credit (reader_id, entry_id, chapters, completed)
  VALUES (NEW.reader_id, NEW.id, json_extract(NEW.payload, '$.done'),
          CAST(json_extract(NEW.payload, '$.done') >= json_extract(NEW.payload, '$.total') AS INTEGER))
  ON CONFLICT (reader_id, entry_id) DO UPDATE SET
    chapters = max(chapters, excluded.chapters),
    completed = max(completed, excluded.completed);
END;

CREATE TRIGGER IF NOT EXISTS reading_credit_update AFTER UPDATE OF payload ON entries
WHEN json_extract(NEW.payload, '$.type') = 'book' AND json_extract(NEW.payload, '$.done') > 0
BEGIN
  INSERT INTO reading_credit (reader_id, entry_id, chapters, completed)
  VALUES (NEW.reader_id, NEW.id, json_extract(NEW.payload, '$.done'),
          CAST(json_extract(NEW.payload, '$.done') >= json_extract(NEW.payload, '$.total') AS INTEGER))
  ON CONFLICT (reader_id, entry_id) DO UPDATE SET
    chapters = max(chapters, excluded.chapters),
    completed = max(completed, excluded.completed);
END;
