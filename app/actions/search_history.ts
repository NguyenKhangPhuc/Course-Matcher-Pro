'use server'

import { CourseAgentResponse } from '../types/course'
import { SearchHistoryInsert } from '../types/search_history'
import { SearchMatchesInsert } from '../types/search_matches'
import { createClient } from '../utils/supabase/server'


export async function createSearchHistoryAndMatches(history: SearchHistoryInsert, searchMatches: CourseAgentResponse[]) {
    const supabase = await createClient()
    const { data, error } = await supabase.from('search_history').insert(history).select('*').single();
    if (error) {
        return { error: error.message }
    }

    const updatedSearchMatches: SearchMatchesInsert[] = searchMatches.map((match) => {
        return {
            course_id: match.id!,
            similarity: match.similarity,
            search_id: data.id
        }
    })

    const { error: matchError } = await supabase.from('search_matches').insert(updatedSearchMatches)
    if (matchError) {
        return { error: matchError.message }
    }
    return { data }
}

/**
 * getSearchHistoryWithMatches
 * ----------------------------
 * Fetch all search history records for a given user, including:
 *   - the source name (joined from sources)
 *   - all matched courses with their similarity scores (joined from search_matches → courses)
 *
 * Course rows exclude the embedding column to keep payload size small.
 *
 * @param userId - UUID of the user whose search history to fetch.
 * @returns      { data, error } — data is an array of search history records
 *               with nested source name and matches array, or null on failure.
 */
export async function getSearchHistoryWithMatches(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("search_history")
        .select(`
      id,
      company_name,
      job_description,
      technical_requirements,
      summary,
      created_at,
      source_id,
      sources (
        name
      ),
      search_matches (
        id,
        created_at,
        similarity,
        course_id,
        courses (
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
        )
      )
    `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

/**
 * deleteSearchHistoryById
 * -------------------------
 * Delete a single search history record by its ID.
 *
 * Associated search_matches rows are automatically removed via
 * ON DELETE CASCADE on the search_matches.search_id foreign key.
 *
 * @param searchId - UUID of the search_history record to delete.
 * @returns        { data, error } — data is the deleted row, or null on failure.
 */
export async function deleteSearchHistoryById(searchId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("search_history")
        .delete()
        .eq("id", searchId)
        .select()
        .single();

    if (error) {
        return { data: null, error };
    }

    return { data, error: null };
}