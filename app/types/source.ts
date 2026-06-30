import { Database } from "./database.types"

export type Source = Database["public"]["Tables"]["sources"]["Row"]

export type SourceInsert = Database["public"]["Tables"]["sources"]["Insert"]
