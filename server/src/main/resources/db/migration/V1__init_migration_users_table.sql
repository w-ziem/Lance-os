CREATE TABLE users
(
    id        UUID NOT NULL,
    email     VARCHAR(255),
    full_name VARCHAR(255),
    CONSTRAINT pk_users PRIMARY KEY (id)
);