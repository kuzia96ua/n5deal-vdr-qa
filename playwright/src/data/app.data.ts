export const APP_CONFIG = {
  WEB_BASE_URL: 'https://virtual-data-room-ten.vercel.app',
  API_BASE_URL: 'https://virtual-data-room-production.up.railway.app',
} as const;

export const VALIDATION_MESSAGES = {
  INVALID_EMAIL: 'Enter a valid email',
  SHORT_PASSWORD: 'Password must be at least 8 characters',
  EMPTY_FOLDER_NAME: 'Enter a folder name',
  DUPLICATE_FOLDER: 'already exists here',
  RESOURCE_NOT_FOUND: 'Resource not found',
  REVOKED_LINK_TITLE: 'This link has been revoked',
} as const;

export const TOAST_MESSAGES = {
  ACCOUNT_CREATED: 'Account created',
  FOLDER_CREATED: 'Folder created',
  FOLDER_RENAMED: 'Folder renamed',
  PUBLIC_LINK_CREATED: 'Public link created',
  PUBLIC_LINK_REVOKED: 'Public link revoked',
  LINK_COPIED: 'Link copied',
  DATA_ROOM_CREATED: 'Data room created',
  INVALID_CREDENTIALS: 'Invalid email or password',
} as const;

export const UI_MESSAGES = {
  UPLOADS_COMPLETE: 'Uploads complete',
} as const;

export const TEST_FILES = {
  SAMPLE_PDF_RELATIVE: 'src/data/sample.pdf',
} as const;
