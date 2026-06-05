import { useState } from 'react';
import { demoPassword, demoUsers, useAuthContext } from '../state/AuthContext.js';

interface LoginFieldEvent {
  target: {
    value: string;
  };
}

export function LoginPage() {
  const auth = useAuthContext();
  const [email, setEmail] = useState('senior.engineer@valorstruct.local');
  const [password, setPassword] = useState(demoPassword);

  return (
    <main className="login-page">
      <header>
        <p>VALOR STRUCT / AGENTICFLOW</p>
        <h1>Login</h1>
        <p>MVP local auth only — production identity, secure password hashing, token expiry, and SSO hardening come later.</p>
      </header>

      <section aria-label="Login Form">
        <label>Email input
          <input name="email" type="email" value={email} onChange={(event: LoginFieldEvent) => setEmail(event.target.value)} />
        </label>
        <label>Password input
          <input name="password" type="password" value={password} onChange={(event: LoginFieldEvent) => setPassword(event.target.value)} />
        </label>
        <button type="button" onClick={() => auth.login(email, password)}>login button</button>
        <p>login status/error message: {auth.loginStatus}</p>
      </section>

      <section aria-label="Demo User Hint Section">
        <h2>demo user hint section</h2>
        <p>All deterministic demo users use password {demoPassword}.</p>
        <ul>
          {demoUsers.map((user) => (
            <li key={user.email}>{user.email} — {user.role}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default LoginPage;
