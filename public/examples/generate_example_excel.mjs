/**
 * generate_example_excel.mjs
 * --------------------------
 * Generates public/examples/courses_example.xlsx using the xlsx (SheetJS)
 * library already installed in the project.
 *
 * Run from the project root:
 *   node public/examples/generate_example_excel.mjs
 */

import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Course data — same 5 courses as CSV / JSON examples ──────────────────────
const rows = [
  {
    programme: "Computer Science",
    degree_type: "Bachelor",
    study_option: "Full-time",
    title: "Introduction to Programming",
    code: "CS101",
    id: "1001",
    name: "Introduction to Programming",
    credits: "6",
    learning_outcomes:
      "Understand fundamental programming concepts; Write clean and readable code; Debug and test simple programs; Apply problem-solving strategies",
    content:
      "Variables and data types; Control flow (if/else, loops); Functions and scope; Introduction to arrays and strings; Basic file I/O",
    instructor: "Dr. Alice Nguyen",
    description: "",
    prerequisites: "",
    assessment: "Written exam 40%; Programming assignments 40%; Lab participation 20%",
    url: "https://university.edu/courses/cs101",
    start_date: "2026-09-01",
    end_date: "2026-12-15",
    enrollment_start_date: "2026-06-01",
    enrollment_end_date: "2026-08-25",
    "1st_YEAR_1P": "x",
    "1st_YEAR_2P": "x",
  },
  {
    programme: "Computer Science",
    degree_type: "Bachelor",
    study_option: "Full-time",
    title: "Data Structures and Algorithms",
    code: "CS201",
    id: "1002",
    name: "Data Structures and Algorithms",
    credits: "6",
    learning_outcomes:
      "Implement common data structures; Analyse algorithm time and space complexity; Choose appropriate data structures for a given problem",
    content:
      "Linked lists; Stacks and queues; Trees and graphs; Sorting and searching algorithms; Big-O notation",
    instructor: "Prof. John Smith",
    description: "",
    prerequisites: "CS101",
    assessment: "Written exam 50%; Programming assignments 35%; Quizzes 15%",
    url: "https://university.edu/courses/cs201",
    start_date: "2027-01-10",
    end_date: "2027-03-20",
    enrollment_start_date: "2026-11-01",
    enrollment_end_date: "2027-01-05",
    "2nd_YEAR_1P": "x",
  },
  {
    programme: "Computer Science",
    degree_type: "Bachelor",
    study_option: "Full-time",
    title: "Database Systems",
    code: "CS301",
    id: "1003",
    name: "Database Systems",
    credits: "5",
    learning_outcomes:
      "Design relational schemas; Write complex SQL queries; Understand transaction management; Apply normalisation techniques",
    content:
      "Entity-Relationship modelling; SQL (DDL & DML); Joins and subqueries; Normalisation (1NF-3NF); Indexing and query optimisation; Transactions and ACID properties",
    instructor: "Dr. Maria Santos",
    description: "",
    prerequisites: "CS201",
    assessment: "Project 40%; Midterm exam 30%; Weekly SQL exercises 30%",
    url: "https://university.edu/courses/cs301",
    start_date: "2027-01-10",
    end_date: "2027-03-20",
    enrollment_start_date: "2026-11-01",
    enrollment_end_date: "2027-01-05",
    "2nd_YEAR_2P": "x",
  },
  {
    programme: "Computer Science",
    degree_type: "Bachelor",
    study_option: "Part-time",
    title: "Cloud Computing Fundamentals",
    code: "CS402",
    id: "1004",
    name: "Cloud Computing Fundamentals",
    credits: "5",
    learning_outcomes:
      "Deploy applications on cloud platforms; Configure virtual machines and storage; Apply cloud security best practices",
    content:
      "Cloud service models (IaaS, PaaS, SaaS); AWS and Azure basics; Containerisation with Docker; Serverless architectures; Cloud cost management",
    instructor: "Dr. Kevin Lee",
    description: "",
    prerequisites: "CS301",
    assessment: "Cloud project 50%; Presentations 20%; Online quizzes 30%",
    url: "https://university.edu/courses/cs402",
    start_date: "2027-03-21",
    end_date: "2027-05-30",
    enrollment_start_date: "2027-01-06",
    enrollment_end_date: "2027-03-15",
    "2nd_YEAR_3P": "x",
  },
  {
    programme: "Artificial Intelligence",
    degree_type: "Master",
    study_option: "Full-time",
    title: "Machine Learning",
    code: "AI501",
    id: "1005",
    name: "Machine Learning",
    credits: "7",
    learning_outcomes:
      "Build and evaluate supervised and unsupervised models; Apply feature engineering techniques; Interpret model outputs",
    content:
      "Linear and logistic regression; Decision trees and random forests; Neural networks; Model evaluation metrics; Cross-validation; Bias-variance tradeoff",
    instructor: "Prof. Sarah Kim",
    description: "",
    prerequisites: "CS201",
    assessment: "Research paper 30%; Implementation projects 40%; Final exam 30%",
    url: "https://university.edu/courses/ai501",
    start_date: "2026-09-01",
    end_date: "2026-12-15",
    enrollment_start_date: "2026-06-01",
    enrollment_end_date: "2026-08-25",
    "1st_YEAR_1P": "x",
  },
];

// ── Đảm bảo TẤT CẢ các dòng có đủ cột (kể cả khi 1 course không active ở
//    period nào đó) để header của sheet luôn đủ 14 cột timing + các field
//    còn lại, tránh thiếu cột khi SheetJS tự suy ra header từ union of keys ──
const TIMING_COLUMNS = [
  "1st_YEAR_1P", "1st_YEAR_2P", "1st_YEAR_3P", "1st_YEAR_4P", "1st_YEAR_5P",
  "2nd_YEAR_1P", "2nd_YEAR_2P", "2nd_YEAR_3P", "2nd_YEAR_4P", "2nd_YEAR_5P",
  "3rd_YEAR_1P", "3rd_YEAR_2P", "3rd_YEAR_3P", "3rd_YEAR_4P",
];

const COLUMN_ORDER = [
  "programme", "degree_type", "study_option", "title", "code", "id", "name",
  "credits", "learning_outcomes", "content", "instructor", "description",
  "prerequisites", "assessment", "url",
  "start_date", "end_date", "enrollment_start_date", "enrollment_end_date",
  ...TIMING_COLUMNS,
];

const normalizedRows = rows.map((row) => {
  const full = {};
  for (const col of COLUMN_ORDER) {
    full[col] = row[col] ?? "";
  }
  return full;
});

// ── Build workbook ────────────────────────────────────────────────────────────
const worksheet = XLSX.utils.json_to_sheet(normalizedRows, { header: COLUMN_ORDER });

// ── Column widths (rough guides for readability) ──────────────────────────────
worksheet["!cols"] = [
  { wch: 22 },  // programme
  { wch: 12 },  // degree_type
  { wch: 12 },  // study_option
  { wch: 35 },  // title
  { wch: 8 },   // code
  { wch: 8 },   // id
  { wch: 35 },  // name
  { wch: 8 },   // credits
  { wch: 60 },  // learning_outcomes
  { wch: 60 },  // content
  { wch: 20 },  // instructor
  { wch: 40 },  // description
  { wch: 20 },  // prerequisites
  { wch: 40 },  // assessment
  { wch: 40 },  // url
  { wch: 12 },  // start_date
  { wch: 12 },  // end_date
  { wch: 14 },  // enrollment_start_date
  { wch: 14 },  // enrollment_end_date
  ...TIMING_COLUMNS.map(() => ({ wch: 12 })),
];

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");

// ── Write to disk ─────────────────────────────────────────────────────────────
const outputPath = path.join(__dirname, "courses_example.xlsx");
XLSX.writeFile(workbook, outputPath);

console.log(`Generated: ${outputPath}`);
