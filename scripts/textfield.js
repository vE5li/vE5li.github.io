function addTextfield(layer, x, y, open_callback, close_callback, send_callback) {

    const textarea = document.createElement('textarea');
    const container = document.getElementById('container');

    const backgroundWidth = 660;
    const backgroundHeight = 30;
    const backgroundColor = "#444444";

    const textareaTopPadding = 4;
    const textareaTopCorrection = 2;
    const textareaLeftPadding = 12;
    const textareaX = x + textareaLeftPadding;
    const textareaY = y + textareaTopPadding - textareaTopCorrection;
    const textareaWidth = backgroundWidth - textareaLeftPadding * 2;
    const textareaHeight = backgroundHeight - textareaTopPadding * 2;

    var background = new Konva.Rect({
        x: x,
        y: y,
        width: backgroundWidth,
        height: backgroundHeight,
        cornerRadius: backgroundHeight / 2,
        fill: backgroundColor,
        shadowColor: 'black',
        shadowBlur: 3.0,
        shadowOpacity: 0.35,
        shadowOffset: { x: 4, y: 4 },
    });

    textarea.style.left = textareaX + 'px';
    textarea.style.top = textareaY + 'px';
    textarea.style.width = textareaWidth + 'px';
    textarea.style.height = textareaHeight + 'px';
    textarea.style.backgroundColor = backgroundColor;
    textarea.spellcheck = false;
    textarea.addEventListener("focus", open_callback);

    function clear() {
        var value = (' ' + textarea.value).slice(1);
        textarea.value = '';
        return value;
    }

    textarea.addEventListener('keydown', function (event) {
        if (event.keyCode === 27) {
            textarea.blur();
            clear();
            close_callback();
        } else if (event.keyCode === 13) {
            textarea.blur();
            send_callback();
        }
    });

    function offset(offset) {
        textarea.style.top = offset + textareaY + 'px';
    }

    container.appendChild(textarea);
    layer.add(background);

    return {
        offset: offset,
        clear: clear,
    }
}
