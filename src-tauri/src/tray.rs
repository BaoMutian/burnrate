use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, Runtime,
};

const PANEL_WIDTH: f64 = 312.0;
const PANEL_HEIGHT: f64 = 432.0;

pub fn create_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let quit = MenuItemBuilder::with_id("quit", "Quit BurnRate").build(app)?;
    let menu = MenuBuilder::new(app).item(&quit).build()?;

    let tray = TrayIconBuilder::with_id("burnrate-tray")
        .icon(Image::new_owned(vec![0, 0, 0, 0], 1, 1))
        .icon_as_template(true)
        .title("$0/mo")
        .tooltip("BurnRate")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| {
            if event.id() == "quit" {
                app.exit(0);
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                rect,
                ..
            } = event
            {
                let app = tray.app_handle();
                toggle_panel(app, &rect);
            }
        })
        .build(app)?;

    // Remove icon so only the title text shows in the menu bar
    let _ = tray.set_icon(None);

    Ok(())
}

#[cfg(target_os = "macos")]
fn bring_panel_to_front<R: Runtime>(app: &AppHandle<R>, window: &tauri::WebviewWindow<R>) {
    use objc2_app_kit::{NSApplication, NSWindow};
    use objc2_foundation::MainThreadMarker;

    let _ = app.show();
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.run_on_main_thread({
        let window = window.clone();
        move || unsafe {
            if let Some(mtm) = MainThreadMarker::new() {
                let app = NSApplication::sharedApplication(mtm);
                #[allow(deprecated)]
                app.activateIgnoringOtherApps(true);
            }

            if let Ok(ns_window) = window.ns_window() {
                let ns_window: &NSWindow = &*ns_window.cast();
                ns_window.makeKeyAndOrderFront(None);
                ns_window.orderFrontRegardless();
            }
        }
    });
}

fn toggle_panel<R: Runtime>(
    app: &AppHandle<R>,
    rect: &tauri::Rect,
) {
    if let Some(window) = app.get_webview_window("panel") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
            return;
        }

        let scale = window.scale_factor().unwrap_or(1.0);
        let panel_width = PANEL_WIDTH;
        let panel_height = PANEL_HEIGHT;

        // Convert rect position and size to physical pixels
        let rect_pos = rect.position.to_physical::<f64>(scale);
        let rect_size = rect.size.to_physical::<f64>(scale);

        // Center panel horizontally below tray icon
        let x = rect_pos.x + (rect_size.width / 2.0) - (panel_width / 2.0);
        let y = rect_pos.y + rect_size.height + 4.0;

        // Clamp to monitor bounds
        let (final_x, final_y) = if let Some(monitor) = window.current_monitor().unwrap_or(None) {
            let mon_pos = monitor.position();
            let mon_size = monitor.size();

            let max_x = mon_pos.x as f64 + mon_size.width as f64 - panel_width;
            let max_y = mon_pos.y as f64 + mon_size.height as f64 - panel_height;

            (x.max(mon_pos.x as f64).min(max_x), y.min(max_y))
        } else {
            (x, y)
        };

        let _ = window.set_position(tauri::Position::Physical(
            tauri::PhysicalPosition::new(final_x as i32, final_y as i32),
        ));

        #[cfg(target_os = "macos")]
        bring_panel_to_front(app, &window);

        #[cfg(not(target_os = "macos"))]
        let _ = window.show();

        let _ = window.set_focus();
    }
}
