'use server'

import { createClient } from '../utils/supabase/server'

export async function getCoursesBySourceId(sourceId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.from('courses').select(`
    id,
    source_id,
    code,
    name,
    title,
    programme,
    degree_type,
    study_option,
    timing,
    description,
    learning_outcomes,
    content,
    prerequisites,
    assessment,
    instructor,
    credits,
    url,
    searchable_text,
    created_at
  `).eq('source_id', sourceId)

    if (error){
        return {error: error.message}
    }
    return { data, error }
}