function character_from_state(state) {
    return (state) ? '1' : '0';
}

function state_from_character(character) {
    return character == '1';
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

function openMessageField() {
    sendMessageField.open('');
    cancelMessageButton.show();
    confirmMessageButton.show();
    layer.draw();
}

function cancelMessageField() {
    sendMessageField.close();
    cancelMessageButton.hide();
    confirmMessageButton.hide();
    layer.draw();
}

function confirmMessageField() {
    var message = sendMessageField.close();
    sendMessage(message);
    cancelMessageButton.hide();
    confirmMessageButton.hide();
    layer.draw();
}

function sendMessage(message) {
    if (message.length > 0) { // FIX ME
        socket.send('m' + message);
    }
}

var canvasWidth = 900;
var canvasHeight = 400;
var layer = new Konva.Layer();
var stage = new Konva.Stage({
    container: "container",
    width: canvasWidth,
    height: canvasHeight
});

var lightSwitch = addSwitch(layer, 'light', 0, 10,sendLightState);
var lampSwitch = addSwitch(layer, 'lamps', 0, 60, sendLampState);
var portalSwitch = addSwitch(layer, 'portal', 0, 110, sendPortalState);
var televisionSwitch = addSwitch(layer, 'television', 320, 10, sendTelevisionState);
var shelfSwitch = addSwitch(layer, 'shelf', 320, 60, sendShelfState);
var deskSwitch = addSwitch(layer, 'desk', 320, 110, sendDeskState);

var sendMessageButton = addButton(layer, 'send a message', 0, 170, 600, 30, true, true, openMessageField);
var cancelMessageButton = addButton(layer, 'cancel', 0, 210, 295, 30, false, false, cancelMessageField);
var confirmMessageButton = addButton(layer, 'confirm', 305, 210, 295, 30, true, false, confirmMessageField);

var sendMessageField = addTextfield(layer, 0, 170, confirmMessageField);

stage.add(layer);

let socket = new WebSocket("ws://[2a02:908:1b12:8360:940:7925:c66:4b80]:8765");

socket.onopen = function(e) {
    socket.send("0");
};

socket.onmessage = function(event) {
    var target = event.data[0];

    if (target == '0') {
        var state = state_from_character(event.data[1]);
        lightSwitch.state = state;
        lightSwitch.setState(state);

        var state = state_from_character(event.data[2]);
        lampSwitch.state = state;
        lampSwitch.setState(state);

        var state = state_from_character(event.data[3]);
        portalSwitch.state = state;
        portalSwitch.setState(state);

        var state = state_from_character(event.data[4]);
        televisionSwitch.state = state;
        televisionSwitch.setState(state);

        var state = state_from_character(event.data[5]);
        shelfSwitch.state = state;
        shelfSwitch.setState(state);

        var state = state_from_character(event.data[6]);
        deskSwitch.state = state;
        deskSwitch.setState(state);

    } else if (target == 'L') {
        var state = state_from_character(event.data[1]);
        lightSwitch.state = state;
        lightSwitch.setState(state);
    } else if (target == 'l') {
        var state = state_from_character(event.data[1]);
        lampSwitch.state = state;
        lampSwitch.setState(state);
    } else if (target == 'p') {
        var state = state_from_character(event.data[1]);
        portalSwitch.state = state;
        portalSwitch.setState(state);
    } else if (target == 't') {
        var state = state_from_character(event.data[1]);
        televisionSwitch.state = state;
        televisionSwitch.setState(state);
    } else if (target == 's') {
        var state = state_from_character(event.data[1]);
        shelfSwitch.state = state;
        shelfSwitch.setState(state);
    } else if (target == 'd') {
        var state = state_from_character(event.data[1]);
        deskSwitch.state = state;
        deskSwitch.setState(state);
    } else {
        alert(`invalid target ${event.data}`);
    }
};

socket.onclose = function(event) {
    if (event.wasClean) {
        //alert(`connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        alert('connection died');
    }
};

socket.onerror = function(error) {
    alert(`error ${error.message}`);
};
