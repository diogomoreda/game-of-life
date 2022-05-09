var GOL = {};
GOL.config = {
    pixelWidth: 10, // in px
    pixelHeight: 10, // in px
    intervalTime: 150, // in mS
    maxPixels: 400,
    messages: {
        start: 'click & drag to draw. press SPACE to animate...'
    }
};
GOL.mouse = {
    x: null,
    y: null,
    down: false,
    ctrl: false
};
GOL.pixels = []; // {x, y, ref} 
GOL.interval = null;
GOL.play = false;
GOL.lastPixelIndex = {
    x: null,
    y: null
};
GOL.refs = {
    board: null,
    legend: null
};

GOL.shapes = {
    blinker: [0,0, 1,0, 2,0], 
    toad: [0,1, 1,1, 2,1, 1,0, 2,0, 3,0],
    beacon: [0,0, 1,0, 0,1, 2,3, 3,3, 3,2],
    pulsar: [12,30,12,31,14,33,15,33,16,33,17,32,17,31,17,30,19,30,19,31,19,32,20,33,21,33,22,33,19,36,19,37,19,38,20,35,21,35,22,35,14,35,15,35,16,35,17,36,17,37,17,38,12,37,12,38,24,37,24,38,24,31,24,30,12,32,16,28,15,28,14,28,20,28,21,28,22,28,24,32,14,40,15,40,16,40,20,40,21,40,22,40,12,36,24,36],
    penta: [7,9, 7,10, 7,11, 7,12, 6,8, 8,8, 7,7, 7,6, 6,13, 8,13, 7,14, 7,15],
    glider: [0,2, 1,2, 2,2, 2,1, 1,0],
    spaceship: [13,5, 12,4, 11,4, 10,5, 9,5, 9,6, 10,6, 12,6, 11,6, 12,5, 10,7, 11,7]
};


GOL.printShape = function(shapeName, offsetX, offsetY) {
    if (!offsetX) offsetX = 0;
    if (!offsetY) offsetY = 0;    
    for (var i in GOL.shapes) {
        if (i == shapeName) {
            for (var u=0; u<Math.round(GOL.shapes[i].length / 2); u++) {
                GOL.addPixel(parseInt(GOL.shapes[i][u*2]) + offsetX, parseInt(GOL.shapes[i][u*2+1]) + offsetY);
           }
        }
        
    }
};


GOL.getPixelIndex = function(pixelX, pixelY) {
    for (var i=0; i<GOL.pixels.length; i++) {
        if (GOL.pixels[i].x == pixelX) {
            if (GOL.pixels[i].y == pixelY) return i;
        }
    }
    return -1; 
};


GOL.draw = function() {
    // get pixel coords based on mouse coords
    var pixelX = !GOL.mouse.x ? 0 : Math.floor(GOL.mouse.x / GOL.config.pixelWidth);
    var pixelY = !GOL.mouse.y ? 0 : Math.floor(GOL.mouse.y / GOL.config.pixelHeight);

    if (pixelX == GOL.lastPixelIndex.x && pixelY == GOL.lastPixelIndex.y) return;
    GOL.lastPixelIndex.x = pixelX;
    GOL.lastPixelIndex.y = pixelY;    
    
    // check if pixel already exists
    var pixelIndex = GOL.getPixelIndex(pixelX, pixelY);
    pixelIndex == -1 ? GOL.addPixel(pixelX, pixelY) : GOL.removePixel(pixelIndex);
};


GOL.resize = function() {
    return;
    var w = Math.floor(GOL.refs.board.offsetWidth / GOL.config.pixelWidth);
    var h = Math.floor(GOL.refs.board.offsetHeight / GOL.config.pixelHeight);
    for (var i=0; i<GOL.pixels.length; i++) {
        if (GOL.pixels[i].x >= w) {
            GOL.pixels[i].x = GOL.pixels[i].x - w;
            GOL.pixels[i].ref.style.left = (GOL.pixels[i].x * GOL.config.pixelWidth) + 'px';
        }
        if (GOL.pixels[i].y >= h) {
            GOL.pixels[i].y = GOL.pixels[i].y - h;
            GOL.pixels[i].ref.style.top = (GOL.pixels[i].y * GOL.config.pixelHeight) + 'px';
        }        
    }
};


GOL.addPixel = function(pixelX, pixelY) {
    if (GOL.pixels.length > GOL.config.maxPixels) return;
    var w = Math.floor(GOL.refs.board.offsetWidth / GOL.config.pixelWidth);
    var h = Math.floor(GOL.refs.board.offsetHeight / GOL.config.pixelHeight);
    var pixel = document.createElement('div');
    pixel.style.left = ((pixelX % w) * GOL.config.pixelWidth) + 'px';
    pixel.style.top = ((pixelY % h) * GOL.config.pixelHeight) + 'px';
    pixel.style.width = GOL.config.pixelWidth + 'px';
    pixel.style.height = GOL.config.pixelHeight + 'px';
    GOL.pixels.push({x: pixelX % w, y: pixelY % h, ref: pixel});
    GOL.refs.board.appendChild(pixel);
};


GOL.removePixel = function(pixelIndex) {
    if (GOL.pixels[pixelIndex].ref.parentElement) GOL.pixels[pixelIndex].ref.parentElement.removeChild(GOL.pixels[pixelIndex].ref);
    GOL.pixels.splice(pixelIndex, 1);
};


GOL.clear = function() {
    for (var i=GOL.pixels.length-1; i>=0; i--) 
        GOL.removePixel(i);
};


GOL.countNeighbours = function(pixelX, pixelY) {
    var w = Math.floor(GOL.refs.board.offsetWidth / GOL.config.pixelWidth);
    var h = Math.floor(GOL.refs.board.offsetHeight / GOL.config.pixelHeight);
    var count = 0;
    for (var i=0; i<9; i++) {
        if (i == 4) continue;
        var x = pixelX + (Math.floor(i / 3) - 1);
        var y = pixelY + ((i % 3) - 1);
        x = x < 0 ? w + x : x % w;
        y = y < 0 ? h + y : y % h;
        if (GOL.getPixelIndex(x, y) != -1) count++;
    }
    return count;
};


GOL.getNewPixels = function(pixelX, pixelY) {
    var w = Math.floor(GOL.refs.board.offsetWidth / GOL.config.pixelWidth);
    var h = Math.floor(GOL.refs.board.offsetHeight / GOL.config.pixelHeight);
    var newPixels = [];
    for (var i=0; i<9; i++) {
        if (i == 4) continue;
        var x = pixelX + (Math.floor(i / 3) - 1);
        var y = pixelY + ((i % 3) - 1);
        x = x < 0 ? w + x : x % w;
        y = y < 0 ? h + y : y % h;
        if (GOL.getPixelIndex(x, y) == -1) {            
            if (GOL.countNeighbours(x, y) == 3) 
                newPixels.push({x: x, y: y});
        }
    }
    return newPixels;
};


GOL.loop = function() {
    var pixelsToAdd = [];
    var pixelsToRemove = [];
    for (var i=0; i<GOL.pixels.length; i++) {
        // 1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
        // 2. Any live cell with two or three live neighbours lives on to the next generation.
        // 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
        var count = GOL.countNeighbours(GOL.pixels[i].x, GOL.pixels[i].y);
        if (count < 2 || count > 3 ) pixelsToRemove.push(i);
        // 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction
        var newPixels = GOL.getNewPixels(GOL.pixels[i].x, GOL.pixels[i].y);
        pixelsToAdd = pixelsToAdd.concat(newPixels);
    }
    for (var i=pixelsToRemove.length-1; i>=0; i--) {
        GOL.removePixel(pixelsToRemove[i]);
    }
    for (var i=0; i<pixelsToAdd.length; i++) {
        if (GOL.getPixelIndex(pixelsToAdd[i].x, pixelsToAdd[i].y) == -1)
            GOL.addPixel(pixelsToAdd[i].x, pixelsToAdd[i].y);
    }
};


GOL.togglePlayback = function() {
    GOL.play = !GOL.play;
    if (GOL.play) {
        GOL.interval = window.setInterval(
            function() {
                GOL.loop();
                GOL.refs.legend.innerHTML = GOL.pixels.length;
            }, 
            GOL.config.intervalTime
        );
    } else {
        if (GOL.interval) window.clearInterval(GOL.interval);
        GOL.refs.legend.innerHTML = GOL.config.messages.start;
    }
}


GOL.start = function() {

    GOL.refs.board = document.createElement('div');
    GOL.refs.board.className = 'game-of-life';

    GOL.refs.board.onmousemove = function(e) {
        GOL.mouse.x = e.pageX;
        GOL.mouse.y = e.pageY;
        if (GOL.mouse.down) 
        GOL.draw();        
    };


    GOL.refs.board.onmousedown = function(e) {
        e.stopPropagation();
        e.preventDefault();
        GOL.mouse.down = true;
        GOL.draw(); 
        return false;
    };


    GOL.refs.board.onmouseup = function(e) {
        e.stopPropagation();
        e.preventDefault();
        GOL.mouse.down = false;
        GOL.lastPixelIndex.x = null;
        GOL.lastPixelIndex.y = null;
        return false;
    };


    window.onresize = function() {
        GOL.resize();
    };

    GOL.refs.legend = document.createElement('div');
    GOL.refs.legend.className = 'game-of-life-legend';
    GOL.refs.legend.style.cssText = 'right: 0; bottom: 0; font-size: 15px; line-height: 17px; color: #333; padding: 5px; background-color: transparent';
    GOL.refs.legend.innerHTML = GOL.config.messages.start;
    GOL.refs.board.appendChild(GOL.refs.legend);


    document.body.onkeydown = function(e) {
        //if (e.ctrlKey) {
            //GOL.mouse.ctrl = true;
        //}
    };


    document.body.onkeyup = function(e) {
        if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
            GOL.togglePlayback();
        }
        if (e.key == "e") {
            var csv = '';
            for (var i=0; i<GOL.pixels.length; i++) {
                csv += GOL.pixels[i].x + ',' + GOL.pixels[i].y + ', ';
            }
            csv = csv.substring(0, csv.length - 2);
            console.log(csv);
        }
        //if (e.ctrlKey) { 
            //GOL.mouse.ctrl = false;
        //}
    };

    document.body.appendChild(GOL.refs.board);

    var x = 0;
    var y = 0;
    for (var i in GOL.shapes) {
        GOL.printShape(i, x, y);
        x += 10;
        y += 1;
    }

    //GOL.printShape('glider');
    //GOL.printShape('glider', 10, 3);
    //GOL.printShape('glider', 20, 6);
    //GOL.printShape('pulsar', 10, 25);
    //GOL.refs.board.onmouseup();
    //GOL.togglePlayback();
};


window.onload = function() {
    GOL.start();
};