/*
* Ant Colony Optimization Simulator. In the natural world, ants of some species (initially) 
* wander randomly, and upon finding food return to their colony while laying down pheromone
* trails. If other ants find such a path, they are likely not to keep travelling at random,
* but instead to follow the trail, returning and reinforcing it if they eventually find food.
* This simulator shows how ants with difference intelligence can help each other to find food.
* 
* Benjamin Abdipour, University of Washington Tacoma
* Winter 2017
*/

const defaultInitialPopulation = 1;
const defaultIterationSpeed = 2000;
const defaultAntIntelligence = 10;
const studentName = "Benjamin Abdipour"
const stateName = "abdipour@uw.edu"

var path_array = [];

window.onload = function () {
    document.getElementById('antNumber').value = defaultInitialPopulation;
    document.getElementById('iterationSpeed').value = defaultIterationSpeed;
    document.getElementById('antIntelligence').value = defaultAntIntelligence;
};

function Reset() {
    window.location.reload();
}

function Help() {
    window.alert("Ants tend to move to right. Once food is found by one ant, other "
        + "new ants will follow the successful path to the food. Yet to find food is rasberry "
        + "and it turns to blueberry once it is found.\n\n"
        + "Parameters:\n"
        + "Ant per time-unit: The number of ants to be propagated in each time-unit. (>0)\n"
        + "Propagation interval : The time interval in which ants are propagated. (>0 milliseconds)\n"
        + "Ant intelligence: The intelligence that an ant can cut corners to find a shorter path to the food. (1~100)");
}

function Main() {
    const img_path = "./img/";
    const ant_sprite = "ant.png";
    const ant_nest = "nest.png";
    const ant_food = "food.png";
    const ant_food_found = "food_found.png";

    document.getElementById('start').style.display = 'none';
    document.getElementById('nest').src = img_path + ant_nest;
    document.getElementById('food').src = img_path + ant_food;

    const initialPopulation = document.getElementById("antNumber").value > 0
        ? parseInt(document.getElementById("antNumber").value) : defaultInitialPopulation;
    const iterationSpeed = document.getElementById("iterationSpeed").value > 0
        ? parseInt(document.getElementById("iterationSpeed").value) : defaultIterationSpeed;
    const antIntelligence = document.getElementById("antIntelligence").value > 0
        ? parseInt(document.getElementById("antIntelligence").value) : defaultAntIntelligence;
    const travelDistanceMultiplier = 8;
    const topBottomMarginMultiplier = 4;
    const frame_width = 10;
    const frame_height = 8;
    const offset = 100;
    var ant_array = [];
    var pathImproved = true;

    var nestLocation = nestLocation = [(Math.floor(Math.random() * offset) + offset),
    (Math.floor(Math.random() * offset * topBottomMarginMultiplier) + offset)];
    var foodLocation = [(Math.floor(Math.random() * offset) + offset * travelDistanceMultiplier),
    (Math.floor(Math.random() * offset * topBottomMarginMultiplier) + offset)];

    if (path_array.length > 0) {
        nestLocation = path_array[0][0];
        foodLocation = path_array[0][path_array[0].length - 1];
    }

    function CalculateNewDirection(probabilityKeepGoing, probabilityHowToChange, direction) {
        var rndProbabilityKeepGoing = Math.random();
        var rndProbabilityHowToChange = Math.random();

        if (rndProbabilityKeepGoing > probabilityKeepGoing) { // happens when it needs to make a change in direction
            if (rndProbabilityHowToChange <= probabilityHowToChange && direction === 0) {
                direction = 1;  // 1 means go to right
            } else if (rndProbabilityHowToChange > probabilityHowToChange && direction === 0) {
                direction = -1; // -1 means go to left
            } else if (rndProbabilityHowToChange <= probabilityHowToChange) {
                direction = 0;
            } else {
                direction *= (-1);
            }
        }

        return (direction);
    }

    function CalculateSlope(pointFrom, pointTo) {
        return ((pointTo[0] === pointFrom[0]) ? 1e4 : Math.abs((pointTo[1] - pointFrom[1]) / (pointTo[0] - pointFrom[0])));
    }

    function AntIntelligence() {
        pathImproved = false;
        var lowerIndex = 0;
        var higherIndex = 0;
        var middleIndex = 0;
        var pathLength = path_array[0].length;
        var resultArray = [];

        for (lowerIndex = 0; lowerIndex < (pathLength - 1);) {
            higherIndex = ((lowerIndex + antIntelligence) <= pathLength) ? (lowerIndex + antIntelligence) : (pathLength);
            var slope = CalculateSlope(path_array[0][lowerIndex], path_array[0][(higherIndex - 1)]);
            var slopeTemp = slope;
            resultArray.push(path_array[0][lowerIndex]);

            while ((Math.abs((resultArray[(resultArray.length - 1)][0]) - path_array[0][(higherIndex - 1)][0]) > 1)
                || (Math.abs((resultArray[(resultArray.length - 1)][1]) - path_array[0][(higherIndex - 1)][1]) > 1)) {

                if (resultArray.length > 1) {
                    slopeTemp = CalculateSlope(resultArray[resultArray.length - 1], path_array[0][(higherIndex - 1)]);
                }

                var middleXY = [resultArray[(resultArray.length - 1)][0], resultArray[(resultArray.length - 1)][1]];

                if ((resultArray[(resultArray.length - 1)][0] + 1) < path_array[0][(higherIndex - 1)][0]) {
                    middleXY[0] = (resultArray[(resultArray.length - 1)][0] + 1);
                } else if ((resultArray[(resultArray.length - 1)][0] - 1) > path_array[0][(higherIndex - 1)][0]) {
                    middleXY[0] = (resultArray[(resultArray.length - 1)][0] - 1);
                };

                if (((resultArray[(resultArray.length - 1)][1] + 1) < path_array[0][(higherIndex - 1)][1])) {
                    middleXY[1] = (resultArray[(resultArray.length - 1)][1] + 1);
                } else if (((resultArray[(resultArray.length - 1)][1] - 1) > path_array[0][(higherIndex - 1)][1])) {
                    middleXY[1] = (resultArray[(resultArray.length - 1)][1] - 1);
                };

                resultArray.push(middleXY);
            }

            if (higherIndex < pathLength) { lowerIndex = (higherIndex - 1) } else { lowerIndex = pathLength; }
        }

        resultArray.push(path_array[0][(higherIndex - 1)]);

        if (path_array[0].length > resultArray.length) {
            path_array.push(resultArray);
            path_array.sort(function (antPath1, antPath2) {
                return (antPath1.length - antPath2.length);
            });

            pathImproved = true;
        }
    }

    function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
        this.spriteSheet = spriteSheet;
        this.startX = startX;
        this.startY = startY;
        this.frameWidth = frameWidth;
        this.frameDuration = frameDuration;
        this.frameHeight = frameHeight;
        this.frames = frames;
        this.totalTime = frameDuration * frames;
        this.elapsedTime = 0;
        this.loop = loop;
        this.reverse = reverse;
    }

    Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
        var scaleBy = scaleBy || 1;
        this.elapsedTime += tick;
        if (this.loop) {
            if (this.isDone()) {
                this.elapsedTime = 0;
            }
        } else if (this.isDone()) {
            return;
        }
        var index = this.reverse ? this.frames - ((this.currentFrame()) - 1) : this.currentFrame();
        var vindex = 0;
        if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
            index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
            vindex++;
        }
        while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
            index -= Math.floor(this.spriteSheet.width / this.frameWidth);
            vindex++;
        }

        var locX = x;
        var locY = y;
        var offset = vindex === 0 ? this.startX : 0;
        ctx.drawImage(this.spriteSheet,
            index * this.frameWidth + offset,
            vindex * this.frameHeight + this.startY,
            this.frameWidth,
            this.frameHeight,
            locX,
            locY,
            this.frameWidth * scaleBy,
            this.frameHeight * scaleBy);
    }

    Animation.prototype.currentFrame = function () {
        return Math.floor(this.elapsedTime / this.frameDuration);
    }

    Animation.prototype.isDone = function () {
        return (this.elapsedTime >= this.totalTime);
    }

    function Background(game) {
        Entity.call(this, game, 350, 400);
        this.radius = 200;
    }

    Background.prototype = new Entity();
    Background.prototype.constructor = Background;
    Background.prototype.update = function () {
    }

    Background.prototype.draw = function (ctx) {
        var imgNest = document.getElementById("nest");
        var imgFood = document.getElementById("food");
        ctx.drawImage(imgNest, (nestLocation[0] - 10), (nestLocation[1] - 10));
        ctx.drawImage(imgFood, foodLocation[0], foodLocation[1]);

        Entity.prototype.draw.call(this);
    }

    function Ant(game) {
        this.antPath = [];
        this.walkAnimation = new Animation(ASSET_MANAGER.getAsset(img_path + ant_sprite),
            0, 0, frame_width, frame_height, 0.08, 3, true, false);
        this.walking = true;
        this.foundFood = false;
        this.dead = false;
        this.indexUp = 0;
        this.indexDown = 0;
        this.offset = 0;
        this.radius = 100;
        this.ground = 240;
        this.follow = false;

        if (path_array.length > 0) {
            this.antPath = path_array[0].slice(0, path_array[0].length);
            this.indexUp = 0;
            this.indexDown = (this.antPath.length - 1);
            this.follow = true;
        }

        Entity.call(this, game, 500, 240);
    }

    Ant.prototype.update = function () {
        if (this.game.walk) this.walking = true; else this.walking = false;
        if (this.walking) {
            if (this.walkAnimation.isDone()) {
                this.walkAnimation.elapsedTime = 0;
            }

            if (!this.dead && !this.foundFood) {
                if (this.follow === true) {
                    this.antPath = path_array[0].slice(0, path_array[0].length);
                    if (this.indexUp < (this.antPath.length) - 1) {
                        this.x = this.antPath[this.indexUp][0];
                        this.y = this.antPath[this.indexUp][1];
                        this.indexUp++;
                    } else {
                        this.antPath = path_array[0].slice(0, path_array[0].length);
                        this.indexDown = (this.antPath.length - 1);
                        this.indexUp--;
                        this.foundFood = true;
                    }
                } else {
                    var lastDirection = [];
                    try {
                        lastDirection[0] = this.antPath[(this.antPath.length) - 1][0] - this.antPath[(this.antPath.length) - 2][0];
                        lastDirection[1] = this.antPath[(this.antPath.length) - 1][1] - this.antPath[(this.antPath.length) - 2][1];
                        var newXYDirection = [CalculateNewDirection(0.95, 0.95, lastDirection[0]),
                        CalculateNewDirection(0.95, 0.5, lastDirection[1])];
                        this.x = this.antPath[(this.antPath.length) - 1][0] + newXYDirection[0];
                        this.y = this.antPath[(this.antPath.length) - 1][1] + newXYDirection[1];
                        var newXY = [this.x, this.y];
                        this.antPath.push(newXY);
                        if (this.x >= foodLocation[0] && this.x < (foodLocation[0] + 15)
                            && this.y >= foodLocation[1] && this.y < (foodLocation[1] + 15)) {
                            path_array.push(this.antPath);
                            path_array.sort(function (antPath1, antPath2) {
                                return (antPath1.length - antPath2.length);
                            });
                            this.antPath = path_array[0].slice(0, path_array[0].length);
                            this.indexDown = (this.antPath.length) - 1;
                            this.foundFood = true;
                        }
                    } catch (err) {
                        try {
                            lastDirection[0] = this.antPath[(this.antPath.length) - 1][0] + 1;
                            lastDirection[1] = this.antPath[(this.antPath.length) - 1][1];
                        } catch (err) {
                            lastDirection = [nestLocation[0], nestLocation[1]];
                        }
                        this.antPath.push(lastDirection);
                    }
                }
            } else if (!this.dead) { //found food
                document.getElementById('food').src = img_path + ant_food_found;
                if (pathImproved && antIntelligence > 1) AntIntelligence();

                this.x = this.antPath[this.indexDown][0];
                this.y = this.antPath[this.indexDown][1];
                this.indexDown--;
                if (this.indexDown === 0) {
                    this.dead = true;
                }
            }
        }

        Entity.prototype.update.call(this);
    }

    Ant.prototype.draw = function (ctx) {
        if (this.walking && !this.dead) {
            this.walkAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }

        Entity.prototype.draw.call(this);
    }

    var ASSET_MANAGER = new AssetManager();

    ASSET_MANAGER.queueDownload(img_path + ant_sprite);
    ASSET_MANAGER.queueDownload(img_path + ant_nest);
    ASSET_MANAGER.queueDownload(img_path + ant_food);

    ASSET_MANAGER.downloadAll(function () {
        var canvas = document.getElementById('gameWorld');
        var ctx = canvas.getContext('2d');
        var gameEngine = new GameEngine();
        var bg = new Background(gameEngine);
        gameEngine.addEntity(bg);

        (function populate() {
            for (var i = 0; i < initialPopulation; i++) {
                var ant = new Ant(gameEngine);
                ant.x = nestLocation[0];
                ant.y = nestLocation[1];
                ant_array.push(ant);
                gameEngine.addEntity(ant);
            }
            setTimeout(populate, (Math.floor(Math.random() * iterationSpeed)));
        })();

        gameEngine.init(ctx);
        gameEngine.start();
    });
}