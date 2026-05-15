-- ============================================================
-- 20260515_0001_add_todos_start_date.sql
-- todos 테이블에 start_date 컬럼 추가 (기간 관리)
-- ============================================================

ALTER TABLE todos
    ADD COLUMN IF NOT EXISTS start_date DATE;

ALTER TABLE todos
    DROP CONSTRAINT IF EXISTS todos_dates_check;

ALTER TABLE todos
    ADD CONSTRAINT todos_dates_check
    CHECK (start_date IS NULL OR due_date IS NULL OR start_date <= due_date);

CREATE INDEX IF NOT EXISTS idx_todos_user_id_start_date
    ON todos (user_id, start_date);
