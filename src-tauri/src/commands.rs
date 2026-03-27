use tauri::{AppHandle, Runtime};

#[tauri::command]
pub fn update_tray_title<R: Runtime>(app: AppHandle<R>, title: String) {
    if let Some(tray) = app.tray_by_id("burnrate-tray") {
        let _ = tray.set_title(Some(&title));
    }
}
