function addBannerLayer(stage, socket) {

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
