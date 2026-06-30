import { Database } from "./database.types"

export type SearchMatches = Database["public"]["Tables"]["search_matches"]["Row"]

export type SearchMatchesInsert = Database["public"]["Tables"]["search_matches"]["Insert"]
