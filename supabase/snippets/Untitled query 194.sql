ALTER TABLE sources 
DROP CONSTRAINT IF EXISTS unique_default_per_user;

-- 2. Nếu trước đó bạn tạo nó dưới dạng INDEX thay vì CONSTRAINT, hãy chạy thêm câu lệnh này:
DROP INDEX IF EXISTS unique_default_per_user;