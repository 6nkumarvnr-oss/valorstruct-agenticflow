type ViteImportMeta = ImportMeta & {
  env?: Record<string, string | undefined>;
};

const env = (import.meta as ViteImportMeta).env ?? {};

export const AGENTICFLOW_API_BASE_URL = env.VITE_AGENTICFLOW_API_BASE_URL ?? 'http://localhost:8000';
export const AGENTICFLOW_DEMO_MODE = (env.VITE_AGENTICFLOW_DEMO_MODE ?? 'true').toLowerCase() === 'true';
