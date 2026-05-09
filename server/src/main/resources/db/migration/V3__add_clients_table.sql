CREATE TABLE clients
(
    id           UUID                     NOT NULL,
    user_id      UUID                     NOT NULL,
    name         VARCHAR(255)             NOT NULL,
    email        VARCHAR(255)             NOT NULL,
    company_name VARCHAR(255),
    notes        TEXT,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT pk_clients PRIMARY KEY (id),
    CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_clients_user_email UNIQUE (user_id, email)
);

CREATE INDEX idx_clients_user_id ON clients (user_id);
