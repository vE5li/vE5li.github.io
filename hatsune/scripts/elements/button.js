function addButton(layer, name, x, y, width, height, colored, callback) {

    const backgroundWidth = width;
    const backgroundHeight = height;
    const backgroundUpColor = (colored) ? '#63a145' : '#666666';
    const backgroundDownColor = (colored) ? '#red' : 'black';

    const textOffset = 6;
    const fontSize = 18;
    const fontFamily = 'Global';
    const textColor = (colored) ? '#333333' : '#333333';

    const visibleThreshhold = 0.05;

    var background = new Konva.Rect({
        x: x,
        y: y,
        width: backgroundWidth,
        height: backgroundHeight,
        cornerRadius: backgroundHeight / 2.0,
        fill: backgroundUpColor,
        shadowColor: 'black',
        shadowBlur: 3.0,
        shadowOpacity: 0.35,
        shadowOffset: { x: 4, y: 4 },
    });

    var text = new Konva.Text({
        x: x + backgroundWidth / 2,
        y: y + textOffset,
        text: name,
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontStyle: 'bold',
        fill: textColor,
        shadowColor: 'black',
        shadowBlur: 0.5,
        shadowOpacity: 0.2,
        shadowOffset: { x: 1.35, y: 1.35 },
    });

    function update(opacity, offset) {
        background.opacity(opacity);
        background.offsetY(offset);
        background.visible(opacity > visibleThreshhold);
        text.opacity(opacity);
        text.offsetY(offset);
        text.visible(opacity > visibleThreshhold);
    }

    text.offsetX(text.width() / 2);
    background.on('mousedown', callback);
    background.on('tap', callback);
    text.on('mousedown', callback);
    text.on('tap', callback);
    layer.add(background);
    layer.add(text);

    return {
        background: background,
        text: text,
        update: update,
    }
}
