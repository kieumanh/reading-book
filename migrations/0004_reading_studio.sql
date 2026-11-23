CREATE TABLE IF NOT EXISTS study_notes (
  reader_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  chapter INTEGER NOT NULL CHECK (chapter BETWEEN 1 AND 9999),
  part TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (reader_id, book_id, chapter),
  FOREIGN KEY (reader_id, book_id) REFERENCES entries(reader_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_days (
  reader_id TEXT NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  chapters INTEGER NOT NULL CHECK (chapters >= 0),
  books INTEGER NOT NULL CHECK (books >= 0),
  PRIMARY KEY (reader_id, day)
);

CREATE TRIGGER IF NOT EXISTS study_day_credit_insert AFTER INSERT ON reading_credit
WHEN NEW.chapters > 0 OR NEW.completed > 0
BEGIN
  INSERT INTO study_days (reader_id, day, chapters, books)
  VALUES (NEW.reader_id, date('now','+7 hours'), NEW.chapters, NEW.completed)
  ON CONFLICT(reader_id, day) DO UPDATE SET
    chapters = chapters + excluded.chapters, books = books + excluded.books;
END;

CREATE TRIGGER IF NOT EXISTS study_day_credit_update AFTER UPDATE OF chapters, completed ON reading_credit
WHEN NEW.chapters > OLD.chapters OR NEW.completed > OLD.completed
BEGIN
  INSERT INTO study_days (reader_id, day, chapters, books)
  VALUES (NEW.reader_id, date('now','+7 hours'), NEW.chapters - OLD.chapters, NEW.completed - OLD.completed)
  ON CONFLICT(reader_id, day) DO UPDATE SET
    chapters = chapters + excluded.chapters, books = books + excluded.books;
END;
