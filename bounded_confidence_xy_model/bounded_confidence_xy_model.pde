// Opinion dynamics online simulator
// (c) Maksym Romensky, 2018

int bars = 2;
int buttons=3;
int cbuttons=1;
int side= 40;
float eta = 0.05;
float alpha = 0.4;
int nspin=(side+1)^2;
int separation=8.6;
int side_w_sep=side*separation;
int xshift=285;
int yshift=20;
float[] theta =new float[nspin];
float[] DXtemp =new float[nspin];
float[] DYtemp =new float[nspin];
int maxcolor=105;
int nbins=50;
float bin_width=5;

float cos_alpha=cos(alpha*PI);

// Sliders and buttons
HSlider Hslider [];
NiceButton xButton [];

void setup()
{
  size  (640, 380);
  smooth();

  // The Sliders and buttons array initialization
  Hslider = new HSlider[bars];
  xButton = new NiceButton[buttons];

  // The Sliders and buttons array instantiation
  for (int i=0; i<bars; i++) {
    Hslider[i] = new HSlider(10, 40+i*70, 250, 16);
  }
   //for (int i=0; i<buttons; i++) {
    xButton[0] = new NiceButton(15, 150, 20, 30, "label");
    xButton[1] = new NiceButton(190, 150, 20, 30, "label");
    xButton[2] = new NiceButton(115, 150, 20, 30, "label");
 // }

  // label buttons
  xButton[0].setLabel("Disordered");
  xButton[1].setLabel("Polarized");
  xButton[2].setLabel("RESET");

  // Set some initial slider values
  for (int i=0; i<bars; i++) {
    Hslider[i].setValue(0.78*sin((float)(bars-i)/(bars*4)*2*PI));
  }
  
  // Set and initialize random seed
  randomSeed( hour() + second() + millis() );
  float ini_random_seed = random(1);

for(int ip = 0; ip < side; ip++){
for(int jp = 0; jp < side; jp++){

  int icel=jp*(side+1)+ip;
  
  if (ip<=1) {
   theta[icel]=-PI;
 } else if (ip>=side-2){
     theta[icel]=0;
  } else if (jp<=1) {
   theta[icel]=-PI;
 } else if (jp>=side-2){
     theta[icel]=0;
  } else {
  float DX=2*(random(1)-0.5);                              
  float DY=2*(random(1)-0.5);
  theta[icel]=atan2(DY,DX);
  }

}
}

}

void draw()
{

  // only need to repaint background because of changing text; the buttons and 
  // sliders repaint themselves
  background(192, 192, 192);

  fill(0, 0, 0);
  text("Opinion tolerance", 87, 35);
  text("Degree of anticonformity", 71, 105);
  
  if (xButton[0].clicked() == true) {
    Hslider[0].setValue(0.35);
    Hslider[1].setValue(1.0);
  }
  
  if (xButton[1].clicked() == true) {
    Hslider[0].setValue(0.35);
    Hslider[1].setValue(0.05);
  }
  
  if (xButton[2].clicked() == true) {
    Hslider[0].setValue(0.5);
    Hslider[1].setValue(1);
  }

  for (int i=0; i<buttons; i++) {    
    xButton[i].update();
    xButton[i].display();
  }
  
  for (int i=0; i<bars; i++) {
    // Sliders and buttons updates and displaying
    Hslider[i].update();
    Hslider[i].display();
  }
  fill(0, 0, 0);
    // Write only the horizontal slider values
    text("alpha: " + Hslider[0].getValue(), 20, 70);
    text("eta: " + Hslider[1].getValue(), 20, 140);
 
   float alpha=Hslider[0].getValue();
   float eta=Hslider[1].getValue();   

for(int ip = 0; ip < side; ip++){
for(int jp = 0; jp < side; jp++){
  if (ip<=1) { continue; }
  if (jp<=1) { continue; }
  if (ip>=side-2) { continue; }
  if (jp>=side-2) { continue; }
  icel=jp*(side+1)+ip;
  DX=cos(theta[icel]);
  DY=sin(theta[icel]);
  float DXtmp=DX;
  float DYtmp=DY;
    for(int ipn = ip-2; ipn < ip+2; ipn++){
    for(int jpn = jp-2; jpn < jp+2; jpn++){
      if ((ipn==ip)&&(jpn==jp)) { continue; }
      int iceln=jpn*(side+1)+ipn;
      float DXnei=cos(theta[iceln]);
      float DYnei=sin(theta[iceln]);
      float d_angle=DX*DXnei+DY*DYnei;
      if(d_angle>=cos_alpha){
       DXtmp=DXtmp+DXnei;
       DYtmp=DYtmp+DYnei;
    }
    }
    }
    float d_theta=eta*PI*2*(random(1)-0.5);
    theta[icel]=atan2(DYtmp,DXtmp)+d_theta;      
}
}

// Create the histogram
int[] hist = new int[nbins];

for(int ip = 0; ip < side; ip++){
for(int jp = 0; jp < side; jp++){
  icel=jp*(side+1)+ip;    
  
      if (ip!=0) {
      int ip1=ip*separation;}
      else{
      int ip1=0;
      }
      if (jp!=0) {
      int jp1=jp*separation;}
      else{
      int jp1=0;
      }
      
      int x0=xshift+ip1;
      int y0=yshift+jp1;
      
      DX=cos(theta[icel]);
      DY=sin(theta[icel]);
  
    drawArrow(x0, y0, x0+DX*5, y0+DY*5, 0, 1, true);
      //thetanorm=theta[icel]/PI*maxcolor;
      //rect(x0, y0,separation,separation);
      //fill(thetanorm);

// Calculate the histogram      
  float mapped = float(map(theta[icel], PI, 0, 0, PI));
  int bright = int(mapped/PI*nbins);
    hist[bright]++; 

}
}

// Find the largest value in the histogram
int histMax = max(hist);

curr_bin=10;

// Draw half of the histogram (skip every second value)
for (int i = 0; i < nbins; i++) {
  // Map i (from 0..) to a location in the histogram (0..nbins)
  int which = int(map(i, 0, nbins, 0, nbins));
  // Convert the histogram value to a location on a canvas
  int y = int(map(hist[which], 0, nbins, 0, 50));
  float curr_bin=curr_bin+bin_width;
  //line(curr_bin, 370, curr_bin, y);
  fill(50);
  rect(curr_bin,370,bin_width,int(-y));
}

}


// ##### HTML text (change below) ##### //
/***  Opinion dynamics simulator (alpha version) 
*/


// ##### Color scheme for bars, sliders and buttons ##### //
class ColorScheme {

  color bar_outline = color(0, 0, 0);
  color slider_fill  = color(100, 100, 100);
  color bar_hover = color(100, 200, 200);
  color bar_background = color(0, 150, 200);
  color slider_press = color(255, 255, 255);
}

/* global colorscheme, change colors above */
/* to change instance colors, subclass and overwrite */
ColorScheme global_cs = new ColorScheme();


// ##### Slider Class ##### //
class VSlider
{
  int barWidth, barHeight; // width and height of bar. NOTE: barWidth also used as slider button height.
  int Xpos, Ypos;          // upper-left position of bar
  float Spos, newSpos;     // y (upper) position of slider
  int SposMin, SposMax;    // max and min values of slider
  boolean over;            // True if hovering over the Slider
  boolean locked;          // True if a mouse button is pressed while on the Slider
  int roundRad = 5;             // radius of rounded rectangle for thumb

  ColorScheme cs = global_cs;
  color barOutlineCol  = cs.bar_outline;
  color barFillCol     = cs.bar_background;
  color sliderFillCol  = cs.slider_fill;
  color barHoverCol    = cs.bar_hover;
  color sliderPressCol = cs.slider_press;

  VSlider (int X_start, int Y_start, int bar_width, int bar_height) {
    barWidth = bar_width;
    barHeight = bar_height;

    Xpos = X_start;
    Ypos = Y_start;
    Spos = Ypos + barHeight/2 - barWidth/2; // center it initially
    newSpos = Spos;
    SposMin = Ypos;
    SposMax = Ypos + barHeight - barWidth;
  }

  void update() {
    over = overit();
    if (mousePressed && over) locked = true; 
    else locked = false;

    if (locked) {
      newSpos = constrain(mouseY-barWidth/2, SposMin, SposMax);
    }
    Spos = newSpos;
  }

  // Return true if mouse is over thumb of slider
  boolean overit() {
    if (mouseX > Xpos && mouseX < Xpos+barWidth &&
      mouseY > Ypos && mouseY < Ypos+barHeight) {
      return true;
    } 
    else {
      return false;
    }
  }


  void display() {
    stroke(barOutlineCol);
    fill(barFillCol);
    rect(Xpos, Ypos, barWidth, barHeight);
    if (over) {
      fill(barHoverCol);
    }
    if (locked) {
      fill(sliderPressCol);
    }
    if (!over && !locked) {
      fill (sliderFillCol);
    }
    if (abs(Spos-newSpos)>0.1) fill (sliderPressCol);
    rect(Xpos, Spos, barWidth, barWidth,roundRad);
  }

  float getValue() {
    // Convert slider position Spos to a value between 0 and 1
    return (Spos-Ypos) / (barHeight-barWidth);
  }

  // set the value of this slider
  void setValue(float value) {
    // convert a value (0 to 1) to slider position Spos
    if (value<0) value=0.0;
    if (value>1) value=1.0;
    Spos = Ypos + ((barHeight-barWidth)*value);
    newSpos = Spos;
  }
}


class HSlider extends VSlider {
  HSlider(int X_start, int Y_start, int bar_width, int bar_height) {
    super(X_start, Y_start, bar_width, bar_height);
    SposMin = Xpos;
    SposMax = Xpos - barHeight + barWidth;
  }

  // call this to interactively update slider in display()
  void update() {
    over = overit();
    if (mousePressed && over) locked = true; 
    else locked = false;

    if (locked) {
      //newSpos = constrain(mouseX- int(barHeight/2), SposMin, SposMax);
      //newSpos = mouseX - int(barHeight/2);
      newSpos = constrain(mouseX - int(barHeight/2), SposMin, SposMax);
    }
    Spos = newSpos;
  }

  // Call this to draw the slider in display() routine
  void display() {
    stroke(barOutlineCol);
    fill(barFillCol);
    // Draw the slider bar
    rect(Xpos, Ypos, barWidth, barHeight);
    if (over) {
      fill(barHoverCol);
    }
    if (locked) {
      fill(sliderPressCol);
    }
    if (!over && !locked) {
      fill (sliderFillCol);
    }
    // Draw the thumb
    if (abs(Spos-newSpos)>0.1) fill (sliderPressCol);
    rect(Spos, Ypos, barHeight, barHeight,roundRad);
  }

  float getValue() {
    // Convert slider position Spos to a value between 0 and 1
    return (Spos-Xpos) / (barWidth - barHeight);
  }

  // set the value of this slider
  void setValue(float value) {
    // convert a value (0 to 1) to slider position Spos
    if (value<0) value=0.0;
    if (value>1) value=1.0;
    Spos = Xpos + ((barWidth-barHeight)*value);
    newSpos = Spos;
  }
}


// ##### Button class ##### // 
public class Button
{
  int x, y;
  int size;
  ColorScheme cs = global_cs;
  color edgeCol = cs.bar_outline;
  color baseColor = cs.bar_background;
  color highlightColor = cs.slider_press;
  color hoverColor = cs.bar_hover;
  color currentColor = cs.slider_press;
  boolean pressed = false;  
  boolean oldPressed = false;
  boolean outsidePressed = false;

  // must call this in display() to update button
  void update()
  {
    if (over()) {
      currentColor = hoverColor;
      if (mousePressed && !oldPressed && !outsidePressed) {
        pressed = true;
        currentColor = highlightColor;
      }
      if (!mousePressed) {
        oldPressed = pressed;
        pressed = false;
        outsidePressed = false;
      }
    } 
    else {
      currentColor = baseColor;
      pressed = false;
      outsidePressed = mousePressed;
    }
  }

  boolean clicked() {
    return oldPressed;
  }

  boolean over() {
    return false;
  }
}

// Subclass for circular buttons
class CircleButton extends Button
{
  CircleButton(int ix, int iy, int isize) {
    x = ix;
    y = iy;
    size = isize;
  }

  // Return True if mouse is over the button
  boolean over() {
    float disX = x - mouseX;
    float disY = y - mouseY;
    if (sqrt(sq(disX) + sq(disY)) < size/2 ) {
      return true;
    } 
    else return false;
  }

  void display() {
    stroke(edgeCol);
    fill(currentColor);
    ellipse(x, y, size, size);
  }
}


class RectButton extends Button
{
  RectButton(int ix, int iy, int isize) {
    x = ix;
    y = iy;
    size = isize;
  }

  // Return True if mouse is over the button
  boolean over() {
    if (mouseX >= x && mouseX <= x+size &&
      mouseY >= y && mouseY <= y+size) {
      return true;
    } 
    else {
      return false;
    }
  }

  void display() {
    stroke(edgeCol);
    fill(currentColor);
    rect(x, y, size, size);
  }
}

// nicer button with rounded ends
class NiceButton extends Button
{
  String lab;
  int xs, ys; // x and y size of display rect
  float tw, th; // text width and height
  int pad = 5; // pixels to pad text
  NiceButton(int ix, int iy, int xsize, int ysize, String label) {
    x = ix;
    y = iy;
    xs = xsize;
    ys = ysize;
    // compute size of inner rectangle and outer arcs
    int rx = x;
    setLabel(label);
  }

  void setLabel(String labString) {
    lab = labString; 
    th = textAscent();
    if (th < ys) {
      ys = int(th) + 2*pad;
    }
    tw = textWidth(lab);
    //th = textHeight(label);
    if (xs < tw) {
      xs = int(tw)+ 2 * pad;
    }
  }
  // Return True if mouse is over the button
  boolean over() {
    if (mouseX >= x && mouseX <= x+xs &&
      mouseY >= y && mouseY <= y+ys) {
      return true;
    } 
    else {
      return false;
    }
  }

  void display() {
    stroke(edgeCol);
    fill(currentColor);
    rect(x, y, xs, ys,5);
    fill(edgeCol);
    text(lab, x + pad, y + ys/2 + th/2);
  }
}


// Function drawArrow(x0, y0, x1, y1, beginHeadSize, endHeadSize, filled)
  void drawArrow(float x0, float y0, float x1, float y1, float beginHeadSize, float endHeadSize, boolean filled) {

  PVector d = new PVector(x1 - x0, y1 - y0);
  d.normalize();
  
  float coeff = 1.5;
  
  strokeCap(SQUARE);
  
  line(x0+d.x*beginHeadSize*coeff/(filled?1.0f:1.75f), 
        y0+d.y*beginHeadSize*coeff/(filled?1.0f:1.75f), 
        x1-d.x*endHeadSize*coeff/(filled?1.0f:1.75f), 
        y1-d.y*endHeadSize*coeff/(filled?1.0f:1.75f));
  
  float angle = atan2(d.y, d.x);
  
  if (filled) {
    // begin head
    pushMatrix();
    translate(x0, y0);
    rotate(angle+PI);
    triangle(-beginHeadSize*coeff, -beginHeadSize, -beginHeadSize*coeff, beginHeadSize, 0, 0);
    popMatrix();
    // end head
    pushMatrix();
    translate(x1, y1);
    rotate(angle);
    triangle(-endHeadSize*coeff, -endHeadSize, -endHeadSize*coeff, endHeadSize, 0, 0);
    popMatrix();
  } 
  else {
    // begin head
    pushMatrix();
    translate(x0, y0);
    rotate(angle+PI);
    strokeCap(ROUND);
    line(-beginHeadSize*coeff, -beginHeadSize, 0, 0);
    line(-beginHeadSize*coeff, beginHeadSize, 0, 0);
    popMatrix();
    // end head
    pushMatrix();
    translate(x1, y1);
    rotate(angle);
    strokeCap(ROUND);
    line(-endHeadSize*coeff, -endHeadSize, 0, 0);
    line(-endHeadSize*coeff, endHeadSize, 0, 0);
    popMatrix();
  }
}


