import { PCFSoftShadowMap, WebGLRenderer, PerspectiveCamera, Scene, AudioListener, LightProbe, DirectionalLight, AmbientLight} from 'three'
// , AfterimagePass, RenderPass, EffectComposer, GlitchPass
import {entity} from "./entity.js";



// 
export const threejs_component = (() => {




  class ThreeJSController extends entity.Component {
    constructor() {
      super();
    }

    InitEntity() {
      const canvas = document.getElementById('root')
      this.threejs_ = new WebGLRenderer({
        canvas,
        antialias: true,
        sortObjects: true,
        alpha:true,
      });
      this.threejs_.xr.enabled = true;
      // this.threejs_.outputEncoding = sRGBEncoding;
      // this.threejs_.gammaFactor = 2.2;
      this.threejs_.shadowMap.enabled = true;
      this.threejs_.shadowMap.type = PCFSoftShadowMap;
      // this.threejs_.shadowMap.autoUpdate = false;
      // this.threejs_.gammaOutput = true;
      this.threejs_.setPixelRatio(window.devicePixelRatio);
      this.threejs_.setSize(window.innerWidth, window.innerHeight);
      this.threejs_.domElement.id = 'threejs';
      globalThis.renderer = this.threejs_
      // this.threejs_.physicallyCorrectLights = true;
  
      document.body.appendChild(this.threejs_.domElement);
  
      window.addEventListener('resize', () => {
        this.OnResize_();
      }, false);
  
      const fov = 80;
      const aspect = window.innerWidth / window.innerHeight;
      const near = 0.01;
      const far = 10.0;
      this.camera_ = new PerspectiveCamera(fov, aspect, near, far);
      this.camera_.position.z = 1
      this.camera_.position.y = 0.8
      // this.camera_.position.set(.2, .05, .15);
      this.scene_ = new Scene();
      globalThis.scene = this.scene_
      globalThis.camera = this.camera_
      this.scene_.add(this.camera_)

      this.listener_ = new AudioListener();
      this.camera_.add(this.listener_);
  
	    // let lightProbe = new LightProbe();
	    // lightProbe.intensity = 0;
	    // lightProbe.castShadow = true;
      // this.scene_.add(lightProbe);
      // globalThis.lightProbe = lightProbe;

      let directionalLight = new DirectionalLight(0xeeeeee, 1.0);
      directionalLight.position.set(0, 2, 0);
      directionalLight.target.position.set(0, 0, 0);
      directionalLight.castShadow = true;
      // directionalLight.shadow.bias = -0.0001;
      directionalLight.shadow.mapSize.width = 4096;
      directionalLight.shadow.mapSize.height = 4096;
      // directionalLight.shadow.camera.near = 0.01;
      // directionalLight.shadow.camera.far = 5.0;
      // directionalLight.shadow.camera.left = 4;
      // directionalLight.shadow.camera.right = -4;
      // directionalLight.shadow.camera.top = 4;
      // directionalLight.shadow.camera.bottom = -4;
      this.scene_.add(directionalLight);
      globalThis.directionalLight = directionalLight

      // const pointlight = new PointLight( 0xff0000, 1, 100 );
      // pointlight.position.set( 0, 2, -1 );
      // this.scene_.add( pointlight );

      // this.sun_ = directionalLight;

      let light = new AmbientLight(0xFFFFFF, 2.0);
      this.scene_.add(light);

      this.OnResize_();
    }


    OnResize_() {
      this.camera_.aspect = window.innerWidth / window.innerHeight;
      this.camera_.updateProjectionMatrix();

      this.threejs_.setSize(window.innerWidth, window.innerHeight);
    }

    Render() {
      this.threejs_.autoClearColor = true;
      this.threejs_.render(this.scene_, this.camera_);
      // this.composer_.render();
    }

    Update(timeElapsed) {
      const player = this.FindEntity('player');
      if (!player) {
        return;
      }
      const pos = player._position;
  
      // this.sun_.position.copy(pos);
      // this.sun_.position.add(new THREE.Vector3(-.1, 5, .1));
      // this.sun_.target.position.copy(pos);
      // this.sun_.updateMatrixWorld();
      // this.sun_.target.updateMatrixWorld();

    }
  }

  return {
      ThreeJSController: ThreeJSController,
  };
})();