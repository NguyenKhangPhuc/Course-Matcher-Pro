'use server'

import { CourseInsert } from '../types/course';
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
    created_at,
    start_date,
    end_date,
    enrollment_start_date,
    enrollment_end_date
  `).eq('source_id', sourceId)

    if (error){
        return {error: error.message}
    }
    return { data, error }
}

export async function getUniqueProgrammeBySourceId(
  sourceId: string
): Promise<{ data: string[]; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("programme")
    .eq("source_id", sourceId)
    .not("programme", "is", null);

  if (error) {
    return { data: [], error: error.message };
  }

  const unique = Array.from(
    new Set((data ?? []).map((r) => r.programme).filter(Boolean))
  ).sort();

  return { data: unique, error: null };
}

/**
 * Update editable fields of a course record by its UUID.
 *
 * System-managed fields (id, source_id, embedding, searchable_text,
 * created_at) are intentionally excluded from the accepted payload so
 * callers cannot accidentally overwrite them.
 *
 * @param courseId - UUID of the course row to update.
 * @param payload  - Partial object containing only the fields to change.
 * @returns        Object with an optional error string.
 */
export async function updateCourseByCourseId(
  courseId: string,
  payload: Partial<CourseInsert>
): Promise<{ error?: string }> {
  const supabase = await createClient();

  // Sanitize empty strings to null to prevent database casting errors (e.g. invalid date formats)


  const { error } = await supabase
    .from('courses')
    .update(payload)
    .eq('id', courseId);

  if (error) {
    return { error: `Failed to update course: ${error.message}` };
  }

  return {};
}
