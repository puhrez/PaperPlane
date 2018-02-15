(function (window, document, createjs, loadingEl, loadingInterval) {
    console.log("Starting up!");
    /*
     * Game configuration
     */
    var gameConfig = {
	clickStart: "ontouchstart" in document.documentElement ?
	    "touchstart" : "mousedown",
	clickEnd: "ontouchstart" in document.documentElement ?
	    "touchend" : "mouseup",
	preloadQueue: new createjs.LoadQueue()
    }

    /*
     * Game state
     */
    game = {
	lost: false,
	stage: new createjs.Stage("game"),
	initText: new createjs.Text("Click to stay afloat!",
				    "45px serif", "#FAFAFA"),
	lostText: new createjs.Text("You died a disintigrating death",
				    "45px serif", "#FAFAFA"),
	restartText: new createjs.Text("Click to restart",
				       "40px serif", "#FAFAFA"),
	player: null
    };
    resizeCanvas();
    startGame = function () {
	reset();
	init();
    };
    function init () {
	if (!loadingEl.removed) {
	    loading = true;
	} else {
	    loading = false;
	}
	window.setTimeout(function() {
	    if (!loadingEl.removed) {
		loadingEl.remove();
		loadingEl.removed = true;
	    }
	    if (loadingInterval) {
		clearInterval(loadingInterval);
	    }
	    setUpInitText()
	}, loading ? 4000 : 0);
	window.setTimeout(function() {
	    game.stage.removeChild(game.initText);
	    game.stage.update()
	    setUp();
	}, loading ? 5000 : 2000);
    }
    function reset () {
	document.removeEventListener(gameConfig.clickStart, startGame);
	game.stage.removeAllChildren();
	game.lost = false;
	game.stage.update();
    }
    function loadAllTheThings() {
	gameConfig.preloadQueue.addEventListener("complete", startGame);
	gameConfig.preloadQueue.loadManifest([
	    {src: "assets/plane-straight.png", id: "plane-straight"},
	    {src: "assets/plane-up.png", id: "plane-up"},
	    {src: "assets/plane-down.png",  id: "plane-down"},
	    {src: "assets/plane-destroyed.png", id:  "plane-destroyed"}
	]);
    }
    window.onload = loadAllTheThings();
    /*
     * Setup functions
     */
    function setUp () {
	setUpEntities();
	document.addEventListener(gameConfig.clickStart, playerLift);
	document.addEventListener(gameConfig.clickEnd, playerDescend);
	createjs.Ticker.addEventListener("tick", update);
    }
    function setUpEntities() {
	setUpPlayer();
    }
    function setUpPlayer() {
	game.player = new createjs.Bitmap(
	    gameConfig.preloadQueue.getResult("plane-straight"));
	game.stage.addChild(game.player);
	game.player.x = center(game.player, "x");
	game.player.y = center(game.player,  "y");
    };
    function setUpInitText() {
	game.initText.x = center(game.initText, "x");
	game.initText.y = center(game.initText, "y");
	game.stage.addChild(game.initText);
	game.stage.update();
    }
    function setUpLostText () {
	game.lostText.x = center(game.lostText, "x");
	game.lostText.y = center(game.lostText, "y");
	game.stage.addChild(game.lostText);
	game.restartText.y = game.stage.canvas.height / 4;
	game.restartText.x = center(game.restartText, "x");
	game.stage.addChild(game.restartText);
	document.addEventListener(gameConfig.clickStart, startGame);
    }

    /*
     * Update functions
     */
    function update () {
	if (!game.lost) {
	    updateEntities();
	} else {
	    lose();
	}
	game.stage.update();
    }
    function updateEntities () {
	checkEndConditions();
	updatePlayer();
    }
    function checkEndConditions () {
	if (!isInCanvasByAxis(game.player, "y", "top")
	    || !isInCanvasByAxis(game.player, "y", "bottom")) {
	    game.lost = true;
	}
    }
    function updatePlayer () {
	var lift = 20;
	var gravity = 20;
	if (game.player.lift) {
	    game.player.y -= lift;
	} else if (!game.player.lift) {
	    game.player.y += gravity;
	}
    }

    /*
     * Game state functions
     */
    function lose () {
	createjs.Ticker.removeEventListener("tick", update);
	document.removeEventListener(gameConfig.clickStart, playerLift);
	document.removeEventListener(gameConfig.clickEnd, playerDescend);
	game.stage.update();
	setUpLostText();
	game.player.image = gameConfig.preloadQueue
	    .getResult("plane-destroyed");
	game.stage.update()
    }

    /*
     * Listeners
     */
    window.addEventListener('resize', resizeCanvas, false);

    function playerLift () {
	game.player.image = gameConfig.preloadQueue.getResult("plane-up");
	game.player.lift = true;
    }
    function playerDescend () {
	game.player.image = gameConfig.preloadQueue.getResult("plane-down");
	game.player.lift  = false
    }

    /*
     * Helper functions
     */
    function collides(a, b, padding) {
	var padding = padding || 0;
	if (a.x >= b.x + b.width + padding
	    || a.x + b.width + padding <= b.x
	    || a.y >= b.y + b.height + padding
	    || a.y + a.height + padding <= b.y) {
	    return false;
	}
	return true;
    };
    function center (el, axis) {
	var dimension = axis == "x" ? "width" : "height";
	return (game.stage.canvas[dimension]
		- el.getTransformedBounds()[dimension]) / 2;
    }

    function isInCanvasByAxis (el, axis, border) {
	var dimension = axis == "x" ? "width" : "height";
	var offset = el[axis]
	if (border == "top") {
	    offset += (el.getTransformedBounds()[dimension] / 3.5);
	    return offset > 0;
	} else if (border == "bottom") {
	    offset += (el.getTransformedBounds()[dimension] / 1.5);
	    return offset < game.stage.canvas.height;
	}
    }

    function resizeCanvas() {
	game.stage.canvas.width = window.innerWidth;
	game.stage.canvas.height = window.innerHeight;
    }
})(window, document, createjs, loadingEl, loadingInterval);
