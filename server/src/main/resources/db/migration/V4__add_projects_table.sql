CREATE TABLE projects
(
    id          UUID                     NOT NULL,
    user_id     UUID                     NOT NULL,
    client_id   UUID                     NOT NULL,
    name        VARCHAR(255)             NOT NULL,
    description TEXT,
    status      VARCHAR(20)              NOT NULL DEFAULT 'ACTIVE',
    deadline    DATE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT pk_projects PRIMARY KEY (id),
    CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE RESTRICT
);

CREATE INDEX idx_projects_user_id ON projects (user_id);
CREATE INDEX idx_projects_client_id ON projects (client_id);
