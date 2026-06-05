CREATE TABLE IF NOT EXISTS users (
  user_id TEXT UNIQUE NOT NULL,
  email TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS company_workspaces (
  workspace_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS workspace_memberships (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES company_workspaces(workspace_id),
  user_id TEXT NOT NULL REFERENCES users(user_id),
  role TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id),
  workspace_id TEXT NOT NULL REFERENCES company_workspaces(workspace_id),
  issued_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS project_parts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  workspace_id TEXT NOT NULL REFERENCES company_workspaces(workspace_id),
  part_id TEXT NOT NULL,
  drawing_note TEXT NOT NULL,
  material TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  source_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS package_runs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  workspace_id TEXT NOT NULL REFERENCES company_workspaces(workspace_id),
  created_by_user_id TEXT NOT NULL REFERENCES users(user_id),
  created_by_email TEXT NOT NULL REFERENCES users(email),
  request TEXT NOT NULL,
  status TEXT NOT NULL,
  package_id TEXT NOT NULL,
  revision TEXT NOT NULL,
  approval_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS project_level_package_runs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  workspace_id TEXT NOT NULL REFERENCES company_workspaces(workspace_id),
  project_name TEXT NOT NULL,
  parts_json JSONB NOT NULL,
  combined_boq_summary_json JSONB NOT NULL,
  combined_manufacturing_summary_json JSONB NOT NULL,
  combined_quotation_summary_json JSONB NOT NULL,
  approval_status TEXT NOT NULL,
  created_by_email TEXT NOT NULL REFERENCES users(email),
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS risk_classifications (
  id TEXT PRIMARY KEY,
  package_run_id TEXT NOT NULL REFERENCES package_runs(id),
  workflow_type TEXT NOT NULL,
  level INTEGER NOT NULL,
  label TEXT NOT NULL,
  required_approver TEXT NOT NULL,
  rationale TEXT NOT NULL,
  blocked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS approval_gates (
  id TEXT PRIMARY KEY,
  package_run_id TEXT NOT NULL REFERENCES package_runs(id),
  gate_id TEXT NOT NULL,
  required BOOLEAN NOT NULL,
  required_approver TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS approval_decisions (
  id TEXT PRIMARY KEY,
  approval_gate_id TEXT NOT NULL REFERENCES approval_gates(id),
  decision TEXT NOT NULL,
  decided_by TEXT NOT NULL,
  user_email TEXT NOT NULL REFERENCES users(email),
  user_role TEXT NOT NULL,
  reason TEXT NOT NULL,
  decided_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  package_run_id TEXT NOT NULL REFERENCES package_runs(id),
  event_order INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS model_role_audit_events (
  id TEXT PRIMARY KEY,
  package_run_id TEXT NOT NULL REFERENCES package_runs(id),
  event_order INTEGER NOT NULL,
  capability TEXT NOT NULL,
  requested_role TEXT NOT NULL,
  selected_model_ref TEXT NOT NULL,
  fallback_role TEXT,
  sensitive_data_route_role TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS exports (
  id TEXT PRIMARY KEY,
  package_run_id TEXT NOT NULL REFERENCES package_runs(id),
  export_type TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_workspace_id ON workspace_memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_user_id ON workspace_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_parts_project_id ON project_parts(project_id);
CREATE INDEX IF NOT EXISTS idx_project_parts_workspace_id ON project_parts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_package_runs_project_id ON package_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_package_runs_workspace_id ON package_runs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_package_runs_approval_status ON package_runs(approval_status);
CREATE INDEX IF NOT EXISTS idx_project_level_package_runs_project_id ON project_level_package_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_level_package_runs_workspace_id ON project_level_package_runs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_project_level_package_runs_approval_status ON project_level_package_runs(approval_status);
CREATE INDEX IF NOT EXISTS idx_risk_classifications_package_run_id ON risk_classifications(package_run_id);
CREATE INDEX IF NOT EXISTS idx_risk_classifications_level ON risk_classifications(level);
CREATE INDEX IF NOT EXISTS idx_approval_gates_package_run_id ON approval_gates(package_run_id);
CREATE INDEX IF NOT EXISTS idx_approval_gates_status ON approval_gates(status);
CREATE INDEX IF NOT EXISTS idx_approval_decisions_user_email ON approval_decisions(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_events_package_run_id ON audit_events(package_run_id);
CREATE INDEX IF NOT EXISTS idx_model_role_audit_events_package_run_id ON model_role_audit_events(package_run_id);
CREATE INDEX IF NOT EXISTS idx_exports_package_run_id ON exports(package_run_id);
