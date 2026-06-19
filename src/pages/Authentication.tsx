import { useEffect, useMemo, useState, type FormEvent } from "react";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import {
  loginOptions,
  me,
  register,
  setApiAccessToken,
  type UserProfileResponse,
} from "../api/client";
import { getApiTransport } from "../api/http";
import {
  completeRedirectLogin,
  loginWithPassword,
  startGoogleLogin,
} from "../auth/keycloak";
import { clearTokens, readTokens, saveTokens } from "../auth/storage";

type AuthMode = "login" | "register";
type LoadState = "idle" | "loading";

function getErrorMessage(error: unknown, fallback = "Aktion fehlgeschlagen.") {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const errorObject = error as {
      error?: unknown;
      error_description?: unknown;
      message?: unknown;
      status?: unknown;
    };

    for (const value of [
      errorObject.message,
      errorObject.error_description,
      errorObject.error,
      errorObject.status,
    ]) {
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return fallback;
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="18"
      viewBox="0 0 18 18"
      width="18"
    >
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
        fill="#4285f4"
      />
      <path
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.35 0-4.34-1.58-5.05-3.72H.93v2.33A9 9 0 0 0 9 18Z"
        fill="#34a853"
      />
      <path
        d="M3.95 10.7A5.41 5.41 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.93A9 9 0 0 0 0 9c0 1.45.34 2.82.93 4.03l3.02-2.33Z"
        fill="#fbbc05"
      />
      <path
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.65 8.65 0 0 0 9 0 9 9 0 0 0 .93 4.97L3.95 7.3C4.66 5.16 6.65 3.58 9 3.58Z"
        fill="#ea4335"
      />
    </svg>
  );
}

function Authentication() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [providers, setProviders] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfileResponse>();
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerDisplayName, setRegisterDisplayName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [loadState, setLoadState] = useState<LoadState>("idle");

  const googleEnabled = useMemo(
    () => providers.length === 0 || providers.includes("google"),
    [providers],
  );

  async function loadProfile(accessToken: string) {
    setApiAccessToken(accessToken);
    const result = await me();

    if (result.error) {
      throw new Error("Profil konnte nicht geladen werden.");
    }

    if (!result.data) {
      throw new Error("Profilantwort war leer.");
    }

    setProfile(result.data);
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth() {
      try {
        const redirectTokens = await completeRedirectLogin();

        if (cancelled) {
          return;
        }

        const existingTokens = redirectTokens ?? readTokens();

        if (redirectTokens) {
          saveTokens(redirectTokens);
          setStatus("Google-Anmeldung erfolgreich.");
        }

        if (existingTokens?.accessToken) {
          await loadProfile(existingTokens.accessToken);
        }
      } catch (caughtError) {
        clearTokens();
        setApiAccessToken(undefined);
        setError(getErrorMessage(caughtError));
      }
    }

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLoginOptions() {
      const result = await loginOptions();

      if (!cancelled && result.data?.providers) {
        setProviders(result.data.providers);
      }
    }

    void loadLoginOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadState("loading");
    setError(undefined);
    setStatus(undefined);

    try {
      const tokens = await loginWithPassword(loginName, loginPassword);
      saveTokens(tokens);
      await loadProfile(tokens.accessToken);
      setStatus("Anmeldung erfolgreich.");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoadState("idle");
    }
  }

  async function handleRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadState("loading");
    setError(undefined);
    setStatus(undefined);

    const registrationRequest = {
      email: registerEmail.trim(),
      password: registerPassword,
      displayName: registerDisplayName.trim(),
    };

    if (!registrationRequest.displayName) {
      setLoadState("idle");
      setError("Anzeigename ist erforderlich.");
      return;
    }

    try {
      const result = await register({
        body: registrationRequest,
      });

      if (result.error) {
        throw result.error;
      }

      setAuthMode("login");
      setLoginName(registrationRequest.email);
      setStatus(
        result.data?.message ??
          "Registrierung erfolgreich. Du kannst dich jetzt anmelden.",
      );
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Registrierung fehlgeschlagen."));
    } finally {
      setLoadState("idle");
    }
  }

  async function handleGoogleLogin() {
    setLoadState("loading");
    setError(undefined);
    setStatus(undefined);

    try {
      await startGoogleLogin();
    } catch (caughtError) {
      setLoadState("idle");
      setError(getErrorMessage(caughtError));
    }
  }

  function handleLogout() {
    clearTokens();
    setApiAccessToken(undefined);
    setProfile(undefined);
    setLoginPassword("");
    setStatus("Abgemeldet.");
  }

  const busy = loadState === "loading";
  const runtimeInfo = `${window.location.origin} · ${getApiTransport()}`;

  return (
    <main className="app-shell">
      <section className="login-window" aria-labelledby="login-title">
        <div className="login-header">
          <div className="brand-mark">M</div>
          <div>
            <h1 id="login-title">Mira Account</h1>
            <p>{profile ? "Angemeldet" : "Anmelden oder registrieren"}</p>
          </div>
        </div>

        {profile ? (
          <div className="profile-panel">
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{profile.displayName ?? profile.preferredUsername ?? "-"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{profile.email ?? "-"}</dd>
              </div>
            </dl>

            <button className="secondary-button" type="button" onClick={handleLogout}>
              <LogOut size={18} />
              Abmelden
            </button>
          </div>
        ) : (
          <>
            <div className="mode-tabs" role="tablist" aria-label="Auth mode">
              <button
                aria-selected={authMode === "login"}
                className={authMode === "login" ? "active" : ""}
                role="tab"
                type="button"
                onClick={() => setAuthMode("login")}
              >
                Anmelden
              </button>
              <button
                aria-selected={authMode === "register"}
                className={authMode === "register" ? "active" : ""}
                role="tab"
                type="button"
                onClick={() => setAuthMode("register")}
              >
                Registrieren
              </button>
            </div>

            {authMode === "login" ? (
              <div className="auth-stack">
                <form className="login-form" onSubmit={handlePasswordLogin}>
                  <label>
                    Email oder Benutzername
                    <input
                      autoComplete="username"
                      placeholder="name@example.com"
                      required
                      value={loginName}
                      onChange={(event) => setLoginName(event.target.value)}
                    />
                  </label>

                  <label>
                    Passwort
                    <input
                      autoComplete="current-password"
                      placeholder="Passwort"
                      required
                      type="password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                    />
                  </label>

                  <button className="login-button" disabled={busy} type="submit">
                    <LogIn size={18} />
                    {busy ? "Anmelden..." : "Einloggen"}
                  </button>

                  <button
                    className="provider-button"
                    disabled={busy || !googleEnabled}
                    type="button"
                    onClick={handleGoogleLogin}
                  >
                    <GoogleIcon />
                    Mit Google anmelden
                  </button>
                </form>
              </div>
            ) : (
              <form className="login-form" onSubmit={handleRegistration}>
                <label>
                  Anzeigename
                  <input
                    autoComplete="name"
                    placeholder="Username"
                    required
                    value={registerDisplayName}
                    onChange={(event) =>
                      setRegisterDisplayName(event.target.value)
                    }
                  />
                </label>

                <label>
                  Email
                  <input
                    autoComplete="email"
                    placeholder="name@example.com"
                    required
                    type="email"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                  />
                </label>

                <label>
                  Passwort
                  <input
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="Mindestens 12 Zeichen"
                    required
                    type="password"
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                  />
                </label>

                <button className="login-button" disabled={busy} type="submit">
                  <UserPlus size={18} />
                  {busy ? "Registrieren..." : "Account erstellen"}
                </button>
              </form>
            )}
          </>
        )}

        {status ? <p className="message success">{status}</p> : null}
        {error ? <p className="message error">{error}</p> : null}
        <p className="runtime-info">{runtimeInfo}</p>
      </section>
    </main>
  );
}

export default Authentication;
