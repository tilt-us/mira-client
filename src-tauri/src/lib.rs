use std::{path::PathBuf, process::Command};
use tauri::Manager;

#[derive(serde::Serialize)]
struct LauncherStatus {
    game_binary: &'static str,
    connected: bool,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct LaunchGameRequest {
    access_token: String,
    champion: String,
    match_id: String,
    matchmaking_api_base_url: String,
    player_public_id: u64,
    port: u16,
    team: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct LaunchGameResponse {
    game_binary: String,
    pid: u32,
}

#[tauri::command]
fn launcher_status() -> LauncherStatus {
    LauncherStatus {
        game_binary: "mira-moba-client",
        connected: false,
    }
}

#[tauri::command]
fn launch_game(
    app: tauri::AppHandle,
    request: LaunchGameRequest,
) -> Result<LaunchGameResponse, String> {
    let game_binary = resolve_game_binary(&app)?;
    let game_dir = game_binary
        .parent()
        .ok_or_else(|| "Game-Client-Verzeichnis konnte nicht bestimmt werden.".to_string())?;

    let mut command = Command::new(&game_binary);
    command
        .current_dir(game_dir)
        .arg("--access-token")
        .arg(request.access_token)
        .arg("--champion")
        .arg(request.champion)
        .arg("--match-id")
        .arg(request.match_id)
        .arg("--matchmaking-api-base-url")
        .arg(request.matchmaking_api_base_url)
        .arg("--player-public-id")
        .arg(request.player_public_id.to_string())
        .arg("--port")
        .arg(request.port.to_string())
        .arg("--team")
        .arg(request.team);

    let child = command
        .spawn()
        .map_err(|error| format!("Game-Client konnte nicht gestartet werden: {error}"))?;

    Ok(LaunchGameResponse {
        game_binary: game_binary.to_string_lossy().into_owned(),
        pid: child.id(),
    })
}

fn resolve_game_binary(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let binary_name = if cfg!(windows) {
        "mira-moba-client.exe"
    } else {
        "mira-moba-client"
    };

    let mut candidates = Vec::new();

    if let Ok(resource_dir) = app.path().resource_dir() {
        candidates.push(resource_dir.join("files").join(binary_name));
        candidates.push(resource_dir.join(binary_name));
    }

    if let Ok(current_dir) = std::env::current_dir() {
        candidates.push(current_dir.join("files").join(binary_name));
        candidates.push(current_dir.join("..").join("files").join(binary_name));
    }

    candidates.push(
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("..")
            .join("files")
            .join(binary_name),
    );

    if let Ok(current_exe) = std::env::current_exe() {
        if let Some(exe_dir) = current_exe.parent() {
            candidates.push(exe_dir.join("files").join(binary_name));
            candidates.push(exe_dir.join(binary_name));
        }
    }

    candidates
        .into_iter()
        .find(|candidate| candidate.is_file())
        .ok_or_else(|| "files/mira-moba-client wurde nicht gefunden.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![launcher_status, launch_game])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
