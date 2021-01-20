import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

// --- Useful Declarations --- ///

let zoomed_cam = 0;
let p = 0;
let open = 0;
let do_closing = 0;
/////////////////////////////////



// ------------ Music Play --------- //

var music = new Audio();
music.src = "azure.mp3";
music.play();
music.volume = 0;
music.loop = true;
var hide = false;

//////////////////////////////////////




// **************************************** //
// ************ TV Scene Init ************* //
// **************************************** //

// ----- Init Camera and Scene in TV Scene ------ //

const rtscene = new THREE.Scene();
const rtcamera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
rtcamera.position.set(0, 4, 6);
rtscene.background = new THREE.Color(0x750f9b);
rtscene.fog = new THREE.Fog(rtscene.background, 30, 60);

///////////////////////////////////////////////////////////////



// ----------- Grid, Terrain and Road Init in TV Scene -------- // 

const plane = new THREE.Mesh(planeGeom, planeMat);
rtscene.add(plane);

///////////////////////////////////////////////////////////////////





// ---------- Palm Init in TV Scene ----------------- //

const palms = new THREE.Mesh(instPalm, palmMat);
rtscene.add(palms);

//////////////////////////////////////////////////////////////////////////////////




// ----------- Sun Background Init in TV scene -------- //////

const texture1 = new THREE.TextureLoader().load('sun3.png');
var sunGeom = new THREE.CircleBufferGeometry(350, 1250);
var sunMat = new THREE.MeshLambertMaterial({
    color: 0x97441F,
    fog: false,
    transparent: true,
    map: texture1,
});
var sun = new THREE.Mesh(sunGeom, sunMat);
sun.position.set(0, 0, -500);
rtscene.add(sun);

////////////////////////////////////////////////////////


// -------------- Init Lights in TV Scene -------------- //

const light_src = new THREE.PointLight(0x45146F, 50, 1000);
light_src.position.set(0, 200, -20);
const light_src1 = new THREE.PointLight(0xB27243, 25, 1000);
light_src1.position.set(0, 200, +20);
const amblight = new THREE.AmbientLight(0x404040, 3);
rtscene.add(light_src);
rtscene.add(light_src1);
rtscene.add(amblight);

/////////////////////////////////////////////////////////////



// ------------- GLTF Loader in TV Scene ------------------- //

let loader2 = new GLTFLoader();
loader2.load('./cyberpunk_car/scene.gltf', function (gltf) {
    var car = gltf.scene.children[0];
    car.castShadow = false;
    car.scale.set(0.01, 0.01, 0.01);
    car.position.set(0, 1.5, -2.5);
    // car.rotation.z = -Math.PI;
    rtscene.add(gltf.scene);
});

///////////////////////////////////////////////////////

// *************************************************** //
// *************** End of TV Scene Init ************** //
// *************************************************** //


// ---------------------------------------------------------------------------------------------- //



// *************************************************** //
// ************ Start of Room Scene Init ************* // 
// *************************************************** //

// -------------- Init Camera - Scene - Rendered in Room scene ---------//

const renderTarget = new THREE.WebGLRenderTarget(1000, 570);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10000);
camera.position.y = 2;
camera.position.z = 3;
camera.position.x = -3.5;
camera.rotation.set(-Math.PI / 30, 0, 0);
scene.background = new THREE.Color(0xffffff);
scene.fog = new THREE.Fog(scene.background, 5.5, 600);
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

////////////////////////////////////////////////////////////////////




// -------------- Init Plane to display TV scene ----------//

const tv = new THREE.PlaneGeometry(10.7, 6.2);
const tvmaterial = new THREE.MeshPhongMaterial({
    map: renderTarget.texture,
});
const tvlane = new THREE.Mesh(tv, tvmaterial);
tvlane.position.set(-0.08, 2.2, -13.5809);
scene.add(tvlane);

///////////////////////////////////////////////////////////



// ------------- Channel 1 Init - Open TV Button  -------------------------//

const ch1_geometry = new THREE.CircleGeometry(0.058, 32);
const ch1_material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
const circle = new THREE.Mesh(ch1_geometry, ch1_material);
circle.position.set(
    camera.position.x - 0.34,
    camera.position.y - 0.42,
    camera.position.z - 0.96
);

scene.add(circle);

///////////////////////////////////////////////////////////////

// ------------------- Closed TV Geo - Close TV Button ----------------- //

const close_geo = new THREE.CircleGeometry(0.32, 32);
const close_material = new THREE.MeshLambertMaterial({ color: 0x000000 });
const close_btn = new THREE.Mesh(close_geo, close_material);
close_btn.rotation.x = -Math.PI / 2;
close_btn.position.set(-3, -1.0, -12.7);

scene.add(close_btn);

////////////////////////////////////////////////////////////

// ----------------- Close TV button - Texture ---------------- //
const tvC = new THREE.PlaneGeometry(10.7, 6.2);
const tvCmaterial = new THREE.MeshLambertMaterial({
    color: 0x000000
});
const tvClane = new THREE.Mesh(tvC, tvCmaterial);
tvClane.castShadow = true;
tvClane.receiveShadow = true;
tvClane.position.set(-0.08, 2.2, -13.4809);
scene.add(tvClane);


//////////////////////////////////////////////////////////

// ------------- Lights Init in Room scene ---------------//

const light = new THREE.PointLight(0xC41717, 4.5, 7, 2);
light.position.set(8, 3, -11);
scene.add(light);

const light1 = new THREE.PointLight(0x118C1C, 4.5, 7, 2);
light1.position.set(-8, 3, -11);
scene.add(light1);

const light2 = new THREE.PointLight(0x87103F, 4.5, 13, 2);
light2.position.set(-8, 3, -4);
scene.add(light2);

const light3 = new THREE.PointLight(0x0E2985, 4.5, 13, 2);
light3.position.set(8, 3, -4);
scene.add(light3);



const light4 = new THREE.PointLight(0xF0F0F0, 15.5, 2, 2); // Remote Light
light4.position.set(
    camera.position.x - 0,
    camera.position.y - 0.6,
    camera.position.z
);
scene.add(light4);


const ambLight = new THREE.AmbientLight(0xf0f0f0, 1.0);
scene.add(ambLight);

//////////////////////////////////////////////////////




// --------------- GLTF Loader in Room scene --------- //

// -------- Room Loader --------- //

let loader1 = new GLTFLoader();

loader1.load("./movie_room/scene.gltf", function (gltf) {
    const room = gltf.scene.children[0];
    room.castShadow = true;
    room.receiveShadow = true;
    room.scale.set(1.5, 1.5, 1.5);
    room.position.set(0, -3.5, -2);
    scene.add(gltf.scene);
});
///////////////////////////////////

// ------------ Turn-On Button Loader -------- //

let loader_remote = new GLTFLoader();

loader_remote.load("./scp_button/scene.gltf", function (gltf) {
    const remote = gltf.scene.children[0];
    remote.castShadow = true;
    remote.receiveShadow = true;
    remote.width = 0.1;
    remote.height = 0.1;
    remote.depth = 0.03;
    remote.rotation.z = -Math.PI / 2;
    remote.position.set(
        camera.position.x - 0.35,
        camera.position.y - 0.3,
        camera.position.z - 1.0
    );
    scene.add(gltf.scene);
});

////////////////////////////////////////////////

// ------------- Turn-Off Button Loader ---------- // 

let loader_stop = new GLTFLoader();

loader_stop.load("./red_button/scene.gltf", function (gltf) {
    const stop = gltf.scene.children[0];
    stop.castShadow = true;
    stop.receiveShadow = true;
    stop.scale.set(0.5, 0.5, 0.5);
    stop.width = 0.1;
    stop.height = 0.1;
    stop.depth = 0.03;
    stop.position.set(
        -3,
        -1.2, -12.7
    );
    scene.add(gltf.scene);
});

//////////////////////////////////////////////////////

// *************************************************** //
// ************** End of Room Scene Init ************* // 
// *************************************************** //









//////// --------------- EventListeners ---------------- /////////

// ************ Enter TV function ***************** //

const domEvents = new THREEx.DomEvents(camera, renderer.domElement)
domEvents.addEventListener(circle, 'click', event => {
    if (zoomed_cam != 1) {
        open = 1;
        zoomed_cam = 1;

    }
});

////////////////////////////////////////////////////////////////

// *********** Close TV function ******************* //

const domEvents1 = new THREEx.DomEvents(camera, renderer.domElement)
domEvents1.addEventListener(close_btn, 'click', event => {
    if (open == 1) {
        do_closing = 1;
    }
});

///////////////////////////////////////////////////////////////


// *********** Disable/Enable Sound via SoundControl ******* //
circle.addEventListener("click", function () {
    if (hide) {
        music.volume = 0.6;
    } else {
        music.volume = 0;
    }
    hide = !hide;
}, false);

///////////////////////////////////////////////////////////




// ------------ Main Render Function ----------- ////////

function render() {

    //////////// Car Movement ////////////////

    if (j <= 1000) {
        rtcamera.position.z += 0.002
    }
    else {
        rtcamera.position.z -= 0.002;
    }
    if (j == 3001)
        j = 0;
    j++;
    if (rtcamera.position.z < 3) {
        flag = true;
    }
    if (flag == true) {
        rtcamera.position.z += 0.016;
    }
    if (rtcamera.position.z > 8) {
        flag = false;
    }

    ///////////////////////////////////////////////////////////////////////////



    // -------------- Animate Shaders and call Resize -------------------- ///

    if (resize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    time = clock.getElapsedTime();
    materialShaders.forEach(m => {
        m.uniforms.time.value = time;
    });

    ////////////////////////////////////////////////////////////////////////////


    //-------------- Zoom to the TV and Play Music From Event Handler ------------//
    if (zoomed_cam == 1) {

        if (ambLight.intensity > 0.4) {
            ambLight.intensity -= 0.005;
        }
        if (light.distance < 20) {
            light.distance += 0.1;
            light1.distance += 0.1;
        }
        if (light2.distance < 22) {
            light2.distance += 0.1;
            light3.distance += 0.1;
        }
        if (music.volume < 0.6) {
            music.volume += 0.001;
        }
        if (camera.position.x < 0) {
            camera.position.x += 0.025;
        }
        else if (p < 360) {
            scene.remove(tvClane);
            camera.position.z -= 0.025;
            p++;
        }
        else {
            zoomed_cam = 0;
            p = 0
        }
        camera.fov = 5;
    }

    /////////////////////////////////////////////////////////////

    // **************** Close TV and Zoom Out ****************** //

    if (do_closing) {
        if (ambLight.intensity < 1.0) {
            ambLight.intensity += 0.005;
        }
        if (light.distance > 6) {
            light.distance -= 0.1;
            light1.distance -= 0.1;
        }
        if (light2.distance > 13) {
            light2.distance -= 0.1;
            light3.distance -= 0.1;
        }
        if (music.volume > 0) {
            if (music.volume < 0.006) {
                music.volume = 0;
            }
            else {
                music.volume -= 0.001;
            }
        }
        if (p < 360) {
            camera.position.z += 0.025;
            p++;
        }
        else if (camera.position.x > -3.5) {
            scene.add(tvClane);
            camera.position.x -= 0.025;
        }
        else {
            do_closing = 0;
            open = 0;
            p = 0;
        }
        camera.fov = 5;
    }

    ///////////////////////////////////////////////////////////////


    //------------- Render Room and TV scene and Animate ----------//

    renderer.setRenderTarget(renderTarget);
    renderer.render(rtscene, rtcamera);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    ///////////////////////////////////////////////////////////////
}


// ---------------- Render End ------------------ //





// ---------------- Resize Window ---------------  //

function resize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

//////////////////////////////////////////////////////////



// ----- initialize Clock and Run Render ----- //

const clock = new THREE.Clock();
let time = 0;
let j = 0;
let flag = false;
render();

/////////////////////////////////////////////
