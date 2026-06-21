import { useEffect } from "react";
import "./App.css";
import TitleBar from "./components/TitleBar";
import { NotificationProvider } from "./notifications";
import Authentication from "./pages/Authentication";

function App() {
  useEffect(() => {
    function preventContextMenu(event: MouseEvent) {
      event.preventDefault();
    }

    window.addEventListener("contextmenu", preventContextMenu);

    return () => {
      window.removeEventListener("contextmenu", preventContextMenu);
    };
  }, []);

  return (
    <NotificationProvider>
      <TitleBar />
      <Authentication />
    </NotificationProvider>
  );
}

export default App;
