-- ============================================================
-- 20260513_0001_default_categories.sql
-- 기본 카테고리 4건 시드 (업무 / 개인 / 학습 / 기타)
-- 멱등성: uq_categories_default_name (부분 UNIQUE 인덱스)에 의해 보장
-- 기반: ERD v1.0 §7, BR-C2
-- ============================================================

INSERT INTO categories (id, user_id, name, is_default, created_at)
VALUES
    (gen_random_uuid(), NULL, '업무', true, now()),
    (gen_random_uuid(), NULL, '개인', true, now()),
    (gen_random_uuid(), NULL, '학습', true, now()),
    (gen_random_uuid(), NULL, '기타', true, now())
ON CONFLICT (name) WHERE (is_default = true AND user_id IS NULL) DO NOTHING;
