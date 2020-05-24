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


# Initializing the game

The game was developed using THREE.js library. Main `init()` function sets up all necessary variables and settings for the game. Here are some specific to THREE.js variables that are required:

- ### Scene

    Scenes allow you to set up what and where is to be rendered by three.js. This is where you place objects, lights and cameras. All objects can be either added or removed from the scene using `scene.add(object)` or `scene.remove(object)` functions.

    ``` javascript
        scene = new THREE.Scene();
    ```

- ### Camera (PerspectiveCamera)

    This projection mode is designed to mimic the way the human eye sees. It is the most common projection mode used for rendering a 3D scene. The values that passed are:

    - FOV (field of view) (90) 
    - Aspect ratio (window.innerWidth / window.innerHeight)
    - Frustrum near plane (0.1)
    - Frustrum far plane (1000)

    ```  javascript
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

    ``` javascript
        //creating THREE.js WebGL renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
    ```

- ### Lights

    There are two sources of light. One is ambient light and second is directional light.

    ``` javascript
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

- ### PointerLockControls

    The implementation of this class is based on the Pointer Lock API. PointerLockControls is a perfect choice for first person 3D games.
        
    ``` javascript
        //create FPS controls
        controls = new PointerLockControls(camera, renderer.domElement);
    ```


- ### `animate()`

    This function is required in order to have infinite loop for the game to run. JavaScript's `requestAnimationFrame(animate)` calls the function recursively.

    ``` javascript
    function animate(){
        ...
        requestAnimationFrame(animate);
        ...
    }
    ```

# Creating objects and models

- ### 3D `obj` type models

    - Importing 3D models: 


        ``` javascript
        const models = {
            gun: {
                obj: 'objects/pistolSilencer.obj',
                mtl: 'objects/pistolSilencer.mtl',
                mesh: null,
                castShadow: false
            },

            ...
        }
        ```
   
    - Loading 3D objects and creating mesh objects:


        ``` javascript
        for (let _key in models) {
            (function (key) {
                let mtlLoader = new MTLLoader(loadingManager);
                mtlLoader.load(models[key].mtl, function (materials) {
                    materials.preload();
                    let objLoader = new OBJLoader(loadingManager);
                    objLoader.setMaterials(materials);
                    
                    objLoader.load(models[key].obj, function (mesh) {
                        models[key].mesh = mesh;
                    });
                });

            })(_key);
        }
        ```

- ### Creating simple shape THREE.js mesh objects

    ``` javascript
        //create floor texture(image was used)
        const textureFloor = new THREE.TextureLoader().load('images/stone.jpg')
        ...
        let groundMaterial1 = new THREE.MeshLambertMaterial({
            map: textureFloor,
        });
        ...
        floorTop = new THREE.Mesh(new THREE.PlaneBufferGeometry(300, 300), groundMaterial1);
        ...
        scene.add(floorTop)
    ```

# Gameplay

## Pressing ENTER brings us to the game itself where calm soundtrack 'Peace' welcomes us. This is spawn area:

![Game spawn area](https://i.imgur.com/RRn0jOt.png)

## The screen contains 3 windows:

- Ammo count (Max is amount of ammo is 7, key 'R' reloads the pistol)

    ![Ammo count](https://i.imgur.com/91JEgjh.png)

- Timer and targets left

    ![Timer](https://i.imgur.com/bxtVtBz.png)

- Record time (Captures the best time after taking down all targets)

    ![Record](https://i.imgur.com/NfnOGkF.png)

## Targets

- There are total 10 targets in the game. Every time the timer is restarted, 5 are placed randomly around the map. Pressing key 'T' restarts the timer and places the targets.  

    ![Target](https://i.imgur.com/JQzOKVh.png)


# Settings

- ## Improve perfomance

    Shadows and lights play huge role in the game perfomance. In order to make the improvement, all shadows are removed and all lights are replaced with simple source of light.
    
    ``` javascript
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

    - ### Improvement OFF

        ![OFF](https://i.imgur.com/Nfoj06Z.png?1)

    - ### Improvement ON

        ![OFF](https://i.imgur.com/B70eNoI.png)

- ## Mute all the sounds

    In order to mute all the sounds, the `mute()` function iterates through all the audio files and sets the volume of each sound to 0.

# Sounds Effects

There are plenty of sound effets in the game. Some of them are made by me using Ableton Live. Two main soundtracks ('Peace', 'PewPew') are produced and recorded by me in Ableton Live as well.

# Hosting

The game is hosted on [Heroku.com](https://heroku.com) and custom domain was added using [AWS Route 53](https://aws.amazon.com/route53/). In order to make `index.html` as an entry file, a `php` file `index.php` was added to the main folder of the project. `php` file contains this code which redirects to `index.html`

``` php
    <?php header( 'Location: https://pewpew.iskrayev.com/index.html', true, 301 ) ;  ?>
```
