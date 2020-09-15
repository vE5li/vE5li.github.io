function addTextfield(layer, x, y, callback) {

    const textarea = document.createElement('textarea');
    const container = document.getElementById('container');

    const backgroundWidth = 600;
    const backgroundHeight = 30;
    const backgroundColor = "#666666";

    const textareaTopPadding = 7;
    const textareaLeftPadding = 12;
    const textareaY = y + textareaTopPadding;
    const textareaWidth = backgroundWidth - textareaLeftPadding * 2;
    const textareaHeight = backgroundHeight - textareaTopPadding * 2;

    var background = new Konva.Rect({
        x: x,
        y: y,
        width: backgroundWidth,
        height: backgroundHeight,
        cornerRadius: 15,
        fill: backgroundColor,
        shadowColor: 'black',
        shadowBlur: 3.0,
        shadowOpacity: 0.35,
        shadowOffset: { x: 4, y: 4 },
        visible: false,
    });

    textarea.style.top = textareaY + 'px';
    textarea.style.left = textareaLeftPadding + 'px';
    textarea.style.width = textareaWidth + 'px';
    textarea.style.height = textareaHeight + 'px';
    textarea.style.backgroundColor = backgroundColor;

    textarea.addEventListener('keydown', function (event) {
        if (event.keyCode === 27) {
            textarea.value = '';
            callback();
        } else if (event.keyCode === 13) {
            callback();
        }
    });

    function open(value) {
        container.appendChild(textarea);
        textarea.value = value;
        background.visible(true);
        setTimeout(function() {
          textarea.focus();
        }, 0);
    }

    function close() {
        container.removeChild(textarea);
        background.visible(false);
        return textarea.value;
    }

    layer.add(background);

    return {
        open: open,
        close: close,
    }
}
