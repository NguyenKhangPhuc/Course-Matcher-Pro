import { Database } from "./database.types"

export type Course = Database["public"]["Tables"]["courses"]["Row"]

export type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"]

export interface CourseAgentResponse extends CourseInsert {
    similarity: number,
}