/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_API_KEY: string
  readonly VITE_GOOGLE_DRIVE_FOLDER_ID: string
  /** Base URL for Phase 7 sync (FastAPI), e.g. http://localhost:8000 */
  readonly VITE_SYNC_API_BASE?: string
  /** UUID matching `tenants.id` in Postgres (see apps/api migrations). */
  readonly VITE_SYNC_TENANT_ID?: string
  /** Optional bearer token when API has SYNC_API_KEY set. */
  readonly VITE_SYNC_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
