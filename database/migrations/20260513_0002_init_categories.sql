-- ============================================================
-- 20260513_0002_init_categories.sql
-- categories 테이블 + FK + 인덱스
-- 기반: ERD v1.0 §4.2, BR-C1/C2/C3/C4
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id    UUID,                                              -- NULL = 기본 카테고리, NOT NULL = 사용자 정의
    name       VARCHAR(50)  NOT NULL,
    is_default BOOLEAN      NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT categories_pkey    PRIMARY KEY (id),
    CONSTRAINT categories_user_fk FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE                                         -- 회원 탈퇴 시 사용자 카테고리 자동 삭제 (BR-U4)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id
    ON categories (user_id);

-- 기본 카테고리 시드 멱등성 보장 (DB-03 보강)
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_default_name
    ON categories (name)
    WHERE is_default = true AND user_id IS NULL;
