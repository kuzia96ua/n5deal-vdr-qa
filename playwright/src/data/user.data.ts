export interface TestUser {
  email: string;
  pass: string;
  name?: string;
}

export const TEST_USERS = {
  OWNER: {
    email: 'john@example.com',
    pass: 'johnpass',
    name: 'John Doe',
  },
  VIEWER: {
    email: 'viewer@example.com',
    pass: 'viewerpass',
    name: 'Viewer',
  },
  INVALID: {
    email: 'nonexistent_user@example.com',
    pass: 'wrongpassword123',
    malformedEmail: 'invalid-email-format',
    shortPassword: 'short',
  },
} as const;
