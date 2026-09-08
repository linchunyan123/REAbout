BEGIN;
CREATE SCHEMA IF NOT EXISTS reabout;
CREATE TABLE IF NOT EXISTS reabout.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 5000),
  status text NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS reabout.settings (
  id integer PRIMARY KEY CHECK (id = 1),
  name text NOT NULL DEFAULT '我的工作区',
  position text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  notifications jsonb NOT NULL DEFAULT '{"email":false,"browser":false,"weekly":false}'
);
INSERT INTO reabout.settings (id) VALUES (1) ON CONFLICT DO NOTHING;
COMMIT;
