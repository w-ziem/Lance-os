CREATE TABLE subtasks
(
    id         UUID                     NOT NULL,
    task_id    UUID                     NOT NULL,
    label      VARCHAR(255)             NOT NULL,
    done       BOOLEAN                  NOT NULL DEFAULT FALSE,
    position   INTEGER                  NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT pk_subtasks PRIMARY KEY (id),
    CONSTRAINT fk_subtasks_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

CREATE INDEX idx_subtasks_task_id ON subtasks (task_id);
