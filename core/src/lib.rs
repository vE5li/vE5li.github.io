use resvg::render;
use tiny_skia::{Pixmap, Transform};
use usvg::{FitTo, Tree};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn generate(
    width: f32,
    height: f32,
    ferris_size: f32,
    spacing: f32,
    background_color: &str,
    separator_radius: f32,
    separator_color: &str,
    ferrises: &str,
    use_separators: bool,
    use_crosses: bool,
) -> Vec<u8> {
    // Step 1: Generate the SVG file we want to render.

    // Create string to hold the contents of our generated SVG file.
    let mut svg_data = String::new();

    // Open SVG tag.
    svg_data.push_str(&format!(
        r#"<svg viewBox="0 0 {} {}" xmlns="http://www.w3.org/2000/svg">\n"#,
        width, height
    ));

    // Background with a solid color.
    svg_data.push_str(&format!(
        r#"<rect width="{}" height="{}" fill="{}"/>\n"#,
        width, height, background_color
    ));

    // Calculate the horizontal center and empty space on the left of the image.
    let ferris_count = ferrises.split('\n').count();
    let total_width = ferris_count as f32 * ferris_size + ferris_count.saturating_sub(1) as f32 * spacing;

    // Variable to accumulate the horizontal offset.
    let mut x_offset = (width - total_width) / 2.0;

    // Add all the configured Ferrises to the SVG data string.
    // NOTE: Since wasm-bindgen currently does not allow us to send &[&str], we
    // concatinate all Ferrises into one base64-encoded string and then
    // split+decode it on the Rust side.
    for (index, ferris) in ferrises.split('\n').enumerate() {
        // Add the separators for all but the first Ferris.
        if use_separators && index + 1 < ferris_count {
            if use_crosses {
                for rotation in [45, -45] {
                    svg_data.push_str(&format!(
                        r#"<rect x="-{}" y="-{}" transform="translate({}, {}) rotate({})" width="{}" height="{}" ry="{radius}" rx="{radius}" fill="{}"/>\n"#,
                        separator_radius,
                        separator_radius / 5.0,
                        x_offset + ferris_size + spacing / 2.0,
                        height / 2.0,
                        rotation,
                        separator_radius * 2.0,
                        separator_radius / 3.0,
                        separator_color,
                        radius=separator_radius / 6.0,
                    ));
                }
            } else {
                svg_data.push_str(&format!(
                    r#"<circle cx="{}" cy="{}" r="{}" fill="{}"/>\n"#,
                    x_offset + ferris_size + spacing / 2.0,
                    height / 2.0,
                    separator_radius,
                    separator_color
                ));
            }
        }

        // Add the Ferris with the correct position and scale.
        svg_data.push_str(&format!(
            r#"<image x="{x_offset}" y="{}" width="{size}" height="{size}" href="data:image/svg+xml;base64,{}"/>\n"#,
            (height - ferris_size) / 2.0,
            ferris,
            size = ferris_size,
        ));

        x_offset += ferris_size + spacing;
    }

    // Close SVG tag.
    svg_data.push_str("</svg>");

    // Step 2: Convert our SVG to a PNG file.

    // Perpare SVG data and buffer to render in to.
    let tree = Tree::from_data(svg_data.as_bytes(), &Default::default()).unwrap();
    let mut pixmap = Pixmap::new(width as u32, height as u32).unwrap();

    // Render SVG to the buffer.
    render(
        &tree,
        FitTo::Size(width as u32, height as u32),
        Transform::default(),
        pixmap.as_mut(),
    )
    .unwrap();

    // Encode buffer as PNG and return execution to JavaScript.
    pixmap.encode_png().unwrap()
}
