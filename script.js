/**
* THE SHIP
 */

var ship;
var asteroids = [];
var lasers = [];

function setup(){
    createCanvas(windowWidth, windowHeight);
    ship = new Ship();
    //change the number of asteroids
    for (var i=0; i<5; i++){
        asteroids.push(new Asteroid());
    }
}

function draw(){
    background(0);

    for (var i=0; i<asteroids.length; i++){
        if (ship.hits(asteroids[i])){
            console.log('SHIP WAS HIT!')
        }
        asteroids[i].render();
        asteroids[i].update();
        asteroids[i].edges();
    }

    for (var i=lasers.length-1; i>=0; i--){
        lasers[i].render();
        lasers[i].update();
        if (lasers[i].offscreen()) {
            lasers.splice(i, 1);
        } else {
            for (var j = asteroids.length - 1; j >= 0; j--) {
                if (lasers[i].hits(asteroids[j])) {
                    if (asteroids[j].r > 10) {
                        var newAsteroids = asteroids[j].breakup();
                        asteroids = asteroids.concat(newAsteroids);
                    } //else {
                    //increase the score
                    //}
                    asteroids.splice(j, 1);
                    lasers.splice(i, 1);
                    break;
                }
            }
        }
    }

    ship.render();
    ship.turn();
    ship.update();
    ship.edges();
}

function keyReleased(){
    ship.setRotation(0);
    ship.boosting(false);
}

function keyPressed(){
    if (key === ' '){
        lasers.push(new Laser(ship.pos, ship.heading));
    } else if (keyCode === RIGHT_ARROW){
        ship.setRotation(0.1);
    } else if (keyCode === LEFT_ARROW){
        ship.setRotation(-0.1);
    } else if (keyCode === UP_ARROW){
        ship.boosting(true);
    }
}

function Ship(){
    this.pos = createVector(width/2, height/2);
    this.r = 20;
    this.heading = 0;
    this.rotation = 0;
    this.velocity = createVector(0, 0);
    this.isBoosting = false;

    this.boosting = function(boolean){
        this.isBoosting = boolean;
    };

    this.update = function(){
        if (this.isBoosting) {
            this.boost();
        }
        this.pos.add(this.velocity);
        this.velocity.mult(0.99);
    };

    this.boost = function(){
        var force = p5.Vector.fromAngle(this.heading);
        force.mult(0.1);
        this.velocity.add(force);
    };

    this.hits = function(asteroid){
        var d = dist(this.pos.x, this.pos.y, asteroid.pos.x, asteroid.pos.y);
        if (d < this.r + asteroid.r) {
            return true;
        }
    };

    this.render = function(){
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.heading + Math.PI / 2);
        fill(0);
        stroke(255);
        triangle(-this.r, this.r, this.r, this.r, 0, -this.r);
        pop();
    };

    this.edges = function(){
        if (this.pos.x > width + this.r){
            this.pos.x = -this.r;
        } else if (this.pos.x < -this.r){
            this.pos.x = width + this.r;
        }

        if (this.pos.y > height + this.r){
            this.pos.y = -this.r;
        } else if (this.pos.y < -this.r){
            this.pos.y = height + this.r;
        }
    };

    this.setRotation = function(a){
        this.rotation = a;
    };

    this.turn = function(){
        this.heading += this.rotation;
    }
}

/**
* ASTEROIDS
 */

function Asteroid(pos, r){
    if (pos) {
        this.pos = pos.copy();
    } else {
        this.pos = createVector(random(width), random(height));
    }
    if (r) {
        this.r = r * 0.5;
    } else {
        //change the size of the asteroids
        this.r = random(20, 50);
    }
    this.velocity = p5.Vector.random2D();
    this.total = floor(random(5, 15));
    this.offset = [];
    for (var i=0; i<this.total; i++){
        this.offset[i] = random(-this.r*0.5, this.r*0.5);
    }

    this.update = function(){
        this.pos.add(this.velocity);
    };

    this.render = function(){
        push();
        stroke(255);
        noFill();
        translate(this.pos.x, this.pos.y);
        beginShape();
        for (var i=0; i<this.total; i++){
            var angle = map(i, 0, this.total, 0, (Math.PI * 2));
            var r = this.r + this.offset[i];
            var x = r * cos(angle);
            var y = r * sin(angle);
            vertex(x, y);
        }
        endShape(CLOSE);
        pop();
    };

    this.breakup = function(){
        var newA = [];
        newA[0] = new Asteroid(this.pos, this.r);
        newA[1] = new Asteroid(this.pos, this.r);
        return newA;
    };

    this.edges = function(){
        if (this.pos.x > width + this.r){
            this.pos.x = -this.r;
        } else if (this.pos.x < -this.r){
            this.pos.x = width + this.r;
        }

        if (this.pos.y > height + this.r){
            this.pos.y = -this.r;
        } else if (this.pos.y < -this.r){
            this.pos.y = height + this.r;
        }
    };
}

/**
 * LASER
 */

function Laser(shipPos, angle){
    this.pos = createVector(shipPos.x, shipPos.y);
    this.velocity = p5.Vector.fromAngle(angle);
    this.velocity.mult(10);

    this.update = function(){
        this.pos.add(this.velocity);
    };

    this.render = function(){
        push();
        stroke(255);
        strokeWeight(4);
        point(this.pos.x, this.pos.y);
        pop();
    };

    this.hits = function(asteroid){
        var distance = dist(this.pos.x, this.pos.y, asteroid.pos.x, asteroid.pos.y);
        if (distance < asteroid.r){
            return true;
        }
    };

    this.offscreen = function(){
        if (this.pos.x > width || this.pos.x < 0) {
            return true;
        }

        if (this.pos.y > height || this.pos.y < 0){
            return true;
        }
        return false;
    };
}