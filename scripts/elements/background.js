

function addBackground(layer, width, height, color) {

    const offset = 5;

    var background = new Konva.Rect({
        x: offset,
        width: width - offset * 2,
        height: height,
        cornerRadius: 7,
        fill: color,
        shadowColor: 'black',
        shadowBlur: 7.0,
        shadowOpacity: 0.35,
        shadowOffset: { x: 5, y: 5 },
    });

    layer.add(background);

    return background;
}
