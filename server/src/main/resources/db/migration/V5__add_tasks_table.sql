CREATE TABLE tasks
(
    id             UUID                     NOT NULL,
    user_id        UUID                     NOT NULL,
    project_id     UUID                     NOT NULL,
    title          VARCHAR(255)             NOT NULL,
    description    TEXT,
    status         VARCHAR(20)              NOT NULL DEFAULT 'TODO',
    priority       VARCHAR(10)              NOT NULL DEFAULT 'MEDIUM',
    deadline       DATE,
    estimate_hours DOUBLE PRECISION,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT pk_tasks PRIMARY KEY (id),
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks (user_id);
CREATE INDEX idx_tasks_project_id ON tasks (project_id);
CREATE INDEX idx_tasks_user_status ON tasks (user_id, status);
