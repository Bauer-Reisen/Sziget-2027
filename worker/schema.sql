-- Datenbank „sziget": Tabellen. Mehrfach ausführbar.
-- Die Namen der sechs stehen NICHT hier, sondern in personen.sql (privat, nicht im Repository).

CREATE TABLE IF NOT EXISTS couples (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS persons (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  couple_id TEXT NOT NULL REFERENCES couples(id),
  sort      INTEGER NOT NULL DEFAULT 0,
  stay      TEXT NOT NULL DEFAULT 'camp'   -- 'camp' (auf dem Gelände) oder 'hotel' (pendelt)
);

-- Line-up: jeder Act einmal. Tag, Bühne und Uhrzeit kommen später dazu (Zeitplan ca. Juni 2027).
CREATE TABLE IF NOT EXISTS acts (
  id         TEXT PRIMARY KEY,           -- vom Handy vergeben, damit doppeltes Senden nichts verdoppelt
  name       TEXT NOT NULL,
  day        TEXT,                       -- JJJJ-MM-TT (Festivaltag) oder leer = noch unbekannt
  stage      TEXT,
  start      TEXT,                       -- HH:MM Ortszeit
  end_time   TEXT,
  deleted    INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  updated_by TEXT,
  updated    INTEGER NOT NULL DEFAULT 0  -- Zeitstempel (ms)
);

-- Markierungen: je Person und Act genau eine (muss / gern / egal). Gehört nur dieser Person → keine Konflikte.
CREATE TABLE IF NOT EXISTS marks (
  person_id TEXT NOT NULL REFERENCES persons(id),
  act_id    TEXT NOT NULL REFERENCES acts(id),
  level     TEXT NOT NULL CHECK (level IN ('muss', 'gern', 'egal')),
  updated   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (person_id, act_id)
);

-- Gemeinsame Einstellungen der Gruppe (z. B. Link zur Tricount-Gruppe). Liegt nur hier, nie im öffentlichen Repo.
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_by TEXT,
  updated    INTEGER NOT NULL DEFAULT 0
);
