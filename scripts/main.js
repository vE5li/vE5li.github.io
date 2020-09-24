var canvasWidth = 800;
var canvasHeight = 800;
var stage = new Konva.Stage({
    container: "container",
    width: canvasWidth,
    height: canvasHeight
});

let socket = new WebSocket("ws://192.168.178.80:8765");
//var bannerLayer = addBannerLayer(stage, socket);
var controlLayer = addControlLayer(stage, socket, offsetLayers);
var messageLayer = addMessageLayer(stage, socket, offsetLayers);
var layers = [controlLayer, messageLayer];
offsetLayers();

function offsetLayers() {
    var offset = 20;
    for (let layer of layers) {
        offset += layer.offset(offset);
    }
    stage.draw();
}

socket.onopen = function(e) {
    socket.send("0");
};

socket.onmessage = function(event) {
    var target = event.data[0];

    function state_from_character(character) {
        return character == '1';
    }

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
        controlLayer.updateShelfSwitch(state);

        var state = state_from_character(event.data[6]);
        controlLayer.deskSwitch.state = state;
        controlLayer.deskSwitch.setState(state);
        controlLayer.updateDeskSwitch(state);

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
        controlLayer.updateShelfSwitch(state);

    } else if (target == 'd') {
        var state = state_from_character(event.data[1]);
        controlLayer.deskSwitch.state = state;
        controlLayer.deskSwitch.setState(state);
        controlLayer.updateDeskSwitch(state);

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
