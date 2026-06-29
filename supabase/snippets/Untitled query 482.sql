SELECT 
    code,
    COUNT(*) as total,
    array_agg(id) as ids,
    array_agg(programme) as programmes
FROM courses
WHERE code IS NOT NULL
GROUP BY code
HAVING COUNT(*) > 1
ORDER BY total DESC;