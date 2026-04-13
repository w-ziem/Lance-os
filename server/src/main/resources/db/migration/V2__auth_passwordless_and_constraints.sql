ALTER TABLE users
    ALTER COLUMN email SET NOT NULL;

ALTER TABLE users
    ALTER COLUMN full_name SET NOT NULL;

ALTER TABLE users
    ADD CONSTRAINT uk_users_email UNIQUE (email);

CREATE TABLE login_codes
(
    id         UUID                     NOT NULL,
    user_id    UUID                     NOT NULL,
    code_hash  VARCHAR(255)             NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at    TIMESTAMP WITH TIME ZONE,
    CONSTRAINT pk_login_codes PRIMARY KEY (id),
    CONSTRAINT fk_login_codes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_login_codes_user_unused_created_at
    ON login_codes (user_id, used_at, created_at DESC);

