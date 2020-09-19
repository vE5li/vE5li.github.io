function addMessageLayer(stage, socket, offsetLayers) {

    const openHeight = 115;
    const closedHeight = 70;
    const advancedHeight = 330;
    const openSpeed = 0.3;
    const advancedOpenSpeed = 0.8;

    const travel = 45;
    const buttonsThreshhold = 45;
    const amplitudeThreshhold = 110;
    const pitchThreshhold = 160;
    const speedThreshhold = 210;
    const englishThreshhold = 260;

    var layer = new Konva.Layer();
    var background = addBackground(layer, canvasWidth, closedHeight, "#333333");

    var sendMessageField = addTextfield(layer, 70, 20, openMessageField, closeMessageField, confirmMessageField);
    var cancelMessageButton = addButton(layer, 'cancel', 70, 65, 130, 30, false, cancelMessageField);
    var confirmMessageButton = addButton(layer, 'confirm', 600, 65, 130, 30, true, confirmMessageField);
    var advancedSwitch = addSwitch(layer, 'advanced settings', 270, 65, 170, toggleAdvanced);
    var amplitudeSlider = addSwitch(layer, 'amplitude', 70, 130, 230, toggleEnglish);
    var pitchSlider = addSwitch(layer, 'pitch', 70, 180, 230, toggleEnglish);
    var speedSlider = addSwitch(layer, 'speed', 70, 230, 230, toggleEnglish);
    var englishSwitch = addSwitch(layer, 'english', 70, 280, 230, toggleEnglish);

    updateButtonsMenu(closedHeight);

    function toggleEnglish() {
        var state = !englishSwitch.state;
        englishSwitch.state = state;
        englishSwitch.setState(state);
    }

    function toggleAdvanced() {
        var state = !advancedSwitch.state;
        advancedSwitch.state = state;
        advancedSwitch.setState(state);

        if (state) {
            closeButtonsMenu.stop();
            openButtonsMenu.stop();
            closeAdvancedMenu.stop();
            openAdvancedMenu.start()
        } else {
            closeButtonsMenu.stop();
            openButtonsMenu.stop();
            openAdvancedMenu.stop()
            closeAdvancedMenu.start();
        }
    }

    function updateButtons(opacity, offset) {
        cancelMessageButton.update(opacity, offset);
        confirmMessageButton.update(opacity, offset);
        advancedSwitch.update(opacity, offset);
    }

    function openMessageField() {
        openAdvancedMenu.stop();
        closeAdvancedMenu.stop();
        closeButtonsMenu.stop();
        openButtonsMenu.start();
    }

    function cancelMessageField() {
        sendMessageField.clear();
        closeMessageField();
    }

    function closeMessageField() {
        openAdvancedMenu.stop();
        closeAdvancedMenu.stop();
        openButtonsMenu.stop();
        closeButtonsMenu.start();
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
        return background.height() + 10;
    }

    function updateThreshhold(updateFunction, threshhold, scaling, delta) {
        if (delta <= threshhold) {
            var offsetDelta = delta - threshhold + travel;
            if (offsetDelta >= 0) {
                const steps = 1.0 / travel;
                const opacity = steps * offsetDelta;
                const offset = (travel - offsetDelta) / scaling;
                updateFunction(opacity, offset);
            } else {
                updateFunction(0, 0);
            }
        } else {
            updateFunction(1, 0);
        }
    }

    function updateButtonsMenu(height) {
        var delta = height - closedHeight;
        updateThreshhold(updateButtons, buttonsThreshhold, 4, delta);
        updateThreshhold(amplitudeSlider.update, amplitudeThreshhold, 6, delta);
        updateThreshhold(pitchSlider.update, pitchThreshhold, 6, delta);
        updateThreshhold(speedSlider.update, speedThreshhold, 6, delta);
        updateThreshhold(englishSwitch.update, englishThreshhold, 6, delta);
    }

    var openButtonsMenu = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var destinationHeight = (advancedSwitch.state) ? advancedHeight : openHeight;
        var speed = (advancedSwitch.state) ? advancedOpenSpeed : openSpeed;
        var newHeight = background.height() + timeDiff * speed;

        if (newHeight > destinationHeight) {
            newHeight = destinationHeight;
            openButtonsMenu.stop();
        }

        updateButtonsMenu(newHeight);
        background.height(newHeight);
        offsetLayers();
    }, layer);

    var closeButtonsMenu = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var speed = (advancedSwitch.state) ? advancedOpenSpeed : openSpeed;
        var newHeight = background.height() - timeDiff * speed;

        if (newHeight < closedHeight) {
            newHeight = closedHeight;
            closeButtonsMenu.stop();
        }

        updateButtonsMenu(newHeight);
        background.height(newHeight);
        offsetLayers();
    }, layer);

    var openAdvancedMenu = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var newHeight = background.height() + timeDiff * advancedOpenSpeed;

        if (newHeight > advancedHeight) {
            newHeight = advancedHeight;
            openAdvancedMenu.stop();
        }

        updateButtonsMenu(newHeight);
        background.height(newHeight);
        offsetLayers();
    }, layer);

    var closeAdvancedMenu = new Konva.Animation(function(frame) {
        var timeDiff = frame.timeDiff;
        var newHeight = background.height() - timeDiff * advancedOpenSpeed;

        if (newHeight < openHeight) {
            newHeight = openHeight;
            closeAdvancedMenu.stop();
        }

        updateButtonsMenu(newHeight);
        background.height(newHeight);
        offsetLayers();
    }, layer);

    stage.add(layer);

    return {
        offset: offset,
    }
}
