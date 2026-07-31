CREATE TABLE scope_items
(
    id             UUID                     NOT NULL,
    user_id        UUID                     NOT NULL,
    project_id     UUID                     NOT NULL,
    name           VARCHAR(255)             NOT NULL,
    description    TEXT,
    estimate_hours DOUBLE PRECISION         NOT NULL,
    position       INTEGER                  NOT NULL,
    source         VARCHAR(16)              NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_scope_items PRIMARY KEY (id),
    CONSTRAINT fk_scope_items_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_scope_items_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX idx_scope_items_project_position ON scope_items (project_id, position);
CREATE INDEX idx_scope_items_user_id ON scope_items (user_id);

CREATE TABLE proposals
(
    id                UUID                     NOT NULL,
    user_id           UUID                     NOT NULL,
    target_project_id UUID,
    kind              VARCHAR(32)              NOT NULL,
    status            VARCHAR(16)              NOT NULL,
    source_channel    VARCHAR(16)              NOT NULL,
    source_text       TEXT                     NOT NULL,
    payload           JSONB                    NOT NULL,
    summary           TEXT                     NOT NULL,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    decided_at        TIMESTAMP WITH TIME ZONE,
    CONSTRAINT pk_proposals PRIMARY KEY (id),
    CONSTRAINT fk_proposals_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_proposals_project FOREIGN KEY (target_project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX idx_proposals_user_status_created_at ON proposals (user_id, status, created_at DESC);

-- Nullable on purpose: "no rate set yet" is a real state the UI must distinguish
-- from a rate of 0. Existing rows would also fail a NOT NULL backfill.
ALTER TABLE users
    ADD COLUMN hourly_rate DOUBLE PRECISION;
