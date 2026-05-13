# Database Scripts

## 실행 순서

1. `migrations/20260513_0001_init_users.sql`
2. `migrations/20260513_0002_init_categories.sql`
3. `migrations/20260513_0003_init_todos.sql`
4. `seeds/20260513_0001_default_categories.sql`

또는 단일 파일 `schema.sql`(레거시)을 실행해도 동일한 결과가 만들어진다.

## 적용 예시

```powershell
$env:PGPASSWORD = '<password>'
psql -h localhost -U postgres -d postgres -f database/migrations/20260513_0001_init_users.sql
psql -h localhost -U postgres -d postgres -f database/migrations/20260513_0002_init_categories.sql
psql -h localhost -U postgres -d postgres -f database/migrations/20260513_0003_init_todos.sql
psql -h localhost -U postgres -d postgres -f database/seeds/20260513_0001_default_categories.sql
```

## 명명 규칙

`{YYYYMMDD}_{NNNN}_{snake_case_description}.sql`  (구조 원칙 10.3)

## 멱등성

- DDL은 `IF NOT EXISTS`로 멱등.
- 기본 카테고리 시드는 부분 UNIQUE 인덱스(`uq_categories_default_name`)와 `ON CONFLICT ON CONSTRAINT ... DO NOTHING`으로 멱등.
