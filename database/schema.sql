-- ============================================================
-- TodoListApp — 초기 데이터베이스 스키마
-- ============================================================
-- 대상 DB    : PostgreSQL 17
-- 기반 문서  : docs/6-erd.md v1.0
--             docs/2-prd.md v1.2 (10장 데이터 모델)
--             docs/1-domain-definition.md v0.2 (BR-U4)
-- 정책       : Raw SQL + Parameterized Query (ORM 사용 금지, PRD 8.1)
-- 작성일     : 2026-05-13
-- ============================================================
-- 실행 방법 (예시):
--   psql -h <host> -U <user> -d <database> -f database/schema.sql
-- 모든 객체는 IF NOT EXISTS로 정의되어 재실행 시에도 안전합니다.
-- ============================================================


-- ────────────────────────────────────────
-- 0. 확장 (Extensions)
-- ────────────────────────────────────────
-- PostgreSQL 17은 gen_random_uuid()를 기본 제공하지만,
-- 일부 환경(이전 버전 호환) 대비를 위해 pgcrypto를 활성화합니다.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ────────────────────────────────────────
-- 1. users
-- ────────────────────────────────────────
-- 인증된 사용자 계정. JWT 인증의 주체이며 모든 데이터의 소유자.
-- 적용 BR: BR-U1(email UNIQUE), BR-U2(bcrypt 해시), BR-U3(데이터 격리), BR-U4(탈퇴 시 하드 삭제)
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


-- ────────────────────────────────────────
-- 2. categories
-- ────────────────────────────────────────
-- 할일 분류 카테고리. 기본 카테고리(user_id IS NULL) + 사용자 정의 카테고리.
-- 적용 BR: BR-C1(기본 카테고리 수정/삭제 금지), BR-C2(user_id NULL), BR-C3(사용자 격리)
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


-- ────────────────────────────────────────
-- 3. todos
-- ────────────────────────────────────────
-- 할일 항목. 반드시 사용자(user_id)와 카테고리(category_id)에 귀속.
-- 적용 BR: BR-T1(user_id 필수), BR-T2(category_id 필수), BR-T3(completed_at 자동),
--          BR-T4(완료 후 수정 허용), BR-T5(due_date 과거 허용)
CREATE TABLE IF NOT EXISTS todos (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL,
    category_id  UUID         NOT NULL,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,                                            -- nullable
    start_date   DATE,                                            -- nullable, 기간 관리용 시작일
    due_date     DATE,                                            -- nullable, 과거 날짜 허용
    is_completed BOOLEAN      NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,                                     -- 완료 시 서비스 레이어에서 now() 설정, 완료 취소 시 NULL
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT todos_pkey        PRIMARY KEY (id),
    CONSTRAINT todos_dates_check CHECK (start_date IS NULL OR due_date IS NULL OR start_date <= due_date),
    CONSTRAINT todos_user_fk     FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,                                        -- 회원 탈퇴 시 할일 자동 삭제 (BR-U4)
    CONSTRAINT todos_category_fk FOREIGN KEY (category_id)
        REFERENCES categories (id)
        ON DELETE RESTRICT                                        -- 할일 존재 시 카테고리 삭제 거부 (OI-01 결정 전 기본값)
);

-- todos 인덱스 (PRD 10.2, ERD 6장 반영)
CREATE INDEX IF NOT EXISTS idx_todos_user_id
    ON todos (user_id);

CREATE INDEX IF NOT EXISTS idx_todos_user_id_is_completed
    ON todos (user_id, is_completed);

CREATE INDEX IF NOT EXISTS idx_todos_user_id_due_date
    ON todos (user_id, due_date);

CREATE INDEX IF NOT EXISTS idx_todos_user_id_start_date
    ON todos (user_id, start_date);

CREATE INDEX IF NOT EXISTS idx_todos_category_id
    ON todos (category_id);


-- ────────────────────────────────────────
-- 4. 기본 카테고리 시드 데이터
-- ────────────────────────────────────────
-- OI-02 미결 상태이나 ERD 7장 권장 초기값으로 삽입.
-- is_default = true, user_id IS NULL 로 전체 사용자 공통 제공.
INSERT INTO categories (id, user_id, name, is_default, created_at)
VALUES
    (gen_random_uuid(), NULL, '업무', true, now()),
    (gen_random_uuid(), NULL, '개인', true, now()),
    (gen_random_uuid(), NULL, '학습', true, now()),
    (gen_random_uuid(), NULL, '기타', true, now())
ON CONFLICT DO NOTHING;


-- ============================================================
-- 끝.
-- 후속: 마이그레이션 도구 도입 시 본 스크립트를
-- database/migrations/{timestamp}_init.sql 등으로 이관 권장.
-- ============================================================
