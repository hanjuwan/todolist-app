-- ============================================================
-- 20260513_0001_init_users.sql
-- users 테이블 + 확장
-- 기반: ERD v1.0 §4.1, BR-U1/U2/U3/U4
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id            UUID          NOT NULL DEFAULT gen_random_uuid(),
    email         VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    name          VARCHAR(50)   NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT users_pkey      PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);
