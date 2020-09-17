function addColorPicker(layer, x, y, width, close_callback, confirm_callback) {

    const buttonSize = 30;
    const closeButtonColor = "#666666";
    const colors = ['#ff0000', '#ff8c00', '#f2ff00', '#95ff00', '#04ff00', '#00ff80', '#00fbff', '#0022ff', '#bf00ff', '#ee00ff', '#ff004c'];

    const step = width / colors.length;
    var offset = x + step;
    var colorButtons = [];

    var closeButton = new Konva.Rect({
        x: x,
        y: y,
        width: buttonSize,
        height: buttonSize,
        cornerRadius: buttonSize / 2.0,
        fill: closeButtonColor,
        opacity: 0,
        shadowColor: 'black',
        shadowBlur: 3.0,
        shadowOpacity: 0.35,
        shadowOffset: { x: 4, y: 4 },
    });

    for (let color of colors) {
        var button = new Konva.Rect({
            x: offset,
            y: y,
            width: buttonSize,
            height: buttonSize,
            cornerRadius: buttonSize / 2.0,
            fill: color,
            opacity: 0,
            shadowColor: 'black',
            shadowBlur: 3.0,
            shadowOpacity: 0.35,
            shadowOffset: { x: 4, y: 4 },
        });

        function setColor() {
            confirm_callback(color);
        }

        button.on('mousedown', setColor);
        button.on('tap', setColor);
        colorButtons.push(button);
        offset += step;
    }

    function update(opacity, offset) {
        closeButton.opacity(opacity);
        closeButton.offsetY(offset);
        for (let button of colorButtons) {
            button.opacity(opacity);
            button.offsetY(offset);
        }
    }

    closeButton.on('mousedown', close_callback);
    closeButton.on('tap', close_callback);

    layer.add(closeButton);
    for (let button of colorButtons) {
        layer.add(button);
    }

    return {
        update: update,
    }
}
