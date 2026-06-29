-- Query 1: Kiểm tra type của embedding
SELECT pg_typeof(embedding) FROM courses LIMIT 1;

-- Query 2: Xem thử giá trị embedding trông như thế nào
SELECT LEFT(embedding::text, 50) FROM courses LIMIT 1;