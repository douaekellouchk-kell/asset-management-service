DELETE FROM users WHERE email = 'admin@test.com';

INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@test.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYuJ0u.5jIy',
    'Admin',
    'User',
    'ADMIN',
    true,
    NOW(),
    NOW()
);