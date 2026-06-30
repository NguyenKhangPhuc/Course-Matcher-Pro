import { Database } from "./database.types"

export type SearchHistory = Database["public"]["Tables"]["search_history"]["Row"]

export type SearchHistoryInsert = Database["public"]["Tables"]["search_history"]["Insert"]
