function addSwitch(layer, name, x, y, callback) {

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
    const sliderSpeed = 0.3;

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
        fillLinearGradientStartPoint: { x: gradientOffStart },
        fillLinearGradientEndPoint: { x: gradientOffEnd },
        fillLinearGradientColorStops: [0, backgroundOnColor, 1, backgroundOffColor],
        shadowColor: 'black',
        shadowBlur: 3.0,
        shadowOpacity: 0.35,
        shadowOffset: { x: 4, y: 4 },
    });

    var slider = new Konva.Rect({
        x: sliderOffPosition,
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

    function setState(state) {
        if (state) {
            moveSwitchOff.stop();
            moveSwitchOn.start();
        } else {
            moveSwitchOn.stop();
            moveSwitchOff.start();
        }
    }

    background.on('mousedown', callback);
    background.on('tap', callback);
    slider.on('mousedown', callback);
    slider.on('tap', callback);
    layer.add(text);
    layer.add(background);
    layer.add(slider);

    return {
        setState: setState,
    }
}
