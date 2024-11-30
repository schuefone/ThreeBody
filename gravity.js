// by Albert Schueller, math prof at Whitman College
// license: creative commons, BY-SA
var canvas;
var balls;
var G,R; // gravitational constant
var ship;

function setup() {
 // put setup code here
 canvas=createCanvas(1024,768);
 canvas.position(10,10);
 canvas.parent('threebody');
 ellipseMode(RADIUS);
 balls = [];
 colors = [color(255,0,0,50), color(0,255,0,50), color(0,0,255,50)]

 // Gravitational constant
 G = 5;
 R = 100;

 // Three balls
 var N = 3;
 var m = 1.725;
 var v = sqrt(G*m/R);  // 3 body initial circular motion

 for (var i = 0; i<N; i++) {
  b = new Ball(2, colors[i], m);
  b.thrust=false;
  b.position.x = width/2 + R*cos(i*2*PI/N);
  b.position.y = height/2 + R*sin(i*2*PI/N);
  b.velocity.x = v*sin(i*2*PI/N);
  b.velocity.y = -v*cos(i*2*PI/N);
  balls.push(b);
 }



 /*
 var text = createDiv('<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/InteractiveResource" property="dct:title" rel="dct:type">ThreeBody</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://carrot.whitman.edu" property="cc:attributionName" rel="cc:attributionURL">Albert Schueller</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.');

 text.style("width", "600px");
 text.position(10,height+10);
 */


 background(0);
 drawRing(R);
}

function draw() {
 //stroke(0);
 //fill(255,255,255,10);
 //rect(0,0,width-1,height-1);
 for(var i=0; i<balls.length; i++){
  balls[i].display();
  balls[i].update();
 }
 // Update gravity for each ball.
 gravity(balls);

}

// A class that represents balls with mass and that react to gravity.
var Ball = function(radius, color, mass) {

  // Initial time, time step
  this.t = 0;

  // Input parameters
  this.radius = radius;
  this.color = color;
  this.mass = mass;
  this.position = createVector(width/2,height/2)
  this.velocity = createVector(0,0)
  this.acceleration = createVector(0,0)

};



// Method to update position
Ball.prototype.update = function(){

 // update velocity
 this.velocity.add(this.acceleration);
 // update position
 this.position.add(this.velocity);

 // Bounce checks.
 bounce = false;
 if (bounce) {
  // top wall collision
  if(this.position.y < this.radius) {
   this.position.y = 2*this.radius - this.position.y;
   this.velocity.y *= -1;
  }

  // bottom wall collision
  if(this.position.y > height-this.radius) {
   this.position.y = 2*(height - this.radius) - this.position.y;
   this.velocity.y *= -1;
  }

  // left wall collision
  if(this.position.x <this.radius) {
   this.position.x = 2*this.radius - this.position.x;
   this.velocity.x *= -1;
  }

  // right wall collision
  if(this.position.x >width-this.radius) {
   this.position.x = 2*(width - this.radius) - this.position.x;
   this.velocity.x *= -1;
  }
 }


};

// Method to display
Ball.prototype.display = function() {
 fill(this.color);
 stroke(0);
 strokeWeight(1);
 noStroke();
 ellipse(this.position.x,this.position.y,this.radius,this.radius);
};

// Method to set position vector
Ball.prototype.setPosition = function(newPosition) {
  this.position.set(newPosition.x,newPosition.y);
};


// Method to set velocity vector
Ball.prototype.setVelocity = function(newVelocity) {
  this.velocity.set(newVelocity.x,newVelocity.y);
};

// Apply gravity adjustments to acceleration vector depending on the
// locations and masses of all balls in the list.
function gravity(b) {
 for(var i=0; i<b.length; i++) {
  var ball1 = b[i].position;
  var totalAccel = createVector(0,0);
  for(var j=0; j<b.length; j++) {
   // Skip itself.
   if(i==j) { continue; }
   // Compute displacement vector to second ball.
   var accel = p5.Vector.sub(b[j].position,ball1);
   // Length of displacement
   var r = accel.mag();
   if (r< (b[i].radius + b[j].radius)) {
    r = (b[i].radius + b[j].radius);
   }
   // Scale by Gm_1m_2/r^3 to get acceleration vector.
   accel.mult(G*b[j].mass*b[i].mass/pow(r,3));
   totalAccel.add(accel);
  }
  b[i].acceleration.set(totalAccel.x,totalAccel.y);
 }

}

// Define the Ship constructor
function Ship(radius, color, mass, dir=0) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  Ball.call(this, radius, color, mass);

  // Initialize our Ship-specific properties, radians, 0 points east,
  // positive rotate clockwise from there
  this.direction = dir;
  this.thrust = false;
}

// Create a Ship.prototype object that inherits from Ball.prototype.
// Note: A common error here is to use "new Ball()" to create the
// Ship.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give Ball for the "firstName" 
// argument. The correct place to call Ball is above, where we call 
// it from Ship.
Ship.prototype = Object.create(Ball.prototype); // See note below

// Set the "constructor" property to refer to Ship
Ship.prototype.constructor = Ship;

// Replace the "display" method
Ship.prototype.display = function(){
  push();
  translate(this.position.x,this.position.y);
  this.direction = this.velocity.heading();
  rotate(this.direction);
  stroke(color(0,0,0));
  fill(this.color);
  triangle(10,0,-10,5,-10,-5);
  if (this.thrust) {
    noStroke();
    fill(color(255,0,0));
    triangle(-10,-2,-10,2,-18,0);
  }
  pop();
};

function drawRing(R) {
 /* 
  * draw a white ring on the initial circle, with fade at the edges
  */
 // width of concentric circles
 var w = 10;
 noFill()
 for(var i=0;i<w;i++) {
  stroke(255,255,255,255-255*i/w)
  ellipse(width/2,height/2,R+i,R+i);
  ellipse(width/2,height/2,R-i,R-i);
 }
}
