function addColorIndicator(layer, x, y, callback) {

    const backgroundSize = 30;
    const backgroundOffset = 190;

    const gradientWidth = 500;
    const gradientSetStart = backgroundSize;
    const gradientSetEnd = backgroundSize + gradientWidth;
    const gradientTransitionStart = -gradientWidth;
    const gradientTransitionEnd = 0;
    const transitionSpeed = 2;

    const textOffset = 6;
    const fontSize = 18;
    const fontFamily = 'Global';
    const textColor = '#333333';

    const fadeSpeed = 0.01;

    var currentColor = '#666666';
    var markerOpacity = 0;

    var background = new Konva.Rect({
        x: x + backgroundOffset,
        y: y,
        width: backgroundSize,
        height: backgroundSize,
        cornerRadius: backgroundSize / 2.0,
        fillLinearGradientStartPoint: { x: gradientSetStart },
        fillLinearGradientEndPoint: { x: gradientSetEnd },
        fillLinearGradientColorStops: [0, currentColor, 1, currentColor],
        shadowColor: 'black',
        shadowBlur: 3.0,
        shadowOpacity: 0.35,
        shadowOffset: { x: 4, y: 4 },
    });

    var text = new Konva.Text({
        x: x + backgroundOffset + backgroundSize / 2,
        y: y + textOffset,
        text: '\u2B24',
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontStyle: 'bold',
        fill: textColor,
        opacity: markerOpacity,
    });

    function setColor(color) {
        background.fillLinearGradientColorStops([0, color, 1, currentColor]);
        background.fillLinearGradientStartPoint({ x: gradientTransitionStart });
        background.fillLinearGradientEndPoint({ x: gradientTransitionEnd });
        currentColor = color;
        transition.start();
    }

    var transition = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var currentX = background.fillLinearGradientStartPoint().x;

        var newX = currentX + timeDiff * transitionSpeed;
        if (newX > gradientSetStart) {
            newX = gradientSetStart;
            transition.stop();
        }

        background.fillLinearGradientStartPoint({ x: newX });
        background.fillLinearGradientEndPoint({ x: newX + gradientWidth });
        layer.draw();
    }, layer);

    var fadeMarkerIn = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var newOpacity = markerOpacity + timeDiff * fadeSpeed;

        if (newOpacity > 1) {
            newOpacity = 1;
            fadeMarkerIn.stop();
        }

        text.opacity(newOpacity);
        markerOpacity = newOpacity;
        layer.draw();
    }, layer);

    var fadeMarkerOut = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var newOpacity = markerOpacity - timeDiff * fadeSpeed;

        if (newOpacity < 0) {
            newOpacity = 0;
            fadeMarkerOut.stop();
        }

        text.opacity(newOpacity);
        markerOpacity = newOpacity;
        layer.draw();
    }, layer);

    function focus() {
        fadeMarkerOut.stop();
        fadeMarkerIn.start();
    }

    function unfocus() {
        fadeMarkerIn.stop();
        fadeMarkerOut.start();
    }

    text.offsetX(text.width() / 2);
    background.on('mousedown', callback);
    background.on('tap', callback);
    text.on('mousedown', callback);
    text.on('tap', callback);
    layer.add(background);
    layer.add(text);

    return {
        setColor: setColor,
        focus: focus,
        unfocus: unfocus,
    }
}
