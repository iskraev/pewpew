# PewPew [Live](https://pewpew.iskrayev.com/)

PewPew is the FPS(First Person Shooter) game where the main goal is to take down all 5 targets as fast as possible! The game takes us to the small floating island somewhere in the sky! The game provides perfect,challenging and competetive environment where each person can set their own record with no special skills required.

# Technologies used:

- JavaScript
- [Three.js](https://threejs.org/)
- HTML5
- CSS

# Main page

The main page contains logo, instructions/loading window, about us/rules link and the settings. Using JavaScript's 'onprogress' and THREE.js's loading manager, the loading bar updates on every single model load.

![Main page](https://i.imgur.com/9Y530dl.png) 

## Settings
- ### Improve perfomance

Shadows and lights play huge role in the game perfomance. In order to make the improvement, all shadows are removed and all lights are replaced with simple source of light.
```
function removeShadows() {
    //iterate thru all the scene objects and remove shadows
    scene.traverse(function (element) {
        if (!(element instanceof THREE.AmbientLight)) {
            element.castShadow = false;
            element.receiveShadow = false;
        }
    })
    //remove all the lights
    scene.remove(light)
    scene.remove(ambientLight)
    //add improved light
    scene.add(improvedLight)
}
```
- ### Mute all the sounds
In order to mute all the sounds, the `mute()` function iterates through all the audio files and sets the volume of each sound to 0.

# Initializing the game

The game was developed using THREE.js library. Main `init()` function sets up all necessary variables and settings for the game. Here are specific to THREE.js variables that are required:
- ### Scene
    Scenes allow you to set up what and where is to be rendered by three.js. This is where you place objects, lights and cameras. All objects can be either added or removed from the scene using `scene.add(object)` or `scene.remove(object)` functions.
```
    scene = new THREE.Scene();
```

- ### Camera (PerspectiveCamera)
    This projection mode is designed to mimic the way the human eye sees. It is the most common projection mode used for rendering a 3D scene. The values that passed are:

    - FOV (field of view) (90) 
    - Aspect ratio (window.innerWidth / window.innerHeight)
    - Frustrum near plane (0.1)
    - Frustrum far plane (1000)
```
    //create the camera
    camera = new THREE.PerspectiveCamera(
        90,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    //set up camera initial position position
    camera.position.set(21, 25, 31);
    //set up the rotation of camera
    camera.rotation.set(0, 10, 0);
```
- ### Renderer 
    The WebGL renderer displays the scenes using WebGL.
```
    //creating THREE.js WebGL renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
```

- ### Light
    There are two sources of light. One is ambient light and second is directional light.
```
    //add ambient light and light to the game
    ambientLight = new THREE.AmbientLight(0x777777)
    scene.add(ambientLight);

    light = new THREE.DirectionalLight(0xdfebff, 1);
    light.position.set(-50, 200, -100);
    light.position.multiplyScalar(1.3);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    let d = 300;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 1000;
    scene.add(light);
```

# Creating objects and models




# Gameplay
When starting the game, the