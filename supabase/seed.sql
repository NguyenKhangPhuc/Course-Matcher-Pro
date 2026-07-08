-- Seed file to create a default confirmed user, course data, and search history for E2E testing
-- User Email: nguyenkhangphuc012024@gmail.com
-- User Password: 1231232312123

-- 1. Insert user
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
    'authenticated',
    'authenticated',
    'nguyenkhangphuc012024@gmail.com',
    extensions.crypt('1231232312123', extensions.gen_salt('bf', 10)),
    NOW(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Nguyen Khang Phuc","email":"nguyenkhangphuc012024@gmail.com"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert user identity for auth provider
INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
    'nguyenkhangphuc012024@gmail.com',
    'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
    '{"sub":"a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3","email":"nguyenkhangphuc012024@gmail.com","email_verified":true}',
    'email',
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- 3. Insert mock source
INSERT INTO public.sources (
    id,
    user_id,
    name,
    file_type,
    is_default,
    created_at,
    updated_at
) VALUES (
    'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2',
    'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
    'example.xlsx',
    'excel',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert mock courses
INSERT INTO public.courses (
    id,
    source_id,
    code,
    name,
    title,
    programme,
    degree_type,
    study_option,
    credits,
    description,
    learning_outcomes,
    content,
    prerequisites,
    assessment,
    instructor,
    url,
    embedding,
    searchable_text,
    created_at
) VALUES 
(
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1',
    'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2',
    'CS101',
    'Introduction to Computer Science',
    'Introduction to Computer Science',
    'Software Engineering',
    'Bachelor',
    'Full-time',
    '4',
    'Learn programming fundamentals using Python.',
    'Understand basic variables, loops, functions, and OOP principles.',
    'Variables, loops, arrays, functions, structures, basic OOP.',
    'None',
    'Exams 50%, Labs 50%',
    'Dr. John Smith',
    'http://example.com/cs101',
    NULL,
    'Course: Introduction to Computer Science\nProgramme: Software Engineering\nDescription: Learn programming fundamentals using Python.',
    NOW()
),
(
    'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2',
    'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2',
    'SE302',
    'Advanced Web Development',
    'Advanced Web Development',
    'Software Engineering',
    'Bachelor',
    'Full-time',
    '3',
    'Modern frontend development with React, TypeScript, and Next.js.',
    'Build single page applications with rich styling, state management, and SSR.',
    'HTML/CSS, ES6+, TypeScript, React Hooks, Next.js routing, SSR & SSG.',
    'CS101',
    'Project 60%, Assignments 40%',
    'Prof. Jane Doe',
    'http://example.com/se302',
    NULL,
    'Course: Advanced Web Development\nProgramme: Software Engineering\nDescription: Modern frontend development with React, TypeScript, and Next.js.',
    NOW()
),
(
    'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
    'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2',
    'AI401',
    'Artificial Intelligence Fundamentals',
    'Artificial Intelligence Fundamentals',
    'Data Science',
    'Bachelor',
    'Full-time',
    '4',
    'Deep dive into machine learning models, search algorithms, and neural networks.',
    'Implement basic regression, classification, and neural network algorithms.',
    'Search algorithms, logic, regression models, CNNs, RNNs.',
    'CS101',
    'Midterm 30%, Final 40%, Lab Projects 30%',
    'Dr. Alan Turing',
    'http://example.com/ai401',
    NULL,
    'Course: Artificial Intelligence Fundamentals\nProgramme: Data Science\nDescription: Deep dive into machine learning models, search algorithms, and neural networks.',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert search history
INSERT INTO public.search_history (
    id,
    user_id,
    source_id,
    company_name,
    job_description,
    technical_requirements,
    created_at,
    position,
    summary,
    programme
) VALUES (
    'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5',
    'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
    'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2',
    'Awesome Tech Corp',
    'We are looking for a Senior Backend Developer who knows Python programming, OOP principles, and web APIs.',
    'Python, OOP principles, Web APIs',
    NOW(),
    'Senior Backend Developer',
    'Matches were successfully generated for backend engineering.',
    'Software Engineering'
) ON CONFLICT (id) DO NOTHING;

-- 6. Insert search matches
INSERT INTO public.search_matches (
    id,
    search_id,
    course_id,
    similarity,
    created_at
) VALUES 
(
    'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
    'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5',
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1',
    89.5,
    NOW()
),
(
    'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
    'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5',
    'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2',
    65.2,
    NOW()
) ON CONFLICT (id) DO NOTHING;
