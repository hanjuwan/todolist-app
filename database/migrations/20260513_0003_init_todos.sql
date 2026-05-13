-- ============================================================
-- 20260513_0003_init_todos.sql
-- todos 테이블 + FK + 인덱스 5종
-- 기반: ERD v1.0 §4.3, BR-T1~T5
-- ============================================================

CREATE TABLE IF NOT EXISTS todos (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL,
    category_id  UUID         NOT NULL,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    due_date     DATE,
    is_completed BOOLEAN      NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT todos_pkey        PRIMARY KEY (id),
    CONSTRAINT todos_user_fk     FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,                                        -- 회원 탈퇴 시 할일 자동 삭제 (BR-U4)
    CONSTRAINT todos_category_fk FOREIGN KEY (category_id)
        REFERENCES categories (id)
        ON DELETE RESTRICT                                        -- 할일 존재 시 카테고리 삭제 거부 (BR-C4)
);

CREATE INDEX IF NOT EXISTS idx_todos_user_id
    ON todos (user_id);

CREATE INDEX IF NOT EXISTS idx_todos_user_id_is_completed
    ON todos (user_id, is_completed);

CREATE INDEX IF NOT EXISTS idx_todos_user_id_due_date
    ON todos (user_id, due_date);

CREATE INDEX IF NOT EXISTS idx_todos_category_id
    ON todos (category_id);
