import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Settings, Square, X } from "lucide-react";

function runWindowCommand(command: () => Promise<void>) {
  if (!isTauri()) {
    return;
  }

  void command();
}

function TitleBar() {
  function handleSettings() {
    window.dispatchEvent(new Event("mira:settings-request"));
  }

  function handleDrag() {
    runWindowCommand(() => getCurrentWindow().startDragging());
  }

  function handleMinimize() {
    runWindowCommand(() => getCurrentWindow().minimize());
  }

  function handleMaximize() {
    runWindowCommand(() => getCurrentWindow().toggleMaximize());
  }

  function handleClose() {
    const closeEvent = new Event("mira:close-request", { cancelable: true });

    if (!window.dispatchEvent(closeEvent)) {
      return;
    }

    runWindowCommand(() => getCurrentWindow().close());
  }

  return (
    <header className="titlebar" onMouseDown={handleDrag}>
      <div className="titlebar-brand">
        <span className="titlebar-mark">M</span>
        <span>Mira Client</span>
      </div>

      <div className="titlebar-controls" onMouseDown={(event) => event.stopPropagation()}>
        <button
          aria-label="Settings"
          title="Settings"
          type="button"
          onClick={handleSettings}
        >
          <Settings size={15} />
        </button>
        <button aria-label="Minimieren" type="button" onClick={handleMinimize}>
          <Minus size={15} />
        </button>
        <button aria-label="Maximieren" type="button" onClick={handleMaximize}>
          <Square size={13} />
        </button>
        <button
          aria-label="Schliessen"
          className="titlebar-close"
          type="button"
          onClick={handleClose}
        >
          <X size={16} />
        </button>
      </div>
    </header>
  );
}

export default TitleBar;
