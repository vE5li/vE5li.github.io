use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub struct Settings {
    width: f32,
    height: f32,
    background_color: String,
    ferrises: String,
    ferris_size: f32,
    ferris_offset: f32,
    show_circles: bool,
    circle_radius: f32,
    circle_color: String,
    use_crosses: bool,
}

#[wasm_bindgen]
impl Settings {
    #[wasm_bindgen(constructor)]
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        width: f32,
        height: f32,
        background_color: String,
        ferrises: String,
        ferris_size: f32,
        ferris_offset: f32,
        show_circles: bool,
        circle_radius: f32,
        circle_color: String,
        use_crosses: bool,
    ) -> Self {
        Self {
            width,
            height,
            background_color,
            ferrises,
            ferris_size,
            ferris_offset,
            show_circles,
            circle_radius,
            circle_color,
            use_crosses,
        }
    }
}

#[wasm_bindgen]
pub fn generate(settings: Settings) -> Vec<u8> {
    // Step 1: Generate the SVG file we want to render.

    // Create string to hold the contents of our generated SVG file.
    let mut svg_data = String::new();

    // Open SVG tag.
    svg_data.push_str(&format!(
        r#"<svg viewBox="0 0 {} {}" xmlns="http://www.w3.org/2000/svg">\n"#,
        settings.width, settings.height
    ));

    // Background with a solid color.
    svg_data.push_str(&format!(
        r#"<rect width="{}" height="{}" fill="{}"/>\n"#,
        settings.width, settings.height, settings.background_color
    ));

    // Calculate the horizontal center and empty space on the left of the image.
    let ferris_count = settings.ferrises.split('\n').count();
    let total_width = ferris_count as f32 * settings.ferris_size + ferris_count.saturating_sub(1) as f32 * settings.ferris_offset;

    // Variable to accumulate the horizontal offset.
    let mut x_offset = (settings.width - total_width) / 2.0;

    for (index, ferris) in settings.ferrises.split('\n').enumerate() {
        svg_data.push_str(&format!(
            r#"<image x="{x_offset}" y="{}" width="{size}" height="{size}" href="data:image/svg+xml;base64,{}"/>\n"#,
            (settings.height - settings.ferris_size) / 2.0,
            ferris,
            size = settings.ferris_size,
        ));

        if settings.show_circles && index + 1 < ferris_count {
            if settings.use_crosses {
                for rotation in [45, -45] {
                    svg_data.push_str(&format!(
                        r#"<rect x="-{}" y="-{}" transform="translate({}, {}) rotate({})" width="{}" height="{}" ry="{radius}" rx="{radius}" fill="{}"/>\n"#,
                        settings.circle_radius,
                        settings.circle_radius / 5.0,
                        x_offset + settings.ferris_size + settings.ferris_offset / 2.0,
                        settings.height / 2.0,
                        rotation,
                        settings.circle_radius * 2.0,
                        settings.circle_radius / 3.0,
                        settings.circle_color,
                        radius=settings.circle_radius / 6.0,
                    ));
                }
            } else {
                svg_data.push_str(&format!(
                    r#"<circle cx="{}" cy="{}" r="{}" fill="{}"/>\n"#,
                    x_offset + settings.ferris_size + settings.ferris_offset / 2.0,
                    settings.height / 2.0,
                    settings.circle_radius,
                    settings.circle_color
                ));
            }
        }

        x_offset += settings.ferris_size + settings.ferris_offset;
    }

    // Close SVG tag.
    svg_data.push_str("</svg>");

    // Step 2: Convert our SVG to a PNG file.

    let opt = usvg::Options::default();
    let tree = usvg::Tree::from_data(svg_data.as_bytes(), &opt).unwrap();
    let mut pixmap = tiny_skia::Pixmap::new(settings.width as u32, settings.height as u32).unwrap();

    resvg::render(
        &tree,
        usvg::FitTo::Size(settings.width as u32, settings.height as u32),
        tiny_skia::Transform::default(),
        pixmap.as_mut(),
    )
    .unwrap();

    pixmap.encode_png().unwrap()
}
