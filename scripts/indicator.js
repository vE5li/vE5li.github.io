function addColorIndicator(layer, x, y, callback) {

    const backgroundSize = 30;
    const backgroundOffset = 190;
    const backgroundColor = "#666666";

    var background = new Konva.Rect({
        x: x + backgroundOffset,
        y: y,
        width: backgroundSize,
        height: backgroundSize,
        cornerRadius: backgroundSize / 2.0,
        fill: backgroundColor,
        //fillLinearGradientStartPoint: { x: gradientOffStart },
        //fillLinearGradientEndPoint: { x: gradientOffEnd },
        //fillLinearGradientColorStops: [0, backgroundOnColor, 1, backgroundOffColor],
        shadowColor: 'black',
        shadowBlur: 3.0,
        shadowOpacity: 0.35,
        shadowOffset: { x: 4, y: 4 },
    });

    function setColor(color) {
        background.fill(color);
    }

    background.on('mousedown', callback);
    background.on('tap', callback);
    layer.add(background);

    return {
        setColor: setColor,
    }
}
