import { CourseInsert } from "./course"
import { Database } from "./database.types"

export type SearchHistory = Database["public"]["Tables"]["search_history"]["Row"]

export type SearchHistoryInsert = Database["public"]["Tables"]["search_history"]["Insert"]


export interface SearchHistoryWithMatches extends SearchHistoryInsert {
    sources: {
        name: string
    }
    search_matches: {
        id: string;
        created_at: string | null;
        similarity: number;
        course_id: string;
        courses: CourseInsert
    }[]
}