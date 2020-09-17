function character_from_state(state) {
    return (state) ? '1' : '0';
}

function state_from_character(character) {
    return character == '1';
}

//function openMessageField() {
//    sendMessageField.open('');
//    cancelMessageButton.show();
//    confirmMessageButton.show();
//    layer.draw();
//}
//
//function cancelMessageField() {
//    sendMessageField.close();
//    cancelMessageButton.hide();
//    confirmMessageButton.hide();
//    layer.draw();
//}
//
//function confirmMessageField() {
//    var message = sendMessageField.close();
//    sendMessage(message);
//    cancelMessageButton.hide();
//    confirmMessageButton.hide();
//    layer.draw();
//}
//
//function sendMessage(message) {
//    if (message.length > 0) { // FIX ME
//        socket.send('m' + message);
//    }
//}

function addControlLayer(stage) {

    const openHeight = 230;
    const closedHeight = 180;
    const openSpeed = 0.3;
    var selectedIndicator;

    var layer = new Konva.Layer();
    var background = addBackground(layer, canvasWidth, 180, "#333333");
    var lightSwitch = addSwitch(layer, 'light', 70, 20, sendLightState);
    var lampSwitch = addSwitch(layer, 'lamps', 70, 70, sendLampState);
    var portalSwitch = addSwitch(layer, 'portal', 70, 120, sendPortalState);
    var televisionSwitch = addSwitch(layer, 'television', 420, 20, sendTelevisionState);
    var shelfSwitch = addSwitch(layer, 'shelf', 420, 70, sendShelfState);
    var deskSwitch = addSwitch(layer, 'desk', 420, 120, sendDeskState);
    var shelfColorIndicator = addColorIndicator(layer, 420, 70, openShelfPicker);
    var deskColorIndicator = addColorIndicator(layer, 420, 120, openDeskfPicker);
    var colorPicker = addColorPicker(layer, 70, 180, 630, closeColorPicker, setColor);

    function sendLightState() {
        var message = 'L' + character_from_state(!layer1.lightSwitch.state);
        socket.send(message);
    }

    function sendLampState() {
        var message = 'l' + character_from_state(!layer1.lampSwitch.state);
        socket.send(message);
    }

    function sendPortalState() {
        var message = 'p' + character_from_state(!layer1.portalSwitch.state);
        socket.send(message);
    }

    function sendTelevisionState() {
        var message = 't' + character_from_state(!layer1.televisionSwitch.state);
        socket.send(message);
    }

    function sendShelfState() {
        var message = 's' + character_from_state(!layer1.shelfSwitch.state);
        socket.send(message);
    }

    function sendDeskState() {
        var message = 'd' + character_from_state(!layer1.deskSwitch.state);
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
        layer.draw();
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
        layer.draw();
    }, layer);

    stage.add(layer);

    return {
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

//var sendMessageButton = addButton(layer, 'send a message', 0, 210, 600, 30, true, true, openMessageField);
//var cancelMessageButton = addButton(layer, 'cancel', 0, 250, 295, 30, false, false, cancelMessageField);
//var confirmMessageButton = addButton(layer, 'confirm', 305, 250, 295, 30, true, false, confirmMessageField);
//var sendMessageField = addTextfield(layer, 0, 210, confirmMessageField);

var canvasWidth = 800;
var canvasHeight = 400;
var stage = new Konva.Stage({
    container: "container",
    width: canvasWidth,
    height: canvasHeight
});

var layer1 = addControlLayer(stage);
let socket = new WebSocket("ws://[2a02:908:1b12:8360:ad79:dd57:6903:9bfc]:8765");

socket.onopen = function(e) {
    socket.send("0");
};

socket.onmessage = function(event) {
    var target = event.data[0];

    if (target == '0') {
        var state = state_from_character(event.data[1]);
        layer1.lightSwitch.state = state;
        layer1.lightSwitch.setState(state);

        var state = state_from_character(event.data[2]);
        layer1.lampSwitch.state = state;
        layer1.lampSwitch.setState(state);

        var state = state_from_character(event.data[3]);
        layer1.portalSwitch.state = state;
        layer1.portalSwitch.setState(state);

        var state = state_from_character(event.data[4]);
        layer1.televisionSwitch.state = state;
        layer1.televisionSwitch.setState(state);

        var state = state_from_character(event.data[5]);
        layer1.shelfSwitch.state = state;
        layer1.shelfSwitch.setState(state);

        var state = state_from_character(event.data[6]);
        layer1.deskSwitch.state = state;
        layer1.deskSwitch.setState(state);

        var color = event.data.substring(7, 13);
        layer1.shelfColorIndicator.setColor('#' + color);

        var color = event.data.substring(13, 19);
        layer1.deskColorIndicator.setColor('#' + color);

    } else if (target == 'L') {
        var state = state_from_character(event.data[1]);
        layer1.lightSwitch.state = state;
        layer1.lightSwitch.setState(state);

    } else if (target == 'l') {
        var state = state_from_character(event.data[1]);
        layer1.lampSwitch.state = state;
        layer1.lampSwitch.setState(state);

    } else if (target == 'p') {
        var state = state_from_character(event.data[1]);
        layer1.portalSwitch.state = state;
        layer1.portalSwitch.setState(state);

    } else if (target == 't') {
        var state = state_from_character(event.data[1]);
        layer1.televisionSwitch.state = state;
        layer1.televisionSwitch.setState(state);

    } else if (target == 's') {
        var state = state_from_character(event.data[1]);
        layer1.shelfSwitch.state = state;
        layer1.shelfSwitch.setState(state);

    } else if (target == 'd') {
        var state = state_from_character(event.data[1]);
        layer1.deskSwitch.state = state;
        layer1.deskSwitch.setState(state);

    } else if (target == 'S') {
        var color = event.data.substring(1);
        layer1.shelfColorIndicator.setColor('#' + color);

    } else if (target == 'D') {
        var color = event.data.substring(1);
        layer1.deskColorIndicator.setColor('#' + color);

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
