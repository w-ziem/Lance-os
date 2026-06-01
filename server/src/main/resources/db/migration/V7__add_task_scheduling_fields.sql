ALTER TABLE tasks
    ADD COLUMN scheduled_start TIMESTAMP WITH TIME ZONE,
    ADD COLUMN scheduled_end   TIMESTAMP WITH TIME ZONE,
    ADD COLUMN locked          BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_tasks_user_scheduled_start
    ON tasks (user_id, scheduled_start);
