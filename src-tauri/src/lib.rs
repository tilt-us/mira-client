#[derive(serde::Serialize)]
struct LauncherStatus {
    game_binary: &'static str,
    connected: bool,
}

#[tauri::command]
fn launcher_status() -> LauncherStatus {
    LauncherStatus {
        game_binary: "mira-moba-client",
        connected: false,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![launcher_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
