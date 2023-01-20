use js_sys::{Array, JsString};
use resvg::render;
use tiny_skia::{Pixmap, Transform};
use usvg::{FitTo, Tree};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsCast, JsValue};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn warn(s: &str);
}

#[wasm_bindgen]
pub fn generate(
    width: f32,
    height: f32,
    ferris_size: f32,
    spacing: f32,
    background_color: &str,
    ferris_data: JsValue,
    use_separators: bool,
    separator_data: &str,
    separator_radius: f32,
    separator_color: &str,
    use_shadows: bool,
    shadow_offset: f32,
    shadow_spread: f32,
    shadow_opacity: f32,
    shadow_color: &str,
) -> Vec<u8> {
    // Step 1: Generate the SVG file we want to render.

    // Create string to hold the contents of our generated SVG file.
    let mut svg_data = String::new();

    // Open SVG tag.
    let view_box = format!("0 0 {width} {height}");
    svg_data.push_str(&format_xml::format!(
        <svg viewBox={view_box} xmlns="http://www.w3.org/2000/svg">
    ));

    // Blur filter.
    if use_shadows {
        svg_data.push_str(&format_xml::format!(
            <defs>
                <filter id="shadow">
                    <feDropShadow dx={shadow_offset} dy={shadow_offset} stdDeviation={shadow_spread} flood-color={shadow_color} flood-opacity={shadow_opacity}/>
                </filter>
            </defs>
        ));
    }

    // Color mapping filter for Rust separator.
    if use_separators {
        let color_values = hex_color::HexColor::parse_rgb(separator_color).unwrap();

        svg_data.push_str(&format_xml::format!(
            <defs>
               <filter id="separator">
                   <feComponentTransfer color-interpolation-filters="sRGB">
                       <feFuncR type="linear" slope="0" intercept={color_values.r as f32 / 255.0}/>
                       <feFuncG type="linear" slope="0" intercept={color_values.g as f32 / 255.0}/>
                       <feFuncB type="linear" slope="0" intercept={color_values.b as f32 / 255.0}/>
                   </feComponentTransfer>
               </filter>
            </defs>
        ));
    }

    // Background with a solid color.
    svg_data.push_str(&format_xml::format!(
        <rect width={width} height={height} fill={background_color}/>
    ));

    // Calculate the horizontal center and empty space on the left of the image.
    let ferris_data: Array = ferris_data.into();
    let ferris_count = ferris_data.length() as usize;
    let total_width = ferris_count as f32 * ferris_size + ferris_count.saturating_sub(1) as f32 * spacing;

    // Variable to accumulate the horizontal offset.
    let mut x_offset = (width - total_width) / 2.0;
    let y_offset = (height - ferris_size) / 2.0;

    // Add all the configured Ferrises to the SVG data string.
    for (index, ferris) in ferris_data.iter().enumerate() {
        // Add the separators for all but the first Ferris. Since we always draw the
        // separators first and always separate the *next* Ferris instead of the
        // pervious one, the Ferrises will always be on top.
        if use_separators && index + 1 < ferris_count {
            let x_offset = x_offset + ferris_size + spacing / 2.0 - separator_radius;
            let y_offset = height / 2.0 - separator_radius;
            let radius = separator_radius;

            svg_data.push_str(&format_xml::format!(
                <image x={x_offset} y={y_offset} width={radius * 2.0} height={radius * 2.0} filter="url(#separator)" href={separator_data}/>
            ));
        }

        // Try to get a UTF-8 string from the JsValue.
        let Some(ferris_data) = ferris.dyn_ref::<JsString>() else {
            warn("Ferris data is not a valid UTF-8 string.");
            continue;
        };

        // Add the Ferris with the correct position and scale.
        svg_data.push_str(&format_xml::format!(
            match use_shadows {
                true => <image x={x_offset} y={y_offset} width={ferris_size} height={ferris_size} filter="url(#shadow)" href={ferris_data}/>,
                false => <image x={x_offset} y={y_offset} width={ferris_size} height={ferris_size} href={ferris_data}/>
            }
        ));

        x_offset += ferris_size + spacing;
    }

    // Close SVG tag.
    svg_data.push_str(&format_xml::format!(
        </svg>
    ));

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
