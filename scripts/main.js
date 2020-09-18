function character_from_state(state) {
    return (state) ? '1' : '0';
}

function state_from_character(character) {
    return character == '1';
}

function offsetLayers() {
    var offset = 20;
    for (let layer of layers) {
        offset += layer.offset(offset);
    }
    stage.draw();
}

function addBannerLayer(stage) {

    const backgroundHeight = 180;

    var layer = new Konva.Layer();
    var background = addBackground(layer, canvasWidth, backgroundHeight, "#333333");

    function offset(offset) {
        layer.y(offset);
        return backgroundHeight + 10;
    }

    stage.add(layer);

    return {
        offset: offset,
    }
}

function addControlLayer(stage) {

    const openHeight = 230;
    const closedHeight = 180;
    const openSpeed = 0.3;
    var selectedIndicator;

    var layer = new Konva.Layer();
    var background = addBackground(layer, canvasWidth, closedHeight, "#333333");
    var lightSwitch = addSwitch(layer, 'light', 70, 20, sendLightState);
    var lampSwitch = addSwitch(layer, 'lamps', 70, 70, sendLampState);
    var portalSwitch = addSwitch(layer, 'portal', 70, 120, sendPortalState);
    var televisionSwitch = addSwitch(layer, 'television', 420, 20, sendTelevisionState);
    var shelfSwitch = addSwitch(layer, 'shelf', 420, 70, sendShelfState);
    var deskSwitch = addSwitch(layer, 'desk', 420, 120, sendDeskState);
    var shelfColorIndicator = addColorIndicator(layer, 420, 70, openShelfPicker);
    var deskColorIndicator = addColorIndicator(layer, 420, 120, openDeskfPicker);
    var colorPicker = addColorPicker(layer, 90, 180, 590, closeColorPicker, setColor);

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
    }

    function openDeskfPicker() {
        selectedIndicator = 'D';
        closeColorPicker.stop();
        openColorPicker.start();
    }

    function closeColorPicker() {
        openColorPicker.stop();
        closeColorPicker.start();
    }

    function setColor(color) {
        var message = selectedIndicator + color.substring(1, 7);
        socket.send(message);
        openColorPicker.stop();
        closeColorPicker.start();
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

function addMessageLayer(stage) {

    const backgroundHeight = 70;
    const fadeSpeed = 0.01;

    var layer = new Konva.Layer();
    var background = addBackground(layer, canvasWidth, backgroundHeight, "#333333");
    var buttonOpacity = 0;

    var cancelMessageButton = addButton(layer, '\u2717', 25, 20, 30, 30, false, cancelMessageField);
    var confirmMessageButton = addButton(layer, '\u279C', 745, 20, 30, 30, true, confirmMessageField);
    var sendMessageField = addTextfield(layer, 70, 20, openMessageField, closeMessageField, confirmMessageField);
    updateButtons(buttonOpacity);

    function updateButtons(opacity) {
        cancelMessageButton.opacity(opacity);
        confirmMessageButton.opacity(opacity);
    }

    function openMessageField() {
        fadeButtonsOut.stop();
        fadeButtonsIn.start();
    }

    function cancelMessageField() {
        sendMessageField.clear();
        closeMessageField();
    }

    function closeMessageField() {
        fadeButtonsIn.stop();
        fadeButtonsOut.start();
    }

    function confirmMessageField() {
        var message = sendMessageField.clear();
        sendMessage(message);
        closeMessageField();
    }

    function sendMessage(message) {
        if (message.length > 0) { // FIX ME
            socket.send('m' + message);
        }
    }

    function offset(offset) {
        layer.y(offset);
        sendMessageField.offset(offset);
        return backgroundHeight + 10;
    }

    var fadeButtonsIn = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var newOpacity = buttonOpacity + timeDiff * fadeSpeed;

        if (newOpacity > 1) {
            newOpacity = 1;
            fadeButtonsIn.stop();
        }

        updateButtons(newOpacity);
        buttonOpacity = newOpacity;
        layer.draw();
    }, layer);

    var fadeButtonsOut = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var newOpacity = buttonOpacity - timeDiff * fadeSpeed;

        if (newOpacity < 0) {
            newOpacity = 0;
            fadeButtonsOut.stop();
        }

        updateButtons(newOpacity);
        buttonOpacity = newOpacity;
        layer.draw();
    }, layer);

    stage.add(layer);

    return {
        offset: offset,
    }
}

var canvasWidth = 800;
var canvasHeight = 800;
var stage = new Konva.Stage({
    container: "container",
    width: canvasWidth,
    height: canvasHeight
});

//var bannerLayer = addBannerLayer(stage);
var controlLayer = addControlLayer(stage);
var messageLayer = addMessageLayer(stage);
var layers = [controlLayer, messageLayer];
offsetLayers(layers);

let socket = new WebSocket("ws://[2a02:908:1b12:8360:ad79:dd57:6903:9bfc]:8765");

socket.onopen = function(e) {
    socket.send("0");
};

socket.onmessage = function(event) {
    var target = event.data[0];

    if (target == '0') {
        var state = state_from_character(event.data[1]);
        controlLayer.lightSwitch.state = state;
        controlLayer.lightSwitch.setState(state);

        var state = state_from_character(event.data[2]);
        controlLayer.lampSwitch.state = state;
        controlLayer.lampSwitch.setState(state);

        var state = state_from_character(event.data[3]);
        controlLayer.portalSwitch.state = state;
        controlLayer.portalSwitch.setState(state);

        var state = state_from_character(event.data[4]);
        controlLayer.televisionSwitch.state = state;
        controlLayer.televisionSwitch.setState(state);

        var state = state_from_character(event.data[5]);
        controlLayer.shelfSwitch.state = state;
        controlLayer.shelfSwitch.setState(state);

        var state = state_from_character(event.data[6]);
        controlLayer.deskSwitch.state = state;
        controlLayer.deskSwitch.setState(state);

        var color = event.data.substring(7, 13);
        controlLayer.shelfColorIndicator.setColor('#' + color);

        var color = event.data.substring(13, 19);
        controlLayer.deskColorIndicator.setColor('#' + color);

    } else if (target == 'L') {
        var state = state_from_character(event.data[1]);
        controlLayer.lightSwitch.state = state;
        controlLayer.lightSwitch.setState(state);

    } else if (target == 'l') {
        var state = state_from_character(event.data[1]);
        controlLayer.lampSwitch.state = state;
        controlLayer.lampSwitch.setState(state);

    } else if (target == 'p') {
        var state = state_from_character(event.data[1]);
        controlLayer.portalSwitch.state = state;
        controlLayer.portalSwitch.setState(state);

    } else if (target == 't') {
        var state = state_from_character(event.data[1]);
        controlLayer.televisionSwitch.state = state;
        controlLayer.televisionSwitch.setState(state);

    } else if (target == 's') {
        var state = state_from_character(event.data[1]);
        controlLayer.shelfSwitch.state = state;
        controlLayer.shelfSwitch.setState(state);

    } else if (target == 'd') {
        var state = state_from_character(event.data[1]);
        controlLayer.deskSwitch.state = state;
        controlLayer.deskSwitch.setState(state);

    } else if (target == 'S') {
        var color = event.data.substring(1);
        controlLayer.shelfColorIndicator.setColor('#' + color);

    } else if (target == 'D') {
        var color = event.data.substring(1);
        controlLayer.deskColorIndicator.setColor('#' + color);

    } else {
        alert(`invalid target ${event.data}`);
    }
};

socket.onclose = function(event) {
    //alert('connection died');
};

socket.onerror = function(error) {
    alert(`error ${error.message}`);
};
