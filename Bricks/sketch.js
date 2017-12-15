const frames = 60;
const BRICK_WIDTH = 40;
const BRICK_HEIGHT = 20;
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;
const PADDLE_WIDTH = 125;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 15;

let bricks = [];
let mousePos = null;
let paddle = null;
let ball = null;


function setup() {
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    background(0);
    frameRate(frames);
    paddle = new Paddle();
    ball = new Ball();
    for(let i = 0; i< CANVAS_HEIGHT*0.3; i+= BRICK_HEIGHT){
        for(let j = 0; j< CANVAS_WIDTH; j+= BRICK_WIDTH){
            bricks.push(new Brick(new Position(j, i)));
        }
    }
}

function draw() {
    clear();
    background(0);
    
    ball.draw();
    paddle.draw();

    Utils.intersects(ball, paddle);
    
    bricks.forEach(brick => brick.draw());
    
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
        this.center = new Position(position.x+this.width/2, position.y+this.height/2);
    }
    draw(){
        if(this.isAlive()){
            if(Utils.intersects(ball, this) || (mousePos && this.isHit())) {
                this.thickness = Math.max(0, this.thickness-1);
                mousePos = null;
            }
            if(this.isAlive()){
                // Is still alive so draw it
                fill(Utils.getColor(this.thickness));
                rect(this.pos.x, this.pos.y, this.width, this.height);
            }
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
}

class Paddle{
    constructor(){
        this.pos = new Position(CANVAS_WIDTH/2 - PADDLE_WIDTH/2, CANVAS_HEIGHT - 25);
        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;
        this.center = new Position(this.pos.x+this.width/2, this.pos.y+this.height/2);
    }
    draw(){
        paddle.hitTest();
        fill("white");
        this.pos.x = Math.max(0, mouseX-this.width/2);
        this.pos.x = Math.min(this.pos.x, CANVAS_WIDTH-this.width);
        this.center.x = this.pos.x+this.width/2;
        rect(this.pos.x, this.pos.y, this.width, this.height);
        // fill("red");
        // ellipse(this.center.x, this.center.y, 5, 5);
    }
    hitTest(){
        const ballLeftX = ball.x - ball.radius;
        const ballRightX = ball.x + ball.radius;
        const ballDownY = ball.y + ball.radius;
        const paddleY = this.pos.y + this.height;
        const paddleLeftX = this.pos.x-this.width/2;
        const paddleRightX = this.pos.x+this.width/2;

        if(ballLeftX <= paddleRightX && ballRightX >= paddleLeftX && ballDownY >= paddleY){
            ball.reverseY();
        }
    }
    
}

class Ball{
    constructor(){
        this.x = CANVAS_WIDTH/2;
        this.y = CANVAS_HEIGHT - 50;
        this.radius = BALL_RADIUS;
        this.speed = 6;
        this.hit = false;
        this.generateDelta();
        this.ceilAngle = Math.atan(BRICK_HEIGHT/BRICK_WIDTH)*(180/Math.PI);
    }
    draw(){
        this.hit = false;
        this.update();
        fill("white");
        ellipse(this.x, this.y, this.radius, this.radius);
        // fill("red");
        // ellipse(this.x, this.y, 5, 5);
    }
    update(){
        this.edges();
        this.x += this.delta.x;
        this.y += this.delta.y;
    }
    edges(){
        if(this.x-this.radius/2 <= 0 || this.x+this.radius/2 >= CANVAS_WIDTH){
            this.delta.x *= -1;
        }
        if(this.y-this.radius/2 <= 0){
            this.delta.y *= -1;
        } else if(this.y+this.radius/2 >= CANVAS_HEIGHT){
            this.reset();
        }
    }
    reverseX(){
        this.delta.x *= -1;
        this.hit = true;
    }
    reverseY(){
        this.delta.y *= -1;
        this.hit = true;
    }
    reset(){
        this.x = CANVAS_WIDTH/2;
        this.y = CANVAS_HEIGHT - 50;
        this.generateDelta();
    }
    generateDelta(){
        this.delta = new Position(Utils.randomFloat(-0.5,1), -1);
        this.delta.multiply(this.speed);
    }
    collide(angle){
        console.log("HITTING")
        this.hit = true;
        if(angle < this.ceilAngle){
            this.delta.x *= -1;
        } else if(angle === this.ceilAngle){
            this.delta.x *= -1;
            this.delta.y *= -1;
        } else if(angle < 180-this.ceilAngle){
            this.delta.y *= -1;
        } else if(angle === 180-this.ceilAngle){
            this.delta.x *= -1;
            this.delta.y *= -1;            
        } else if(angle < 180+this.ceilAngle){
            this.delta.x *= -1;
        } else if(angle === 180+this.ceilAngle){
            this.delta.x *= -1;
            this.delta.y *= -1;
        } else if(angle < 360-this.ceilAngle){
            this.delta.y *= -1;
        } else if(angle === 360-this.ceilAngle){
            this.delta.x *= -1;
            this.delta.y *= -1;            
        } else if(angle <= 360){
            this.delta.x *= -1;
        }
    }
}



class Utils{
    static random(min, max){
        return Math.floor((Math.random() * max) + min);
    }
    static randomFloat(min, max){
        return (Math.random() * max) + min;
    }
    static getColor(thickness){
        const colors = ["black", "blue", "green", "yellow", "orange", "red"];
        return colors[thickness%colors.length];
    }
    static angle(cx, cy, ex, ey) {
        return Math.atan2(ey-cy, ex-cx); // range (-PI, PI]
    }
    static angle360(cx, cy, ex, ey) {
        return Utils.radToDeg(Utils.angle(cx, cy, ex, ey));
    }
    static radToDeg(theta){
        theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        if (theta < 0) theta = 360 + theta; // range [0, 360)
        return theta;
    }
    static degToRad(deg){
        return deg * Math.PI / 180;
    }
    static intersects(circle, rect){
        if(!circle.hit){
            const rectPoint = Utils.getAngleRectPoint(rect, new Position(circle.x, circle.y));
            const circlePoint = Utils.getAngleCirclePoint(circle, rect.center);

            // fill("green");
            // ellipse(rectPoint.x, rectPoint.y, 5, 5);
            // ellipse(circlePoint.x, circlePoint.y, 5, 5);

            const a = Math.abs(rectPoint.x - circlePoint.x);
            const b = Math.abs(rectPoint.y - circlePoint.y);
            const circleDistance = Math.sqrt( a*a + b*b );
        
            if (circleDistance < circle.speed) {
                const angle = Utils.angle(0, 0, circle.x - rect.center.x, -(circle.y - rect.center.y));
                circle.collide(Utils.radToDeg(angle));
                return true;
            }
        }
        return false;
    }
    static getAngleRectPoint(rect, pos){
        //https://stackoverflow.com/questions/4061576/finding-points-on-a-rectangle-at-a-given-angle
        let theta = Utils.angle(0, 0, pos.x - rect.center.x, -(pos.y - rect.center.y));
        
        var rectAtan = Math.atan2(rect.height, rect.width);
        var tanTheta = Math.tan(theta);
        var region = 4;

        if ((theta > -rectAtan) && (theta <= rectAtan)) {
            region = 1;
        } else if ((theta > rectAtan) && (theta <= (Math.PI - rectAtan))) {
            region = 2;
        } else if ((theta > (Math.PI - rectAtan)) || (theta <= -(Math.PI - rectAtan))) {
            region = 3;
        }
        
        var edgePoint = {x: rect.width/2, y: rect.height/2};
        var xFactor = 1;
        var yFactor = 1;

        switch (region) {
            case 1: yFactor = -1; break;
            case 2: yFactor = -1; break;
            case 3: xFactor = -1; break;
            case 4: xFactor = -1; break;
        }
        
        if ((region === 1) || (region === 3)) {
            edgePoint.x += xFactor * (rect.width / 2.);                 // "Z0"
            edgePoint.y += yFactor * (rect.width / 2.) * tanTheta;
        } else {
            edgePoint.x += xFactor * (rect.height / (2. * tanTheta));   // "Z1"
            edgePoint.y += yFactor * (rect.height /  2.);
        }
        
        return new Position(edgePoint.x + rect.pos.x, edgePoint.y + rect.pos.y);
    }
    static getAngleCirclePoint(circle, pos){
        //let theta = Utils.angle(circle.x, circle.y, pos.x, pos.y);
        let theta = Utils.angle(0, 0, pos.x - circle.x, pos.y - circle.y);
        const x = circle.x + circle.radius/2 * cos(theta);
        const y = circle.y + circle.radius/2 * sin(theta);
        return new Position(x,y);
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