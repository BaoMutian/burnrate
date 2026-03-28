use tauri::{AppHandle, Manager, Runtime};

#[tauri::command]
pub fn update_tray_title<R: Runtime>(app: AppHandle<R>, title: String) {
    if let Some(tray) = app.tray_by_id("burnrate-tray") {
        let _ = tray.set_title(Some(&title));
    }
}

#[tauri::command]
pub fn animate_panel_size<R: Runtime>(app: AppHandle<R>, width: f64, height: f64) {
    if let Some(window) = app.get_webview_window("panel") {
        #[cfg(target_os = "macos")]
        {
            use objc2_app_kit::NSWindow;
            use objc2_foundation::{NSPoint, NSRect, NSSize};

            let clamped_width = width.max(0.0);
            let clamped_height = height.max(0.0);

            let _ = window.run_on_main_thread({
                let window = window.clone();
                move || unsafe {
                    if let Ok(ns_window) = window.ns_window() {
                        let ns_window: &NSWindow = &*ns_window.cast();
                        let frame = ns_window.frame();
                        let next_origin_y = frame.origin.y + frame.size.height - clamped_height;
                        let next_frame = NSRect::new(
                            NSPoint::new(frame.origin.x, next_origin_y),
                            NSSize::new(clamped_width, clamped_height),
                        );
                        ns_window.setFrame_display_animate(next_frame, false, true);
                    }
                }
            });
            return;
        }

        #[cfg(not(target_os = "macos"))]
        {
            let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize::new(width, height)));
        }
    }
}
