const frames = 60;
const BRICK_WIDTH = 40;
const BRICK_HEIGHT = 20;
const PADDLE_WIDTH = 125;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 15;

let bricks = [];
let mousePos = null;
let paddle = null;
let ball = null;


function setup() {
    createCanvas(1000, 600);
    background(0);
    frameRate(frames);
    paddle = new Paddle();
    ball = new Ball();
    for(let i = 0; i< canvas.height-280; i+= BRICK_HEIGHT){
        for(let j = 0; j< canvas.width; j+= BRICK_WIDTH){
            bricks.push(new Brick(new Position(j, i)));
        }
    }
}

function draw() {
    clear();
    background(0);

    bricks.forEach(brick => brick.draw());
    paddle.draw();
    paddle.hitTest(ball);
    ball.draw();
}

function mouseClicked() {
    mousePos = new Position(mouseX, mouseY);
}

class Brick{
    constructor(position, thickness = Utils.random(1,5)){
        this.thickness = thickness;
        this.pos = position;
        this.width = BRICK_WIDTH;
        this.height = BRICK_HEIGHT;
    }
    draw(){
        if(this.isAlive()){
            if(mousePos && this.isHit()) {
                this.thickness = Math.max(0, this.thickness-1);
                mousePos = null;
            }
            fill(Utils.getColor(this.thickness));
            rect(this.pos.x, this.pos.y, this.width, this.height);
        } else{
            fill(Utils.getColor(this.thickness));
            rect(this.pos.x, this.pos.y, this.width, this.height);
        }
    }
    isAlive(){
        return this.thickness > 0;
    }
    isHit(obj = mousePos){
        if(obj.x >= this.pos.x && obj.x <= this.pos.x + this.width){
            if(obj.y >= this.pos.y && obj.y <= this.pos.y + this.height){
                return true;
            }
        }
        return false;
    }
    hitTest(ball){
        const ballLeftX = ball.x - ball.radius;
        const ballRightX = ball.x + ball.radius;
        const ballUpY = ball.y - ball.radius;
        const ballDownY = ball.y + ball.radius;

        const brickUpY = this.y;
        const brickDownY = this.y + this.height;
        const brickLeftX = this.x;
        const brickRightX = this.x+this.width;

        let isInX = (ballLeftX <= brickRightX && ballRightX >= brickLeftX);
        let isInY = (ballUpY <= brickDownY && ballDownY >= brickUpY);

        if(isInX && isInY){
            // Determine which direction in came from
            // ______
            // |\  /|
            // | \/ |
            // | /\ |
            // |/__\|
        }
    }
}

class Paddle{
    constructor(){
        this.x = canvas.width/2 - PADDLE_WIDTH;
        this.y = canvas.height - 25;
        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;
    }
    draw(){
        fill("white");
        this.x = mouseX;
        rect(this.x-this.width/2, this.y, this.width, this.height);
    }
    hitTest(ball){
        const ballLeftX = ball.x - ball.radius;
        const ballRightX = ball.x + ball.radius;
        const ballDownY = ball.y + ball.radius;
        const paddleY = this.y + this.height;
        const paddleLeftX = this.x-this.width/2;
        const paddleRightX = this.x+this.width/2;

        if(ballLeftX <= paddleRightX && ballRightX >= paddleLeftX && ballDownY >= paddleY){
            ball.reverseY();
        }
    }
}

class Ball{
    constructor(){
        this.x = canvas.width/2 - PADDLE_WIDTH;
        this.y = canvas.height - 50;
        this.radius = BALL_RADIUS;
        this.speed = Utils.random(4,6);
        this.delta = new Position(Utils.random(-1,1), Utils.random(-1,1));
        this.delta.multiply(this.speed);
    }
    draw(){
        fill("white");
        this.update();
        ellipse(this.x, this.y, this.radius, this.radius);
    }
    update(){
        this.edges();
        this.x += this.delta.x;
        this.y += this.delta.y;
    }
    edges(){
        if(this.x-this.radius/2 <= 0 || this.x+this.radius/2 >= canvas.width){
            this.delta.x *= -1;
        }
        if(this.y-this.radius/2 <= 0){
            this.delta.y *= -1;
        } else if(this.y+this.radius/2 >= canvas.height){
            this.reset();
        }
    }
    reverseX(){
        this.delta.x *= -1;
    }
    reverseY(){
        this.delta.y *= -1;
    }
    reset(){
        this.x = canvas.width/2;
        this.y = canvas.height - 50;
        this.speed = Utils.random(4,6);
        this.delta = new Position(Utils.random(-1,1), Utils.random(-1,1));
        this.delta.multiply(this.speed);
    }
}



class Utils{
    static random(min, max){
        return Math.floor((Math.random() * max) + min);
    }
    static getColor(thickness){
        const colors = ["black", "blue", "green", "yellow", "orange", "red"];
        return colors[thickness];
    }

}

class Position{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    multiply(value){
        this.x *= value;
        this.y *= value;
    }
}