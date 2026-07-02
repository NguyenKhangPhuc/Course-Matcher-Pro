CREATE OR REPLACE FUNCTION increment_search_usage(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_rows INTEGER;
BEGIN
    -- Chỉ update nếu searches_today < searches_limit
    -- Atomic: check và increment trong 1 query, không có race condition
    UPDATE user_usage
    SET 
        searches_today = searches_today + 1,
        updated_at = NOW()
    WHERE 
        user_id = p_user_id
        AND searches_today < searches_limit;

    GET DIAGNOSTICS updated_rows = ROW_COUNT;

    -- 0 rows updated = đã đạt limit
    IF updated_rows = 0 THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;