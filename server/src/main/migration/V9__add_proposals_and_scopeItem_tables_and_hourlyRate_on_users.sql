CREATE TABLE proposals
(
    id                UUID                        NOT NULL,
    user_id           UUID                        NOT NULL,
    target_project_id UUID,
    kind              VARCHAR(255)                NOT NULL,
    status            VARCHAR(255)                NOT NULL,
    source_channel    VARCHAR(255)                NOT NULL,
    source_text       TEXT                        NOT NULL,
    payload           JSONB                       NOT NULL,
    summary           VARCHAR(255)                NOT NULL,
    created_at        TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    decided_at        TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_proposals PRIMARY KEY (id)
);

CREATE TABLE scope_items
(
    id             UUID                        NOT NULL,
    user_id        UUID                        NOT NULL,
    project_id     UUID                        NOT NULL,
    name           VARCHAR(255)                NOT NULL,
    description    TEXT,
    estimate_hours DOUBLE PRECISION            NOT NULL,
    position       INTEGER                     NOT NULL,
    source         VARCHAR(255)                NOT NULL,
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_scope_items PRIMARY KEY (id)
);

ALTER TABLE users
    ADD hourly_rate DOUBLE PRECISION;

ALTER TABLE users
    ALTER COLUMN hourly_rate SET NOT NULL;