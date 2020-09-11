var canvasWidth = 600;
var canvasHeight = 400;

var layer = new Konva.Layer();
var stage = new Konva.Stage({
    container: "container",
    width: canvasWidth,
    height: canvasHeight
});

function addButton(layer, name, x, y, width, height, colored, visible, callback) {

    const backgroundWidth = width;
    const backgroundHeight = height;
    const backgroundUpColor = (colored) ? '#63a145' : '#666666';
    const backgroundDownColor = (colored) ? '#red' : 'black';

    const textOffset = 7;
    const fontSize = 18;
    const fontFamily = 'Sans-serif';
    const textColor = (colored) ? '#333333' : '#333333';

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
        visible: visible,
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
        visible: visible,
    });

    function hide() {
        background.visible(false);
        text.visible(false);
    }

    function show() {
        background.visible(true);
        text.visible(true);
    }

    text.offsetX(text.width() / 2);
    background.on('mousedown', callback);
    background.on('tap', callback);
    text.on('mousedown', callback);
    text.on('tap', callback);
    layer.add(background);
    layer.add(text);

    return {
        hide: hide,
        show: show,
    }
}

function addToggleButton(layer, name, x, y, on) {

    const fontSize = 19;
    const fontFamily = 'Sans-serif';
    const textColor = '#808080';
    const textOffset = 11;
    const textPadding = 200;

    const backgroundWidth = 80;
    const backgroundHeight = 30;
    const backgroundOnColor = '#63a145';
    const backgroundOffColor = "#666666";

    const gradientWidth = 50;
    const gradientOnStart = backgroundWidth;
    const gradientOnEnd = backgroundWidth + gradientWidth * 2;
    const gradientOffStart = -(gradientWidth * 2);
    const gradientOffEnd = 0;

    const sliderOffset = 3;
    const sliderSize = backgroundHeight - sliderOffset * 2;
    const sliderOffPosition = x + textPadding + sliderOffset;
    const sliderOnPosition = sliderOffPosition + backgroundWidth - sliderSize - sliderOffset * 2;
    const sliderColor = "#333333";
    const sliderSpeed = 0.5;

    var text = new Konva.Text({
        x: x,
        y: y + textOffset,
        text: name,
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontStyle: 'bold',
        fill: textColor,
        shadowColor: 'black',
        shadowBlur: 0.5,
        shadowOpacity: 0.4,
        shadowOffset: { x: 2, y: 2 },
    });

    var background = new Konva.Rect({
        x: x + textPadding,
        y: y,
        width: backgroundWidth,
        height: backgroundHeight,
        cornerRadius: backgroundHeight / 2.0,
        fillLinearGradientStartPoint: { x: (on) ? gradientOnStart : gradientOffStart },
        fillLinearGradientEndPoint: { x: (on) ? gradientOnEnd : gradientOffEnd },
        fillLinearGradientColorStops: [0, backgroundOnColor, 1, backgroundOffColor],
        shadowColor: 'black',
        shadowBlur: 3.0,
        shadowOpacity: 0.35,
        shadowOffset: { x: 4, y: 4 },
    });

    var slider = new Konva.Rect({
        x: (on) ? sliderOnPosition : sliderOffPosition,
        y: y + sliderOffset,
        width: sliderSize,
        height: sliderSize,
        cornerRadius: sliderSize / 2.0,
        fill: sliderColor,
        shadowColor: 'black',
        shadowBlur: 0.5,
        shadowOpacity: 0.4,
        shadowOffset: { x: 1.35, y: 1.35 },
    });

    var moveSwitchOn = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var newX = slider.x() + timeDiff * sliderSpeed;
        if (newX > sliderOnPosition) {
            newX = sliderOnPosition;
            moveSwitchOn.stop();
        }
        moveGradient(newX);
        slider.setX(newX);
        layer.draw();
    }, layer);

    var moveSwitchOff = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var newX = slider.x() - timeDiff * sliderSpeed;
        if (newX < sliderOffPosition) {
            newX = sliderOffPosition;
            moveSwitchOff.stop();
        }
        moveGradient(newX);
        slider.setX(newX);
        layer.draw();
    }, layer);

    function moveGradient(x) {
        const steps = gradientOnEnd / (sliderOnPosition - sliderOffPosition);
        const sliderX = steps * (x - sliderOffPosition);
        background.fillLinearGradientStartPoint({ x: sliderX - gradientWidth * 2 });
        background.fillLinearGradientEndPoint({ x: sliderX });
    }

    function toggleButtonState() {
        if (on) {
            moveSwitchOn.stop();
            moveSwitchOff.start();
            on = false;
        } else {
            moveSwitchOff.stop();
            moveSwitchOn.start();
            on = true;
        }
        stage.draw();
    }

    background.on('mousedown', toggleButtonState);
    background.on('tap', toggleButtonState);
    slider.on('mousedown', toggleButtonState);
    slider.on('tap', toggleButtonState);
    layer.add(text);
    layer.add(background);
    layer.add(slider);
}

function addTextField(layer, x, y, callback) {

    const textarea = document.createElement('textarea');
    const container = document.getElementById('container');

    const backgroundWidth = 280;
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

function openMessageField() {
    messageField.open('');
    cancelMessageButton.show();
    confirmMessageButton.show();
    layer.draw();
}

function cancelMessageField() {
    messageField.close();
    cancelMessageButton.hide();
    confirmMessageButton.hide();
    layer.draw();
}

function confirmMessageField() {
    var message = messageField.close();
    sendMessage(message);
    cancelMessageButton.hide();
    confirmMessageButton.hide();
    layer.draw();
}

function sendMessage(message) {
    if (message.length > 0) {
        //alert(message);
    }
}

addToggleButton(layer, 'light', 0, 10, true);
addToggleButton(layer, 'lamps', 0, 60, false);
addToggleButton(layer, 'portal', 0, 110, false);
addToggleButton(layer, 'television', 0, 160, false);

addButton(layer, 'send a message', 0, 210, 280, 30, true, true, openMessageField);
cancelMessageButton = addButton(layer, 'cancel', 0, 250, 135, 30, false, false, cancelMessageField);
confirmMessageButton = addButton(layer, 'confirm', 145, 250, 135, 30, true, false, confirmMessageField);

var messageField = addTextField(layer, 0, 210, confirmMessageField);

stage.add(layer);
