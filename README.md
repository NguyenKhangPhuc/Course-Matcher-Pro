# Course Matcher Pro

Course Matcher Pro is a Next.js web application designed to help students, universities, and job seekers align academic coursework with industry requirements. The platform allows users to upload course catalogs in various formats, extracts technical requirements from job descriptions using AI, and performs semantic search to recommend the most relevant courses based on similarity scores and rationales.

## Features & Capabilities

1. Multi-Format Course Catalog Ingestion: Supports uploading course catalogs in Excel (.xlsx, .xls), CSV, JSON, and PDF formats.
2. Automated Schema Normalization: Maps diverse file headers to a canonical database structure and handles data deduplication.
3. AI-Powered Semantic Embedding: Converts course names, descriptions, learning outcomes, and content into 1536-dimensional vector embeddings using OpenAI's text-embedding-3-small model.
4. Vector Search and Cosine Similarity: Stores course data in Supabase utilizing the public.vector extension. Performs fast, indexed similarity searches via a custom Postgres function (match_courses).
5. Real-Time Streaming Analysis: Extracts technical requirements from job descriptions and streams course recommendation analysis using Server-Sent Events (SSE).
6. Course Curation Dashboard: Provides tools to inspect, rename, update, and delete uploaded sources and individual course entries.
7. Search Logs & History: Saves and displays previous analysis matching histories with similarity scores and company/position labels.
8. Usage Controls: Enforces a daily search limit per user using atomic database operations and cron-based resets.
9. Comprehensive Authentication: Supports user registration, login, password recovery, and secure session management via Supabase Auth.

## Project Structure

* app/
  * actions/: Next.js Server Actions for database transactions.
    * authentication.ts: User registration, login, and session actions.
    * course.ts: Operations to fetch, update, and filter courses.
    * search_history.ts: Handles saving, retrieving, and deleting user search logs.
    * source_management.ts: Handles catalog file parsing, OpenAI embeddings generation, and database inserts.
    * usage.ts: Tracks and increments user search counts against daily limits.
  * components/: Shared UI components including navigation, loaders, and toast notifications.
  * context/: Context providers managing global application state like loader overlays and notifications.
  * dashboard/: Search interface, inputs for target job descriptions, and recommendation results.
    * components/AnalysisResultsSection.tsx: Displays streaming match results and scores.
    * components/CourseDataSection.tsx: Lists courses belonging to the selected source.
    * components/TargetJobForm.tsx: Forms for capturing company name, role, and job description.
  * helpers/
    * file_parsing.ts: Extractor parsing tables and documents into structured course objects.
  * history/: History page components displaying prior analyses.
  * services/
    * agent.ts: Axios-based SSE streaming client interface for AI analysis.
  * source-management/: View and curate uploaded documents and course details.
  * utils/
    * supabase/: Server, client, and proxy client instantiations.
* e2e-tests/: Playwright end-to-end browser test suites.
* supabase/
  * migrations/: SQL files containing table schemas, indexes, RLS policies, triggers, and functions.
* unit-tests/: Jest unit tests validating individual helper methods.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Next.js | React framework for server rendering, routing, and api routes |
| React | Frontend interface building |
| TypeScript | Type safety and documentation |
| Supabase | Backend Database (PostgreSQL), Vector Extensions, and Authentication |
| OpenAI API | Embedding generation and LLM analysis |
| Tailwind CSS | Utility-first styling |
| MUI (Material UI) | Component library for interface design |
| Framer Motion | Smooth page transitions and micro-animations |
| Playwright | End-to-end testing |
| Jest | Unit testing |
| xlsx | Excel sheet parsing |
| papaparse | CSV formatting and parsing |
| pdfjs-dist | PDF text extraction |

## Installation & Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd course-matcher-pro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a .env.local file in the root directory and define the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_API_URL=your_backend_api_url
   ```

4. Apply database migrations:
   Ensure your Supabase project has the database migrations applied. You can push migrations using the Supabase CLI:
   ```bash
   supabase db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser to view the application.

6. Run test suites:
   * Run Unit Tests:
     ```bash
     npm run test
     ```
   * Run E2E Tests:
     ```bash
     npm run e2e
     ```

## Usage Examples

### Uploading a Catalog
1. Sign in to the application and navigate to the Source Management page.
2. Drag and drop or browse to select your course catalog file (.xlsx, .csv, .json, or .pdf).
3. The catalog will be uploaded, parsed, embedded, and saved automatically.

### Running an AI Recommendation Search
1. Go to the Dashboard page.
2. Select your uploaded course catalog from the Source dropdown.
3. Fill in the Company Name, Position, and paste the job description text.
4. Select the target Programme and click Analyze.
5. Review the extracted requirements and matched courses.
6. Click Save Search to persist this query to your history.

## Contribution Guidelines & License

All contributions must follow the Conventional Commits specification. Ensure Jest and Playwright test suites pass before submitting pull requests.

This project is licensed under the MIT License.
