function addControlLayer(stage, socket, offsetLayers) {

    const openHeight = 230;
    const closedHeight = 180;
    const openSpeed = 0.3;
    const textOffset = 230;
    var selectedIndicator;

    var layer = new Konva.Layer();
    var background = addBackground(layer, canvasWidth, closedHeight, "#333333");
    var lightSwitch = addSwitch(layer, 'light', 70, 20, textOffset, sendLightState);
    var lampSwitch = addSwitch(layer, 'lamps', 70, 70, textOffset, sendLampState);
    var portalSwitch = addSwitch(layer, 'portal', 70, 120, textOffset, sendPortalState);
    var televisionSwitch = addSwitch(layer, 'television', 420, 20, textOffset, sendTelevisionState);
    var shelfSwitch = addSwitch(layer, 'shelf', 420, 70, textOffset, sendShelfState);
    var deskSwitch = addSwitch(layer, 'desk', 420, 120, textOffset, sendDeskState);
    var shelfColorIndicator = addColorIndicator(layer, 420, 70, openShelfPicker);
    var deskColorIndicator = addColorIndicator(layer, 420, 120, openDeskfPicker);
    var colorPicker = addColorPicker(layer, 70, 180, 660, closeColorPicker, setColor);

    function character_from_state(state) {
        return (state) ? '1' : '0';
    }

    function sendLightState() {
        var message = 'L' + character_from_state(!lightSwitch.state);
        socket.send(message);
    }

    function sendLampState() {
        var message = 'l' + character_from_state(!lampSwitch.state);
        socket.send(message);
    }

    function sendPortalState() {
        var message = 'p' + character_from_state(!portalSwitch.state);
        socket.send(message);
    }

    function sendTelevisionState() {
        var message = 't' + character_from_state(!televisionSwitch.state);
        socket.send(message);
    }

    function sendShelfState() {
        var message = 's' + character_from_state(!shelfSwitch.state);
        socket.send(message);
    }

    function sendDeskState() {
        var message = 'd' + character_from_state(!deskSwitch.state);
        socket.send(message);
    }

    function openShelfPicker() {
        selectedIndicator = 'S';
        closeColorPicker.stop();
        openColorPicker.start();
        shelfColorIndicator.focus();
        deskColorIndicator.unfocus();
    }

    function openDeskfPicker() {
        selectedIndicator = 'D';
        closeColorPicker.stop();
        openColorPicker.start();
        shelfColorIndicator.unfocus();
        deskColorIndicator.focus();
    }

    function closeColorPicker() {
        openColorPicker.stop();
        closeColorPicker.start();
        shelfColorIndicator.unfocus();
        deskColorIndicator.unfocus();
    }

    function setColor(color) {
        var message = selectedIndicator + color.substring(1, 7);
        socket.send(message);
        openColorPicker.stop();
        closeColorPicker.start();
        shelfColorIndicator.unfocus();
        deskColorIndicator.unfocus();
    }

    function updateColorPicker(height) {
        const steps = 1.0 / (openHeight - closedHeight);
        const opacity = steps * (height - closedHeight);
        const offset = (openHeight - height) / 2.0;
        colorPicker.update(opacity, offset);
    }

    var openColorPicker = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var newHeight = background.height() + timeDiff * openSpeed;

        if (newHeight > openHeight) {
            newHeight = openHeight;
            openColorPicker.stop();
        }

        updateColorPicker(newHeight);
        background.height(newHeight);
        offsetLayers();
    }, layer);

    var closeColorPicker = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var newHeight = background.height() - timeDiff * openSpeed;

        if (newHeight < closedHeight) {
            newHeight = closedHeight;
            closeColorPicker.stop();
        }

        updateColorPicker(newHeight);
        background.height(newHeight);
        offsetLayers();
    }, layer);

    function offset(offset) {
        layer.y(offset);
        return background.height() + 10;
    }

    stage.add(layer);

    return {
        offset: offset,
        lightSwitch: lightSwitch,
        lampSwitch: lampSwitch,
        portalSwitch: portalSwitch,
        televisionSwitch: televisionSwitch,
        shelfSwitch: shelfSwitch,
        deskSwitch: deskSwitch,
        shelfColorIndicator: shelfColorIndicator,
        deskColorIndicator: deskColorIndicator,
    };
}
