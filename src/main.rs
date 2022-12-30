use resvg::usvg_text_layout::{fontdb, TreeTextToPath};

struct Settings {
    width: f32,
    height: f32,
    background_color: String,
    ferrises: Vec<String>,
    ferris_size: f32,
    ferris_offset: f32,
    show_circles: bool,
    circle_radius: f32,
    circle_color: String,
    use_crosses: bool,
}

fn main() {
    // Step 1: Generate the SVG file we want to render.

    let settings = Settings {
        width: 3840.0,
        height: 1080.0,
        background_color: "#222222".to_owned(),
        ferrises: vec![
            "construction".to_owned(),
            "icecream".to_owned(),
            "catgirl".to_owned(),
            "pumpkin".to_owned(),
            "santa".to_owned(),
            "alien".to_owned(),
            "tophat".to_owned(),
            "chromatic".to_owned(),
            "dead".to_owned(),
            "kali".to_owned(),
            "devil".to_owned(),
        ],
        ferris_size: 320.0,
        show_circles: true,
        circle_radius: 20.0,
        circle_color: "#2b2b2b".to_owned(),
        ferris_offset: -30.0,
        use_crosses: true,
    };

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
    let ferris_count = settings.ferrises.len();
    let total_width = ferris_count as f32 * settings.ferris_size + ferris_count.saturating_sub(1) as f32 * settings.ferris_offset;

    // Make sure that the settings can fit in the image.
    assert!(settings.width > total_width, "too many ferrises");

    // Variable to accumulate the horizontal offset.
    let mut x_offset = (settings.width - total_width) / 2.0;

    for (index, ferris) in settings.ferrises.iter().enumerate() {
        svg_data.push_str(&format!(
            r#"<image x="{x_offset}" y="{}" width="{size}" height="{size}" href="ferrises/{}.svg"/>\n"#,
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
    let mut fontdb = fontdb::Database::new();

    fontdb.load_system_fonts();

    let mut tree = usvg::Tree::from_data(&svg_data.as_bytes(), &opt).unwrap();
    let mut pixmap = tiny_skia::Pixmap::new(3840, 1080).unwrap();

    tree.convert_text(&fontdb, opt.keep_named_groups);

    resvg::render(
        &tree,
        usvg::FitTo::Size(3840, 1080),
        tiny_skia::Transform::default(),
        pixmap.as_mut(),
    )
    .unwrap();

    pixmap.save_png("generated.png").unwrap();
}
