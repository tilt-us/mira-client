import { LogIn } from "lucide-react";
import "./App.css";

function App() {
  return (
    <main className="app-shell">
      <section className="login-window" aria-labelledby="login-title">
        <div className="login-header">
          <div className="brand-mark">M</div>
          <div>
            <h1 id="login-title">Mira Login</h1>
            <p>Account anmelden</p>
          </div>
        </div>

        <form className="login-form">
          <label>
            Benutzername
            <input autoComplete="username" placeholder="Benutzername" />
          </label>

          <label>
            Passwort
            <input
              autoComplete="current-password"
              placeholder="Passwort"
              type="password"
            />
          </label>

          <button className="login-button" type="submit">
            <LogIn size={18} />
            Einloggen
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
