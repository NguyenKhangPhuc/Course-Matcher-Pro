SELECT * FROM courses 
WHERE code IN (
    SELECT code 
    FROM courses 
    GROUP BY code 
    HAVING COUNT(*) > 1
)
ORDER BY code;