/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as XLSX from 'xlsx'
import { parseCsv, parseJson, parseExcel, parseFile } from '../app/helpers/file_parsing'

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------
// NOTE: This suite relies on the global `File` constructor (available natively
// in Node.js >= 20, which Jest runs on top of in the "node" test environment).
// If your Node version does not expose `File` globally, polyfill it with:
//   import { File as UndiciFile } from 'undici'
//   (global as any).File = UndiciFile

/** Builds a File object from a CSV string. */
function makeCsvFile(content: string, name = 'courses.csv'): File {
  return new File([content], name, { type: 'text/csv' })
}

/** Builds a File object from a JSON-serializable value. */
function makeJsonFile(content: unknown, name = 'courses.json'): File {
  return new File([JSON.stringify(content)], name, { type: 'application/json' })
}

/** Builds a File object representing an .xlsx workbook from row objects. */
function makeXlsxFile(rows: Record<string, unknown>[], name = 'courses.xlsx'): File {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return new File([buffer], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

// ---------------------------------------------------------------------------
// parseCsv
// ---------------------------------------------------------------------------
describe('parseCsv', () => {
  it('parses a well-formed CSV into normalised CourseInsert objects', async () => {
    /**
     * Target: parseCsv()
     * Scenario: A CSV file with standard headers (code, name, programme) and one valid row.
     * Expectation: The function returns an array with one CourseInsert whose fields
     *              are correctly mapped from the raw CSV columns.
     */
    // Arrange
    const csv = 'code,name,programme\nCS101,Intro to CS,Computer Science\n'
    const file = makeCsvFile(csv)

    // Act
    const result = await parseCsv(file)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      code: 'CS101',
      name: 'Intro to CS',
      programme: 'Computer Science',
    })
  })

  it('maps common header name variations to their canonical CourseInsert keys', async () => {
    /**
     * Target: parseCsv() -> rowToCourse() -> mapKey()
     * Scenario: CSV headers use alternate but recognised naming conventions
     *           (e.g. "Course Code", "Course Name", "Program").
     * Expectation: All variant headers are correctly mapped onto the canonical fields.
     */
    // Arrange
    const csv = 'Course Code,Course Name,Program,Teacher\nCS201,Data Structures,CS,Dr. Smith\n'
    const file = makeCsvFile(csv)

    // Act
    const result = await parseCsv(file)

    // Assert
    expect(result[0]).toMatchObject({
      code: 'CS201',
      name: 'Data Structures',
      programme: 'CS',
      instructor: 'Dr. Smith',
    })
  })

  it('filters out rows lacking name, code, and title', async () => {
    /**
     * Target: parseCsv()
     * Scenario: One row has a code, the other row has none of name/code/title populated.
     * Expectation: Only the row with at least one identifying field is kept.
     */
    // Arrange
    const csv = 'code,name,description\nCS301,,Some description\n,,Irrelevant row with no id\n'
    const file = makeCsvFile(csv)

    // Act
    const result = await parseCsv(file)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('CS301')
  })

  it('parses timing columns into 1/0 flags based on recognised truthy values', async () => {
    /**
     * Target: parseCsv() -> parseTimingFromRow()
     * Scenario: A CSV row includes timing columns with different truthy/falsy
     *           representations ("x", "yes", "", "0").
     * Expectation: Recognised truthy values become 1, everything else becomes 0,
     *              and the timing key is upper-cased in the output.
     */
    // Arrange
    const csv = 'code,name,1st_YEAR_1P,1st_YEAR_2P,2nd_YEAR_1P\nCS401,Algorithms,x,,0\n'
    const file = makeCsvFile(csv)

    // Act
    const result = await parseCsv(file)

    // Assert
    expect(result[0].timing).toEqual({
      '1ST_YEAR_1P': 1,
      '1ST_YEAR_2P': 0,
      '2ND_YEAR_1P': 0,
    })
  })

  it('returns an empty array when the CSV has a header row but no data rows', async () => {
    /**
     * Target: parseCsv()
     * Scenario: Edge case where the CSV file contains only a header line and no
     *           actual data rows.
     * Expectation: The function resolves to an empty array without throwing.
     */
    // Arrange
    const csv = 'code,name,programme\n'
    const file = makeCsvFile(csv)

    // Act
    const result = await parseCsv(file)

    // Assert
    expect(result).toEqual([])
  })

  it('defaults every required field to an empty string when not present in the row', async () => {
    /**
     * Target: parseCsv() -> normalise()
     * Scenario: A row only specifies "code", leaving every other CourseInsert
     *           field unset.
     * Expectation: All other required string fields default to "" and `timing`
     *              defaults to an empty object.
     */
    // Arrange
    const csv = 'code\nCS501\n'
    const file = makeCsvFile(csv)

    // Act
    const result = await parseCsv(file)

    // Assert
    expect(result[0]).toMatchObject({
      code: 'CS501',
      name: '',
      description: '',
      instructor: '',
      timing: {},
    })
  })
})

// ---------------------------------------------------------------------------
// parseJson
// ---------------------------------------------------------------------------
describe('parseJson', () => {
  it('parses a plain array of course objects', async () => {
    /**
     * Target: parseJson()
     * Scenario: The JSON root is a plain array of course records.
     * Expectation: Each array item is converted into a normalised CourseInsert.
     */
    // Arrange
    const file = makeJsonFile([{ code: 'CS101', name: 'Intro to CS' }])

    // Act
    const result = await parseJson(file)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ code: 'CS101', name: 'Intro to CS' })
  })

  it('parses a JSON object with a "courses" key', async () => {
    /**
     * Target: parseJson()
     * Scenario: The JSON root is an object wrapping the course array under "courses".
     * Expectation: The function extracts and parses the nested array correctly.
     */
    // Arrange
    const file = makeJsonFile({ courses: [{ code: 'CS201', name: 'Data Structures' }] })

    // Act
    const result = await parseJson(file)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('CS201')
  })

  it('parses a JSON object with a "data" key', async () => {
    /**
     * Target: parseJson()
     * Scenario: The JSON root is an object wrapping the course array under "data".
     * Expectation: The function extracts and parses the nested array correctly.
     */
    // Arrange
    const file = makeJsonFile({ data: [{ code: 'CS301', name: 'Algorithms' }] })

    // Act
    const result = await parseJson(file)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('CS301')
  })

  it('returns an empty array when the JSON shape is unrecognised', async () => {
    /**
     * Target: parseJson()
     * Scenario: Edge case where the JSON root is an object without a "courses"
     *           or "data" array (e.g. a single course object, not wrapped in an array).
     * Expectation: The function returns an empty array instead of throwing.
     */
    // Arrange
    const file = makeJsonFile({ code: 'CS401', name: 'Not wrapped in an array' })

    // Act
    const result = await parseJson(file)

    // Assert
    expect(result).toEqual([])
  })

  it('throws an error when the file content is not valid JSON', async () => {
    /**
     * Target: parseJson()
     * Scenario: Edge case where the uploaded file has invalid/corrupted JSON syntax.
     * Expectation: The function rejects with an explicit "Invalid JSON file" error.
     */
    // Arrange
    const file = makeCsvFile('{ this is not valid json ', 'broken.json')

    // Act & Assert
    await expect(parseJson(file)).rejects.toThrow('Invalid JSON file')
  })
})

// ---------------------------------------------------------------------------
// parseExcel
// ---------------------------------------------------------------------------
describe('parseExcel', () => {
  it('parses rows from the first sheet of an Excel workbook', async () => {
    /**
     * Target: parseExcel()
     * Scenario: An .xlsx file contains one sheet with two valid course rows.
     * Expectation: Both rows are parsed and returned as CourseInsert objects.
     */
    // Arrange
    const file = makeXlsxFile([
      { code: 'CS101', name: 'Intro to CS' },
      { code: 'CS102', name: 'Data Structures' },
    ])

    // Act
    const result = await parseExcel(file)

    // Assert
    expect(result).toHaveLength(2)
    expect(result.map((c) => c.code)).toEqual(['CS101', 'CS102'])
  })

  it('ignores sheets after the first one', async () => {
    /**
     * Target: parseExcel()
     * Scenario: The workbook has a second sheet with additional course rows.
     * Expectation: Only rows from the first sheet are included in the result,
     *              per the documented "Only read the first sheet" behavior.
     */
    // Arrange
    const worksheet1 = XLSX.utils.json_to_sheet([{ code: 'CS101', name: 'Intro to CS' }])
    const worksheet2 = XLSX.utils.json_to_sheet([{ code: 'CS999', name: 'Should be ignored' }])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'Sheet1')
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'Sheet2')
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    const file = new File([buffer], 'multi-sheet.xlsx')

    // Act
    const result = await parseExcel(file)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('CS101')
  })

  it('filters out rows lacking name, code, and title', async () => {
    /**
     * Target: parseExcel()
     * Scenario: The sheet contains one identifiable row and one fully empty row.
     * Expectation: Only the identifiable row is returned.
     */
    // Arrange
    const file = makeXlsxFile([
      { code: 'CS101', name: 'Intro to CS' },
      { description: 'No identifying fields here' },
    ])

    // Act
    const result = await parseExcel(file)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('CS101')
  })
})

// ---------------------------------------------------------------------------
// parseFile (unified entry point)
// ---------------------------------------------------------------------------
describe('parseFile', () => {
  it('delegates to parseCsv for .csv files', async () => {
    /**
     * Target: parseFile()
     * Scenario: A file with a ".csv" extension is provided.
     * Expectation: The CSV parsing path is used and the course data is returned.
     */
    // Arrange
    const file = makeCsvFile('code,name\nCS101,Intro to CS\n')

    // Act
    const result = await parseFile(file)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('CS101')
  })

  it('delegates to parseJson for .json files', async () => {
    /**
     * Target: parseFile()
     * Scenario: A file with a ".json" extension is provided.
     * Expectation: The JSON parsing path is used and the course data is returned.
     */
    // Arrange
    const file = makeJsonFile([{ code: 'CS201', name: 'Data Structures' }])

    // Act
    const result = await parseFile(file)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('CS201')
  })

  it('delegates to parseExcel for .xlsx files', async () => {
    /**
     * Target: parseFile()
     * Scenario: A file with a ".xlsx" extension is provided.
     * Expectation: The Excel parsing path is used and the course data is returned.
     */
    // Arrange
    const file = makeXlsxFile([{ code: 'CS301', name: 'Algorithms' }])

    // Act
    const result = await parseFile(file)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('CS301')
  })

  it('throws a descriptive error for unsupported file extensions', async () => {
    /**
     * Target: parseFile()
     * Scenario: Edge case where the file has an unrecognised extension (e.g. ".txt").
     * Expectation: The function throws an error naming the unsupported extension.
     */
    // Arrange
    const file = makeCsvFile('irrelevant content', 'notes.txt')

    // Act & Assert
    await expect(parseFile(file)).rejects.toThrow('Unsupported file type ".txt"')
  })

  it('deduplicates courses sharing the same code, programme, and study_option', async () => {
    /**
     * Target: parseFile() -> deduplicateByCodes()
     * Scenario: The source CSV contains two identical rows for the same course
     *           (same code, programme, and study_option).
     * Expectation: Only the first occurrence is kept in the final result.
     */
    // Arrange
    const csv =
      'code,name,programme,study_option\n' +
      'CS101,Intro to CS,Computer Science,Full-time\n' +
      'CS101,Intro to CS (duplicate),Computer Science,Full-time\n'
    const file = makeCsvFile(csv)

    // Act
    const result = await parseFile(file)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Intro to CS')
  })

  it('keeps rows with the same code but a different study_option as distinct courses', async () => {
    /**
     * Target: parseFile() -> deduplicateByCodes()
     * Scenario: Edge case where two rows share the same code and programme but
     *           differ in study_option (e.g. full-time vs part-time track).
     * Expectation: Both rows are treated as distinct courses and both are kept.
     */
    // Arrange
    const csv =
      'code,name,programme,study_option\n' +
      'CS101,Intro to CS,Computer Science,Full-time\n' +
      'CS101,Intro to CS,Computer Science,Part-time\n'
    const file = makeCsvFile(csv)

    // Act
    const result = await parseFile(file)

    // Assert
    expect(result).toHaveLength(2)
  })
})