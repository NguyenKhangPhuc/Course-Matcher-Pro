'use server'

import { createClient } from '../utils/supabase/server'

/**
 * Increment the user's daily search count if under the limit.
 * Uses a Postgres function to atomically check and increment in one query.
 *
 * @param userId - UUID of the authenticated user.
 * @returns { data: true } if allowed, { error: string } if limit reached.
 */
export async function incrementSearchUsage(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('increment_search_usage', { p_user_id: userId })

    if (error) {
        return { error: error.message }
    }

    // Function trả về false nếu đã đạt limit
    if (data === false) {
        return { error: 'Usage limit reached, please wait until 00:00 today' }
    }

    return { data: true, error: null }
}