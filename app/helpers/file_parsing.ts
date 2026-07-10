/**
 * Course File Parsers
 * -------------------
 * Helper functions to parse Excel, CSV, JSON, and PDF files
 * into a unified CourseInsert format for ingestion into Supabase.
 *
 * Required packages (install in your Next.js project):
 *   npm install xlsx papaparse pdfjs-dist
 *   npm install --save-dev @types/papaparse
 *
 * Usage:
 *   import { parseFile } from '@/lib/parsers'
 *   const courses = await parseFile(file)
 */

import { CourseInsert } from "../types/course";

// =====================================================================
// UNIFIED COURSE FORMAT
// =====================================================================


/** Keys that must always exist on a CourseInsert (even if empty string) */
const REQUIRED_KEYS: (keyof CourseInsert)[] = [
  "programme",
  "degree_type",
  "study_option",
  "title",
  "code",
  "id",
  "name",
  "credits",
  "timing",
  "learning_outcomes",
  "content",
  "instructor",
  "description",
  "prerequisites",
  "assessment",
  "url",
  "start_date",
  "end_date",
  "enrollment_start_date",
  "enrollment_end_date",
];

// =====================================================================
// NORMALISATION HELPERS
// =====================================================================

/**
 * Return a safe string — converts null / undefined / non-strings to "".
 */
function safeStr(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return "";
}

/**
 * Avoid duplicate course
 */
function deduplicateByCodes(courses: CourseInsert[]): CourseInsert[] {
  const seen = new Set<string>();
  return courses.filter((course) => {
    const key = `${course.code}__${course.programme}__${course.study_option}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Map a raw key from a parsed file to its canonical CourseInsert key.
 * Handles common naming variations found in spreadsheets / JSON exports.
 *
 * Returns null if the key is not recognised.
 */
function mapKey(raw: string): keyof CourseInsert | null {
  const k = raw.toLowerCase().replace(/[\s\-]/g, "_");

  const mapping: Record<string, keyof CourseInsert> = {
    programme: "programme",
    program: "programme",
    degree_type: "degree_type",
    degreetype: "degree_type",
    degree: "degree_type",
    study_option: "study_option",
    studyoption: "study_option",
    option: "study_option",
    track: "study_option",
    title: "title",
    course_title: "title",
    coursetitle: "title",
    code: "code",
    course_code: "code",
    coursecode: "code",
    id: "id",
    course_id: "id",
    courseid: "id",
    name: "name",
    course_name: "name",
    coursename: "name",
    course_credits: "credits",
    credits: 'credits',
    learning_outcomes: "learning_outcomes",
    learning_outcomes_parsed: "learning_outcomes",
    learningoutcomes: "learning_outcomes",
    learning_outcome: "learning_outcomes",
    outcomes: "learning_outcomes",
    objectives: "learning_outcomes",
    content: "content",
    content_parsed: "content",
    course_content: "content",
    topics: "content",
    syllabus: "content",
    instructor: "instructor",
    instructor_parsed: "instructor",
    teacher: "instructor",
    lecturer: "instructor",
    person_in_charge: "instructor",
    responsible_person: "instructor",
    description: "description",
    course_description: "description",
    summary: "description",
    prerequisites: "prerequisites",
    prerequisite: "prerequisites",
    pre_requisites: "prerequisites",
    required_courses: "prerequisites",
    assessment: "assessment",
    assessment_criteria: "assessment",
    assessment_scale: "assessment",
    grading: "assessment",
    evaluation: "assessment",
    url: "url",
    link: "url",
    course_url: "url",
    webpage: "url",
    start_date: "start_date",
    startdate: "start_date",
    end_date: "end_date",
    enddate: "end_date",
    enrollment_start_date: "enrollment_start_date",
    enrollmentstartdate: "enrollment_start_date",
    enrollment_end_date: "enrollment_end_date",
    enrollmentenddate: "enrollment_end_date",
  };

  return mapping[k] ?? null;
}

/**
 * Parse timing columns (e.g. "1st_YEAR_1P", "2nd_YEAR_3P") from a raw row.
 * Accepts values: 1, "1", true, "yes", "x", "✓" → 1; everything else → 0.
 */
function parseTimingFromRow(row: Record<string, unknown>): Record<string, number> {
  const timing: Record<string, number> = {};
  const timingPattern = /^(1st|2nd|3rd)_year_\dp$/i;

  for (const [key, value] of Object.entries(row)) {
    if (!timingPattern.test(key)) continue;

    let active = 0;
    if (value === 1 || value === true) {
      active = 1;
    } else if (typeof value === "string") {
      active = ["1", "true", "yes", "x", "✓", "✔"].includes(
        value.toLowerCase().trim()
      )
        ? 1
        : 0;
    }
    timing[key.toUpperCase()] = active;
  }

  return timing;
}

/**
 * Ensure every required key exists on the record.
 * Missing string fields default to ""; missing `timing` defaults to {}.
 */
function normalise(partial: Partial<CourseInsert>): CourseInsert {
  const record = { ...partial } as CourseInsert;

  for (const key of REQUIRED_KEYS) {
    if (record[key] === undefined || record[key] === null) {
      (record as unknown as Record<string, unknown>)[key] =
        key === "timing" ? {} : "";
    }
  }

  // Guarantee `timing` is always an object
  if (typeof record.timing !== "object" || Array.isArray(record.timing)) {
    record.timing = {};
  }

  return record;
}

/**
 * Convert a raw key-value row (from any parser) into a CourseInsert.
 */
function rowToCourse(row: Record<string, unknown>): CourseInsert {
  const partial: Partial<CourseInsert> = {
    timing: parseTimingFromRow(row),
  };

  for (const [rawKey, value] of Object.entries(row)) {
    const canonical = mapKey(rawKey);
    if (canonical && canonical !== "timing") {
      const strValue = safeStr(value);
      const existing = (partial as Record<string, unknown>)[canonical];

      // Chỉ ghi đè nếu giá trị mới có nội dung
      // hoặc field chưa có giá trị nào
      if (strValue || !existing) {
        (partial as Record<string, unknown>)[canonical] = strValue;
      }
    }
  }

  return normalise(partial);
}

// =====================================================================
// EXCEL PARSER (.xlsx / .xls)
// =====================================================================

/**
 * Parse an Excel file (all sheets) into CourseInsert[].
 *
 * Uses the `xlsx` (SheetJS) library — install with:
 *   npm install xlsx
 *
 * Each row in every sheet is mapped to a CourseInsert.
 * Rows that have no `name` AND no `code` are silently skipped.
 *
 * @param file - The File object from an <input type="file"> element.
 * @returns    Array of normalised CourseInsert objects.
 */
export async function parseExcel(file: File): Promise<CourseInsert[]> {
  const { read, utils } = await import("xlsx");
  // console.log("Step 1")
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: "array" });

  // Only read the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  const rows: Record<string, unknown>[] = utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  return rows
    .map(rowToCourse)
    .filter((course) => course.name || course.code || course.title);
}

// =====================================================================
// CSV PARSER (.csv)
// =====================================================================

/**
 * Parse a CSV file into CourseInsert[].
 *
 * Uses `papaparse` — install with:
 *   npm install papaparse
 *   npm install --save-dev @types/papaparse
 *
 * Assumes the first row is a header row.
 * Empty rows are skipped automatically by PapaParse (skipEmptyLines).
 *
 * @param file - The File object from an <input type="file"> element.
 * @returns    Array of normalised CourseInsert objects.
 */
export async function parseCsv(file: File): Promise<CourseInsert[]> {
  const Papa = (await import("papaparse")).default;

  // Read to string first — avoids FileReaderSync which is browser/Web Worker only.
  // Papa.parse(string, ...) runs entirely in Node.js without any browser APIs.
  const text = await file.text();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep everything as strings; we normalise ourselves
      complete: (result) => {
        if (result.errors.length > 0) {
          console.warn("[parseCsv] Warnings:", result.errors);
        }

        const courses = result.data
          .map(rowToCourse)
          .filter((c) => c.name || c.code || c.title);

        resolve(courses);
      },
      error: (error: Error) => reject(error),
    });
  });
}

// =====================================================================
// JSON PARSER (.json)
// =====================================================================

/**
 * Parse a JSON file into CourseInsert[].
 *
 * Accepted JSON shapes:
 *   - Array of objects:  [ { code: "...", name: "..." }, ... ]
 *   - Object with a courses key:  { "courses": [ ... ] }
 *   - Object with a data key:     { "data": [ ... ] }
 *
 * Any other shape returns an empty array and logs a warning.
 *
 * @param file - The File object from an <input type="file"> element.
 * @returns    Array of normalised CourseInsert objects.
 */
export async function parseJson(file: File): Promise<CourseInsert[]> {
  const text = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file — could not parse.");
  }

  let rows: Record<string, unknown>[];

  if (Array.isArray(parsed)) {
    rows = parsed as Record<string, unknown>[];
  } else if (parsed !== null && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;

    if (Array.isArray(obj.courses)) {
      rows = obj.courses as Record<string, unknown>[];
    } else if (Array.isArray(obj.data)) {
      rows = obj.data as Record<string, unknown>[];
    } else {
      console.warn(
        "[parseJson] Unrecognised JSON shape — expected an array or { courses: [] } / { data: [] }"
      );
      return [];
    }
  } else {
    console.warn("[parseJson] JSON root is not an array or object.");
    return [];
  }

  return rows
    .map(rowToCourse)
    .filter((c) => c.name || c.code || c.title);
}


// =====================================================================
// UNIFIED ENTRY POINT
// =====================================================================

/**
 * Detect the file type by extension and delegate to the correct parser.
 *
 * Supported extensions: .xlsx, .xls, .csv, .json, .pdf
 *
 * @param file - The File object from an <input type="file"> element.
 * @returns    Array of normalised CourseInsert objects.
 * @throws     Error if the file extension is not supported.
 *
 * @example
 * const input = document.querySelector<HTMLInputElement>('#file-input')!
 * input.addEventListener('change', async () => {
 *   const file = input.files?.[0]
 *   if (!file) return
 *   const courses = await parseFile(file)
 *   // console.log(courses)
 * })
 */
export async function parseFile(file: File): Promise<CourseInsert[]> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  switch (ext) {
    case "xlsx":
    case "xls":
      // console.log("Start to parse excel")
      const coursesExcel = await parseExcel(file);
      return deduplicateByCodes(coursesExcel)
    case "csv":
      const coursesCSV = await parseCsv(file);
      return deduplicateByCodes(coursesCSV)
    case "json":
      const coursesJSON = await parseJson(file);
      return deduplicateByCodes(coursesJSON)
    default:
      throw new Error(
        `Unsupported file type ".${ext}". Accepted: .xlsx, .xls, .csv, .json, .pdf`
      );
  }
}