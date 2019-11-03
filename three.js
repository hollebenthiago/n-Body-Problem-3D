var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.5,1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
var camposz = 500;
var camposy = 200;
var camposx = 500;
camera.position.z = camposz;
camera.position.y = camposy;
camera.position.x = camposx;
var H = window.prompt('tell me the step (in hours) (number)');
var ax = -3e11; //-1150,1150
var bx = 3e11;
var ay = -3e11; //-700,700
var cy = 3e11;
var az = -3e11;  //-50,930
var dz = 3e11;
var mesh = new THREE.Mesh(
    new THREE.SphereGeometry( 1, 1, 1),
    new THREE.MeshBasicMaterial({ map:new  THREE.TextureLoader().load('https://github.com/pedromxavier/Computacao-Grafica-EEL882/blob/gh-pages/Trabalho3/images/mercury.jpg') })
);
scene.add(mesh);

window.addEventListener('keydown',checkKeyPress,false);

function checkKeyPress(key){
    if (key.keyCode == '39'){
        ax += 0.1*bx;
        bx += 0.1*bx;
    }
    else if(key.keyCode == '37'){
        ax -= 0.1*bx;
        bx -= 0.1*bx;
    }
    else if(key.keyCode == '38'){
        cy += 0.1*cy;
        ay += 0.1*cy;
    }
    else if(key.keyCode == '40'){
        cy -= 0.1*cy;
        ay -= 0.1*cy;
    }
    else if(key.keyCode == '81'){
        camposz -= 0.1*camposz;
        camera.position.z = camposz;
    }
    else if(key.keyCode == '87'){
        camposz += 0.1*camposz;
        camera.position.z = camposz;
    }
}


function planet(m,x,y,z,dx,dy,dz,k1,k2,name,color,g,radius,rotx,roty,rotz,textu) {
    this.texture = new THREE.TextureLoader().load( textu );
    this.g = g; // universal gravitational constant 
    this.m = m; // in kg
    this.mMin = m;
    this.k1 = k1;
    this.k2 = k2;
    this.x = k1*x;
    this.y = k1*y;
    this.z = k1*z
    this.dz = k2*dz
    this.dx = k2*dx;
    this.dy = k2*dy;
    this.rotx = rotx;
    this.roty = roty;
    this.rotz = rotz;
    this.sx = (this.x)/(bx-ax);
    this.sy = (this.y)/(cy-ay);
    this.sz = (this.y)/(dz-az);
    this.radius = radius;
    this.name = name;
    this.color = color;
    this.draw = function() {
        var geometry = new THREE.SphereGeometry(this.radius,this.radius,this.radius);
        var material = new THREE.MeshBasicMaterial( {map: this.texture} );
        this.sphere = new THREE.Mesh(geometry,material);
        this.sphere.position.x = this.sx;
        this.sphere.position.y = this.sy;
        this.sphere.position.z = this.sz;
        this.sphere.rotation.x += this.rotx;
        this.sphere.rotation.y += this.roty;
        this.sphere.rotation.y += this.rotz;
        //console.log(this.sphere.position.x);
        scene.add(this.sphere);  
    }
    //this.draw();
}
function sistema(h,planetas){
    this.h = h;
    this.planetas = planetas;
    this.draw = function() {
        for (var i = 0; i < this.planetas.length; ++i) {
            this.planetas[i].draw();  
        }
    }
    this.verlet = function(){
        var novosposx = [];
        var novosposy = [];
        var novosposz = [];
        var novosvelx = [];
        var novosvely = [];
        var novosvelz = [];
        var aceleracoesx = [];
        var aceleracoesy = [];
        var aceleracoesz = [];
        for (var i = 0; i < this.planetas.length; i++) {
            var acx = 0;
            var acy = 0;
            var acz = 0;
            for (var j = 0; j < this.planetas.length; j ++) {
                if (i == j){
                    acx += 0;
                    acy += 0;
                    acz += 0;
                }
                else{
                    acx += (this.planetas[j].x-this.planetas[i].x)*this.planetas[j].m*this.planetas[i].g/(Math.sqrt((this.planetas[i].x-this.planetas[j].x)**2 + (this.planetas[i].y-this.planetas[j].y)**2 + (this.planetas[i].z-this.planetas[j].z)**2)**3);
                    acy += (this.planetas[j].y - this.planetas[i].y)*this.planetas[j].m*this.planetas[i].g/(Math.sqrt((this.planetas[i].x-this.planetas[j].x)**2 + (this.planetas[i].y-this.planetas[j].y)**2 + (this.planetas[i].z-this.planetas[j].z)**2)**3);
                    acz += (this.planetas[j].z - this.planetas[i].z)*this.planetas[j].m*this.planetas[i].g/(Math.sqrt((this.planetas[i].x-this.planetas[j].x)**2 + (this.planetas[i].y-this.planetas[j].y)**2 + (this.planetas[i].z-this.planetas[j].z)**2 )**3);
                }
            }
            novosposx.push(this.planetas[i].x + this.h*this.planetas[i].dx + this.h*this.h*acx/2);
            novosposy.push(this.planetas[i].y + this.h*this.planetas[i].dy + this.h*this.h*acy/2);
            novosposz.push(this.planetas[i].z + this.h*this.planetas[i].dz + this.h*this.h*acz/2)
            aceleracoesx.push(acx);
            aceleracoesy.push(acy);
            aceleracoesz.push(acz);
        }
        for (var k = 0; k < this.planetas.length; k++) {
            var acnewx = 0;
            var acnewy = 0;
            var acnewz = 0;
            for (var l = 0; l < this.planetas.length; l++) {
                if (k == l){
                    acnewx += 0;
                    acnewy += 0;
                    acnewz += 0;
                }
                else{
                    acnewx += (novosposx[l]-novosposx[k])*this.planetas[l].m*this.planetas[k].g/(Math.sqrt((novosposx[k]-novosposx[l])**2 + (novosposy[k]-novosposy[l])**2 + (novosposz[k]-novosposz[l])**2)**3)
                    acnewy += (novosposy[l]-novosposy[k])*this.planetas[l].m*this.planetas[k].g/(Math.sqrt((novosposx[k]-novosposx[l])**2 + (novosposy[k]-novosposy[l])**2 + (novosposz[k]-novosposz[l])**2)**3)
                    acnewz += (novosposz[l]-novosposz[k])*this.planetas[l].m*this.planetas[k].g/(Math.sqrt((novosposx[k]-novosposx[l])**2 + (novosposy[k]-novosposy[l])**2 + (novosposz[k]-novosposz[l])**2)**3)
                }
            }
            novosvelx.push(this.planetas[k].dx + 0.5*(aceleracoesx[k]+acnewx)*this.h);
            novosvely.push(this.planetas[k].dy + 0.5*(aceleracoesy[k]+acnewy)*this.h);
            novosvelz.push(this.planetas[k].dz + 0.5*(aceleracoesz[k]+acnewz)*this.h)
            //console.log(mouseclick.x,mouseclick.y,counter);
        }
        for (var t = 0; t < this.planetas.length;t++) {
            this.planetas[t].x = novosposx[t];
            //this.planetas[t].sphere.position.x = this.planetas[t].x;
            this.planetas[t].y = novosposy[t];
            //this.planetas[t].sphere.position.y = this.planetas[t].y;
            this.planetas[t].z = novosposz[t];
            //this.planetas[t].sphere.position.z = this.planetas[t].z;
            this.planetas[t].dx = novosvelx[t];
            this.planetas[t].dy = novosvely[t];
            this.planetas[t].dz = novosvelz[t];
            this.planetas[t].sx = 0.5*1150*(this.planetas[t].x-ax)/(bx-ax);
            this.planetas[t].sy = 350*(this.planetas[t].y -ay)/(cy-ay);
            this.planetas[t].sz = (this.planetas[t].z-az)/(dz-az);
            //console.log(this.planetas[t].sx);

        }
        //this.draw();    
    }
}
var k1 = 1.496e11;
var k2 = 1.496e11/(24*3600);
var sol = new planet(1.9885*10**30,0,0,0,0,0,0,k1,k2,'Sun','yellow',6.67*10**-11,20,0,0,0,'https://github.com/hollebenthiago/test/blob/master/sunmapthumb.jpg');
var mercury = new planet(0.330*10**24,-2.503321047836e-1,1.873217481656e-1,1.260230112145e-1,-2.438808424736E-02,-1.850224608274E-02,-7.353811537540E-03,k1,k2,'Mercury','red',6.67*10**-11,5,0.1,0.1,0.1,'https://github.com/hollebenthiago/test/blob/master/mercurymapthumb.jpg')
var venus = new planet(4.87*10**24,1.747780055994E-02,-6.624210296743E-01,-2.991203277122E-01,+2.008547034175E-02,+8.365454832702E-04,-8.947888514893E-04,k1,k2,'Venus','green',6.67*10**-11,5,0.1,0.1,0.1,'https://github.com/hollebenthiago/test/blob/master/venusmapthumb.jpg');
var earth = new planet(5.97*10**24+7.342e22,-9.091916173950E-01,3.592925969244E-01,1.557729610506E-01,-7.085843239142E-03,-1.455634327653E-02,-6.310912842359E-03,k1,k2,'Earth','blue',6.67*10**-11,8,24,24,24,'https://github.com/hollebenthiago/test/blob/master/earthmapthumb.jpg');
var mars = new planet(0.642*10**24,+1.203018828754E+00,7.270712989688E-01,3.009561427569E-01,-7.124453943885E-03,+1.166307407692E-02,+5.542098698449E-03,k1,k2,'Mars','brown',6.67*10**-11,5,0.1,0.1,0.1,'https://github.com/hollebenthiago/test/blob/master/mars_thumbnail.jpg');
var jupiter = new planet(1898*10**24,+3.733076999471E+00,3.052424824299E+00,1.217426663570E+00,-5.086540617947E-03,+5.493643783389E-03,+2.478685100749E-03,k1,k2,'Jupiter','lightblue',6.67*10**-11,10,0.1,0.1,0.1,'https://github.com/hollebenthiago/test/blob/master/jupitermapthumb.jpg');
var saturn = new planet(568*10**24,+6.164433062913E+00,+6.366775402981E+00,2.364531109847E+00,-4.426823593779E-03,+3.394060157503E-03,+1.592261423092E-03,k1,k2,'Saturn','indigo',6.67*10**-11,5,0.1,0.1,0.1,'https://github.com/hollebenthiago/test/blob/master/saturnmapthumb.jpg');
var uranus = new planet(86.8*10**24,+1.457964661868E+01,-1.236891078519E+01,-5.623617280033E+0,+2.647505630327E-03,+2.487457379099E-03,+1.052000252243E-03,k1,k2,'Uranus','orange',6.67*10**-11,5,0.1,0.1,0.1,'https://github.com/hollebenthiago/test/blob/master/uranusmapthumb.jpg');
var neptune = new planet(102*10**24,+1.695491139909E+01,-2.288713988623E+01,-9.789921035251E+00,+2.568651772461E-03,+1.681832388267E-03,+6.245613982833E-04,k1,k2,'Neptune','cyan',6.67*10**-11,5,0.1,0.1,0.1,'https://github.com/hollebenthiago/test/blob/master/neptunemapthumb.jpg');
var pluto = new planet(0.0146*10**24,-9.707098450131E+00,-2.804098175319E+01,-5.823808919246E+00,+3.034112963576E-03,-1.111317562971E-03,-1.261841468083E-03,k1,k2,'Pluto','lightgreen',6.67*10**-11,5,0.1,0.1,0.1,'https://github.com/hollebenthiago/test/blob/master/plutomapthumb.jpg');

//var sol = new planet(1.9885*10**30,0,0,0,0,0,0,k1,k2,'Sun','yellow',6.67*10**-11,20,0,0,0);
//var mercury = new planet(0.330*10**24,46*10**9,0,0,0,58.98*10**3,0,k1,k2,'Mercury','red',6.67*10**-11,5,0.01,0.01,0.01);
//var venus = new planet(4.87*10**24,107.5*10**9,0,0,0,35.26*10**3,0,k1,k2,'Venus','green',6.67*10**-11,10,0.01,0.01,0.01);
//var earth = new planet(5.97*10**24,147.1*10**9,0,0,0,30.29*10**3,0,k1,k2,'Earth','blue',6.67*10**-11,5,0.01,0.01,0.01);
//var mars = new planet(0.642*10**24,206.6*10**9,0,0,0,26.5*10**3,0,k1,k2,'Mars','brown',6.67*10**-11,5,0.01,0.01,0.01);
//var jupiter = new planet(1898*10**24,740.5*10**9,0,0,0,13.72*10**3,0,k1,k2,'Jupiter','lightblue',6.67*10**-11,5,0.01,0.01,0.01);
//var saturn = new planet(568*10**24,1352.6*10**9,0,0,0,10.183*10**3,0,k1,k2,'Saturn','indigo',6.67*10**-11,5,0.01,0.01,0.01);
//var uranus = new planet(86.8*10**24,2741.3*10**9,0,0,0,7.11*10**3,0,k1,k2,'Uranus','orange',6.67*10**-11,5,0.01,0.01,0.01);
//var neptune = new planet(102*10**24,4444.5*10**9,0,0,0,5.5*10**3,0,k1,k2,'Neptune','cyan',6.67*10**-11,5,0.01,0.01,0.01);
//var pluto = new planet(0.0146*10**24,4436.8*10**9,0,0,0,6.1*10**3,0,k1,k2,'Pluto','lightgreen',6.67*10**-11,5,0.01,0.01,0.01);
var planetas = [sol,mercury,venus,earth,mars,jupiter,saturn,uranus,neptune,pluto];
var esferas = new sistema(3600*H,planetas);
esferas.draw();
var animate = function () {
	requestAnimationFrame( animate );
    //esferas.planetas[0].sphere.position.x += 0.01;
    for (var i = 0; i < esferas.planetas.length; i++){
        esferas.planetas[i].sphere.position.x = esferas.planetas[i].sx;
        esferas.planetas[i].sphere.position.y = esferas.planetas[i].sy;
        esferas.planetas[i].sphere.position.z = esferas.planetas[i].sz; 
    }
    esferas.verlet();
	renderer.render( scene, camera );
};

animate();