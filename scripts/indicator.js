function addColorIndicator(layer, x, y, callback) {

    const backgroundSize = 30;
    const backgroundOffset = 190;

    const gradientWidth = 500;
    const gradientSetStart = backgroundSize;
    const gradientSetEnd = backgroundSize + gradientWidth;
    const gradientTransitionStart = -gradientWidth;
    const gradientTransitionEnd = 0;
    const transitionSpeed = 2;

    var currentColor = '#666666';

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

    background.on('mousedown', callback);
    background.on('tap', callback);
    layer.add(background);

    return {
        setColor: setColor,
    }
}
