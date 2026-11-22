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
