"use server";

import { parseFile } from "../helpers/file_parsing";
import { CourseInsert } from "../types/course";
import { SourceInsert } from "../types/source_";
import { createClient } from "../utils/supabase/server";
import OpenAI from "openai";

/**
 * Course Upload Server Actions
 * ----------------------------
 * Handles the full pipeline of:
 *   1. Inserting a source record into the sources table
 *   2. Parsing the uploaded file into CourseRecord[]
 *   3. Embedding each course via OpenAI
 *   4. Inserting all courses (with embeddings) into the courses table
 *
 * Required packages:
 *   npm install @supabase/ssr openai xlsx papaparse pdfjs-dist
 */


// =====================================================================
// CLIENTS
// =====================================================================


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// =====================================================================
// TYPES
// =====================================================================

/** Accepted file types for upload */
type FileType = "excel" | "csv" | "json" | "pdf";


/** Return value of uploadAndEmbedCourses */
export interface UploadResult {
  success: boolean;
  source_id: string;
  total: number;
  inserted: number;
  failed: number;
  errors: { code: string; error: string }[];
}

// =====================================================================
// HELPERS
// =====================================================================

/**
 * Derive the FileType enum value from a File's extension.
 *
 * @param file - The uploaded File object.
 * @returns    A FileType string.
 * @throws     Error if the extension is not supported.
 */
function getFileType(file: File): FileType {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  const map: Record<string, FileType> = {
    xlsx: "excel",
    xls: "excel",
    csv: "csv",
    json: "json",
    pdf: "pdf",
  };

  const type = map[ext];
  if (!type) {
    throw new Error(
      `Unsupported file type ".${ext}". Accepted: .xlsx, .xls, .csv, .json, .pdf`
    );
  }

  return type;
}

/**
 * Build a single searchable string from a CourseRecord.
 * Only semantically meaningful fields are included.
 * The result is truncated to ~6000 characters to stay within token limits.
 *
 * @param course - A normalised CourseRecord.
 * @returns      A plain-text string ready to be embedded.
 */
function buildSearchableText(course: CourseInsert): string {
  const parts = [
    course.name && `Course: ${course.name}`,
    course.code && `Code: ${course.code}`,
    course.programme && `Programme: ${course.programme}`,
    course.degree_type && `Degree: ${course.degree_type}`,
    course.description && `Description: ${course.description}`,
    course.learning_outcomes && `Learning Outcomes: ${course.learning_outcomes}`,
    course.content && `Content: ${course.content}`,
    course.assessment && `Assessment: ${course.assessment}`,
    course.prerequisites && `Prerequisites: ${course.prerequisites}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Truncate — text-embedding-3-small has an 8191 token limit
  // ~4 chars per token → 6000 chars ≈ 1500 tokens, safely within limit
  return parts.slice(0, 6000);
}

/**
 * Embed a single text string using OpenAI text-embedding-3-small.
 * Returns a 1536-dimensional vector.
 *
 * @param text - The text to embed.
 * @returns    Array of 1536 floats.
 */
async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Sleep for a given number of milliseconds.
 * Used between embedding calls to avoid hitting OpenAI rate limits.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =====================================================================
// STEP 1 — INSERT SOURCE
// =====================================================================

/**
 * Insert a new record into the `sources` table for the current user.
 *
 * The source represents one uploaded file. Its `id` is used as a
 * foreign key on every course row that belongs to it.
 *
 * @param supabase  - An authenticated Supabase server client.
 * @param userId    - UUID of the authenticated user.
 * @param file      - The original File object (used for name + type).
 * @returns         The newly created SourceRow.
 * @throws          Error if the insert fails.
 */
async function insertSource(
  userId: string,
  file: File
): Promise<SourceInsert> {
  const fileType = getFileType(file);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sources")
    .insert({
      user_id: userId,
      name: file.name,
      file_type: fileType,
      is_default: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create source record: ${error.message}`);
  }

  return data as SourceInsert;
}

// =====================================================================
// STEP 2 — EMBED + BUILD COURSE ROWS
// =====================================================================

/**
 * Embed every course and attach source_id, producing rows ready for DB insert.
 *
 * Processes courses sequentially with a small delay between each
 * embedding call to stay within OpenAI's rate limits.
 *
 * @param courses  - Parsed CourseRecord array from the file parser.
 * @param sourceId - UUID of the source row created in step 1.
 * @returns        Object containing successful CourseRow[] and any errors.
 */
async function embedCourses(
  courses: CourseInsert[],
  sourceId: string
): Promise<{
  rows: CourseInsert[];
  errors: { code: string; error: string }[];
}> {
  const rows: CourseInsert[] = [];
  const errors: { code: string; error: string }[] = [];

  // Chia thành batch 20, mỗi batch chạy song song
  // OpenAI free tier: 3000 RPM → 50 concurrent là an toàn
  const BATCH_SIZE = 20;

  for (let i = 0; i < courses.length; i += BATCH_SIZE) {
    const batch = courses.slice(i, i + BATCH_SIZE);
    console.log(`Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(courses.length / BATCH_SIZE)}`);

    const results = await Promise.allSettled(
      batch.map(async (course) => {
        const identifier = course.code || course.name || "unknown";
        const searchableText = buildSearchableText(course);
        console.log('searchable_text length:', searchableText.length);
        console.log('learning_outcomes:', course.learning_outcomes?.slice(0, 50));
        if (!searchableText.trim()) {
          throw new Error("No searchable text");
        }

        const embedding = await embedText(searchableText);

        return {
          ...course,
          source_id: sourceId,
          searchable_text: searchableText,
          embedding: JSON.stringify(embedding),
        };
      })
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const course = batch[j];
      const identifier = course.code || course.name || "unknown";

      if (result.status === "fulfilled") {
        rows.push(result.value);
      } else {
        errors.push({
          code: identifier,
          error: result.reason instanceof Error ? result.reason.message : "Embedding failed",
        });
      }
    }

    // Delay nhỏ giữa các batch để tránh rate limit
    if (i + BATCH_SIZE < courses.length) {
      await sleep(200);
    }
  }

  return { rows, errors };
}

// =====================================================================
// STEP 3 — BATCH INSERT INTO SUPABASE
// =====================================================================

/**
 * Insert course rows into the `courses` table in batches.
 *
 * Batching avoids hitting Supabase's request body size limit (~1MB).
 * A batch size of 50 is safe for courses with typical text lengths.
 *
 * @param supabase   - An authenticated Supabase server client.
 * @param rows       - CourseRow[] produced by embedCourses.
 * @param batchSize  - Number of rows per insert (default: 50).
 * @returns          Number of successfully inserted rows.
 */
async function batchInsertCourses(
  rows: CourseInsert[],
  batchSize = 50
): Promise<{ inserted: number; errors: { code: string; error: string }[] }> {
  const supabase = await createClient();
  console.log("Step 3")
  // Map rows sang DB shape một lần duy nhất
  const dbRows = rows.map((row) => ({
    source_id: row.source_id,
    code: row.code,
    name: row.name,
    title: row.title,
    programme: row.programme,
    degree_type: row.degree_type,
    study_option: row.study_option,
    credits: row.credits ?? "",
    description: row.description,
    learning_outcomes: row.learning_outcomes,
    content: row.content,
    prerequisites: row.prerequisites,
    assessment: row.assessment,
    instructor: row.instructor,
    url: row.url,
    timing: row.timing,
    searchable_text: row.searchable_text,
    embedding: row.embedding,
  }));

  // Chia thành batches
  const batches: typeof dbRows[] = [];
  for (let i = 0; i < dbRows.length; i += batchSize) {
    batches.push(dbRows.slice(i, i + batchSize));
  }

  // Tất cả batches chạy song song — không sequential
  const results = await Promise.all(
    batches.map((batch, index) => {
      console.log("Insered batch " + index)
      return supabase.from("courses").insert(batch).select("id")
    }
    )
  );

  // Gom kết quả
  let inserted = 0;
  const errors: { code: string; error: string }[] = [];

  results.forEach((result, batchIndex) => {
    if (result.error) {
      const batch = batches[batchIndex];
      batch.forEach((row) =>
        errors.push({ code: row.code || row.name, error: result.error!.message })
      );
    } else {
      inserted += result.data?.length ?? 0;
    }
  });

  return { inserted, errors };
}

// =====================================================================
// MAIN SERVER ACTION
// =====================================================================

/**
 * Upload a course file, parse it, embed each course, and persist everything
 * to Supabase.
 *
 * Full pipeline:
 *   1. Authenticate the current user via Supabase session.
 *   2. Insert a source record (sources table).
 *   3. Parse the file into CourseRecord[] using the appropriate parser.
 *   4. Embed each course's searchable text via OpenAI.
 *   5. Batch-insert all course rows (with embeddings) into the courses table.
 *
 * @param formData - FormData containing a single "file" entry (File object).
 * @returns        UploadResult describing what was inserted and any failures.
 *
 * @example — call from a Client Component:
 * ```tsx
 * const formData = new FormData()
 * formData.append('file', selectedFile)
 * const result = await uploadAndEmbedCourses(formData)
 * ```
 */
export async function uploadAndEmbedCourses(
  formData: FormData
): Promise<UploadResult> {
  const supabase = await createClient();

  // ── Auth check ──────────────────────────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to upload files.");
  }

  // ── Extract file from FormData ───────────────────────────────────────
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    throw new Error('FormData must contain a "file" entry.');
  }

  if (file.size === 0) {
    throw new Error("The uploaded file is empty.");
  }

  // Max 20MB
  const MAX_BYTES = 20 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    throw new Error("File exceeds the 20 MB size limit.");
  }

  let sourceId = "";

  try {
    // ── Step 1: Insert source ──────────────────────────────────────────
    const source = await insertSource(user.id, file);
    sourceId = source.id!;

    // ── Step 2: Parse file ─────────────────────────────────────────────
    let courses: CourseInsert[];
    try {
      courses = await parseFile(file);
    } catch (parseError) {
      // Clean up the orphaned source row if parsing fails
      await supabase.from("sources").delete().eq("id", sourceId);
      throw new Error(
        `File parsing failed: ${parseError instanceof Error ? parseError.message : "Unknown error"}`
      );
    }
    // return null;
    if (courses.length === 0) {
      await supabase.from("sources").delete().eq("id", sourceId);
      throw new Error(
        "No course records were found in the uploaded file. Please check the file format."
      );
    }
    console.log("Courses length not equal 0 = " + courses.length)
    // ── Step 3: Embed ──────────────────────────────────────────────────
    const { rows, errors: embedErrors } = await embedCourses(courses, sourceId);

    // ── Step 4: Batch insert ───────────────────────────────────────────
    const { inserted, errors: insertErrors } = await batchInsertCourses(

      rows
    );

    const allErrors = [...embedErrors, ...insertErrors];
    console.log("Finished")
    return {
      success: inserted > 0,
      source_id: sourceId,
      total: courses.length,
      inserted,
      failed: allErrors.length,
      errors: allErrors,
    };
  } catch (err) {
    // If source was created but something downstream failed, remove it
    // so the user doesn't see a broken source in their list.
    if (sourceId) {
      await supabase.from("sources").delete().eq("id", sourceId);
    }

    throw err instanceof Error
      ? err
      : new Error("An unexpected error occurred during upload.");
  }
}

// =====================================================================
// UTILITY ACTION — GET USER SOURCES
// =====================================================================

/**
 * Fetch all sources belonging to the current user, plus the default source.
 *
 * Used to populate the source selector in the UI.
 *
 * @returns Array of SourceRow objects, ordered by created_at descending.
 * @throws  Error if the user is not authenticated.
 */
export async function getUserSources(): Promise<SourceInsert[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to view sources.");
  }

  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch sources: ${error.message}`);
  }

  return (data ?? []) as SourceInsert[];
}

// =====================================================================
// UTILITY ACTION — DELETE SOURCE
// =====================================================================

/**
 * Delete a source and all its associated courses.
 *
 * Cascade deletion is handled at the DB level via:
 *   FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
 *
 * Only the owner of the source can delete it (enforced by RLS).
 * Default sources cannot be deleted.
 *
 * @param sourceId - UUID of the source to delete.
 * @throws         Error if deletion fails or source is default.
 */
export async function deleteSource(sourceId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to delete a source.");
  }

  // Guard: prevent deleting the default source
  const { data: source } = await supabase
    .from("sources")
    .select("is_default, user_id")
    .eq("id", sourceId)
    .single();

  if (source?.is_default) {
    throw new Error("The default source cannot be deleted.");
  }

  if (source?.user_id !== user.id) {
    throw new Error("You do not have permission to delete this source.");
  }

  const { error } = await supabase
    .from("sources")
    .delete()
    .eq("id", sourceId);

  if (error) {
    throw new Error(`Failed to delete source: ${error.message}`);
  }
}