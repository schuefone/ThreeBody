// by Albert Schueller, math prof at Whitman College
// license: creative commons, BY-SA
/*
 * Layers, from lowest to highest:
 * - starfield, background stars (startup)
 * - traces (draw, don't clear, transparent)
 * - reference shape (startup, transparent)
 * - bodies (draw, clear, transparent)
 */


var canvas;
var balls;
var G,R; // gravitational constant
// layer names
var starfield, traces, reference, bodies;

function setup() {
 // set framerate
 //frameRate(15);
 //capturer = new CCapture({ format: 'webm', framerate: 15 });

 // set canvas width and height
 var w = 1024;
 var h = 768;

 // put setup code here
 // create base canvas
 canvas=createCanvas(w,h);
 //canvas.position(10,10);
 canvas.parent('threebody');


 // Set up the bodies
 /* context
  * 3 equal point masses, equidistant around a circle with inital velocity
  * set so that they track the circle until floating point error breaks the
  * stability.
  */
 
 ellipseMode(RADIUS);
 balls = [];
 colors = [color(255,255,0), color(0,255,0), color(200,200,255)]

 // Gravitational constant
 G = 5;
 R = 100;

 // Three balls
 var p = 0.1
 var N = 3;
 var m = 1.725;
 var v = sqrt(G*m/R);  // 3 body initial circular motion

 for (var i = 0; i<N; i++) {
  b = new Ball(10, colors[i], m);
  b.thrust=false;
  b.position.x = width/2 + R*cos(i*2*PI/N+p);
  b.position.y = height/2 + R*sin(i*2*PI/N+p);
  b.velocity.x = v*sin(i*2*PI/N+p);
  b.velocity.y = -v*cos(i*2*PI/N+p);
  balls.push(b);
 }

 // Generate static layers
 // generate random starfield
 starfield = createGraphics(w,h);
 generateStarfield(starfield);

 // generate reference shape layer
 reference = createGraphics(w,h);
 generateReference(reference,R);

 // generate bodies layer
 bodies = createGraphics(w,h);
 bodies.clear();

 // generate traces layer
 traces = createGraphics(w,h);
 traces.clear();

}

function draw() {
 // wipe the canvas
 clear()
 
 // display and update masses
 bodies.clear()
 for(var i=0; i<balls.length; i++){
  balls[i].display(bodies, traces);
  balls[i].update();
 }

 // Update gravity force for each ball.
 gravity(balls);

 // render the background starfield
 image(starfield,0,0);
 // render the traces
 image(traces,0,0);
 // render the reference shape
 //image(reference,0,0);
 // render the bodies layer
 image(bodies,0,0);

}

//////////////////////////////////////////////////////////////////////////
// A class that represents balls with mass and that react to gravity.
var Ball = function(radius, c, mass) {

  // Initial time, time step
  this.t = 0;

  // Input parameters
  this.radius = radius;
  this.c= c;
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

};

// Method to display
Ball.prototype.display = function(bodies, traces) {
 // trail density
 var d = 0.001;
 // trail half-width (pixels)
 var tw = 3;

 var temp_c = color(this.c);

 // sketch the bodies on the bodies layer
 bodies.noFill()
 // fading concentric circles
 for(var i=0; i<=this.radius; i++) {
  temp_c.setAlpha(255 - i*255/this.radius);
  bodies.stroke(temp_c)
  bodies.ellipse(this.position.x,this.position.y,i,i);
 }

 // sketch the trail on the traces layer
 temp_c.setAlpha(255);
 traces.stroke(temp_c);
 for(var i=-tw + this.position.x; i<=tw+this.position.x; i++) {
  for(var j=-tw + this.position.y; j<=tw+this.position.y; j++) {
   if(random() < d) {
    traces.point(i,j);
   }
  }
 }
 // single thin trace
 traces.stroke(temp_c);
 traces.point(this.position.x,this.position.y);
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

// this emphasizes the circular starting point
function generateReference(reference,R) {
 /* 
  * draw a white ring on the initial circle, with fade at the edges
  */

 // half of width of concentric circles
 var w = 10;

 reference.clear();
 reference.noFill();
 
 for(var i=0;i<w;i++) {
  reference.stroke(255,255,255,255-255*i/w)
  reference.ellipse(width/2,height/2,2*R+i,2*R+i);
  reference.ellipse(width/2,height/2,2*R-i,2*R-i);
 }

}

// Function to generate the random starfield
function generateStarfield(starfield) {
  starfield.background(0); // A dark background for the starfield

  // Number of stars
  let numStars = 200;

  for (let i = 0; i < numStars; i++) {
    // Random position
    let x = random(starfield.width);
    let y = random(starfield.height);

    // Random star size
    let size = random(1, 3);

    // Random brightness
    let brightness = random(150, 255);

    // Draw the star
    starfield.fill(brightness);
    starfield.noStroke();
    starfield.ellipse(x, y, size, size);
  }
}

///////////////////////////////////////////////////////////////////////////
// recording code
