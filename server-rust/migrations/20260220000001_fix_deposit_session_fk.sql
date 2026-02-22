-- F-20: Fix deposit_sessions.session_id FK to allow session cleanup
--
-- The original FK defaults to RESTRICT, which blocks deletion of any
-- session that has deposit records. Session cleanup jobs silently fail
-- for sessions with deposits, causing unbounded session table growth.
--
-- Fix: Make session_id nullable and change FK to ON DELETE SET NULL.
-- Deposit records are preserved (with NULL session_id) when sessions expire.

ALTER TABLE deposit_sessions ALTER COLUMN session_id DROP NOT NULL;

ALTER TABLE deposit_sessions
  DROP CONSTRAINT IF EXISTS deposit_sessions_session_id_fkey;

ALTER TABLE deposit_sessions
  ADD CONSTRAINT deposit_sessions_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL;
