import { useState } from 'react';

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  role: string;
}

export interface WorkspaceContext {
  workspaceId: string;
  companyName: string;
}

export const demoUsers: AuthUser[] = [
  { userId: 'user-owner', email: 'owner@valorstruct.local', displayName: 'Valor Struct Owner', role: 'Owner' },
  { userId: 'user-admin', email: 'admin@valorstruct.local', displayName: 'Valor Struct Admin', role: 'Admin' },
  { userId: 'user-senior-engineer', email: 'senior.engineer@valorstruct.local', displayName: 'Senior Structural Engineer', role: 'Senior Structural Engineer' },
  { userId: 'user-engineer', email: 'engineer@valorstruct.local', displayName: 'Project Engineer', role: 'Engineer' },
  { userId: 'user-reviewer', email: 'reviewer@valorstruct.local', displayName: 'Package Reviewer', role: 'Reviewer' },
  { userId: 'user-viewer', email: 'viewer@valorstruct.local', displayName: 'Read-only Viewer', role: 'Viewer' },
  { userId: 'user-agent', email: 'agent@valorstruct.local', displayName: 'AgenticFlow Agent', role: 'Agent' },
];

export const demoWorkspace: WorkspaceContext = {
  workspaceId: 'valor-demo-workspace',
  companyName: 'Valor Struct Demo Workspace',
};

export const demoPassword = 'ValorDemo123!';

export function createDemoToken(user: AuthUser): string {
  return `demo-token-${user.userId}`;
}

export function userCanApproveLevel(user: AuthUser | null, level: number): boolean {
  if (!user) return false;
  const allowedByLevel: Record<number, string[]> = {
    0: ['Agent', 'Engineer', 'Reviewer', 'Admin', 'Owner'],
    1: ['Engineer', 'Reviewer', 'Admin', 'Owner'],
    2: ['Reviewer', 'Senior Structural Engineer', 'Admin', 'Owner'],
    3: ['Senior Structural Engineer', 'Admin', 'Owner'],
    4: ['Owner'],
  };
  return (allowedByLevel[level] ?? []).includes(user.role);
}

export function useAuthContext() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(demoUsers[2]);
  const [token, setToken] = useState<string | null>(createDemoToken(demoUsers[2]));
  const [workspace, setWorkspace] = useState<WorkspaceContext | null>(demoWorkspace);
  const [loginStatus, setLoginStatus] = useState('Authenticated as deterministic demo Senior Structural Engineer.');

  const login = (email: string, password: string) => {
    const user = demoUsers.find((candidate) => candidate.email === email) ?? null;
    if (!user || password !== demoPassword) {
      setCurrentUser(null);
      setToken(null);
      setWorkspace(null);
      setLoginStatus('Login failed: invalid MVP demo credentials.');
      return false;
    }
    setCurrentUser(user);
    setToken(createDemoToken(user));
    setWorkspace(demoWorkspace);
    setLoginStatus(`Login succeeded for ${user.email}.`);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    setWorkspace(null);
    setLoginStatus('Logged out of MVP local auth session.');
  };

  const hasRole = (allowedRoles: string[]) => Boolean(currentUser && allowedRoles.includes(currentUser.role));

  return {
    currentUser,
    token,
    workspace,
    login,
    logout,
    isAuthenticated: Boolean(currentUser && token),
    hasRole,
    loginStatus,
  };
}
