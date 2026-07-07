-- Seed file to create a default confirmed user for E2E testing
-- User Email: nguyenkhangphuc012024@gmail.com
-- User Password: 1231232312123

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
