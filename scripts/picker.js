function addColorPicker(layer, x, y, width, close_callback, confirm_callback) {

    const buttonSize = 30;
    const colors = ['#ffffff', '#ff8c00', '#f2ff00', '#95ff00', '#04ff00', '#00ff80', '#00fbff', '#0022ff', '#bf00ff', '#ee00ff', '#ff004c', '#ff0000'];
    const step = width / colors.length;

    var offset = x + step;
    var colorButtons = [];
    var closeButton = addButton(layer, '\u2717', x, y, buttonSize, buttonSize, false, close_callback);
    closeButton.opacity(0);

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
        closeButton.background.offsetY(offset);
        closeButton.text.offsetY(offset);
        for (let button of colorButtons) {
            button.opacity(opacity);
            button.offsetY(offset);
        }
    }

    for (let button of colorButtons) {
        layer.add(button);
    }

    return {
        update: update,
    }
}
