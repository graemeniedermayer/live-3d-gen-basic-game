import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {AudioLoader, PositionalAudio} from 'three'

import { clone } from 'SkeletonUtils'
import {entity} from "./entity.js";


export const load_controller = (() => {

  class LoadController extends entity.Component {
    constructor() {
      super();

      this.textures_ = {};
      this.models_ = {};
      this.sounds_ = {};
      this.playing_ = [];
    }

    // LoadPNG(path, name){
      // if(!)
    // }

    LoadTexture(path, name) {
      if (!(name in this.textures_)) {
        const loader = new THREE.TextureLoader();
        loader.setPath(path.replace('./','/static/ArExperiment/aiar/js/'));

        this.textures_[name] = {loader: loader, texture: loader.load(name)};
        // this.textures_[name].encoding = sRGBEncoding;
      }

      return this.textures_[name].texture;
    }

    LoadSound(path, name, onLoad) {
      if (!(name in this.sounds_)) {
        const loader = new AudioLoader();
        loader.setPath(path.replace('./','/static/ArExperiment/aiar/js/'));

        loader.load(name, (buf) => {
          this.sounds_[name] = {
            buffer: buf
          };
          const threejs = this.FindEntity('threejs').GetComponent('ThreeJSController');
          const s = new PositionalAudio(threejs.listener_);
          s.setBuffer(buf);
          s.setRefDistance(10);
          s.setMaxDistance(500);
          onLoad(s);
          this.playing_.push(s);
        });
      } else {
        const threejs = this.FindEntity('threejs').GetComponent('ThreeJSController');
        const s = new PositionalAudio(threejs.listener_);
        s.setBuffer(this.sounds_[name].buffer);
        s.setRefDistance(0.25);
        s.setMaxDistance(10);
        onLoad(s);
        this.playing_.push(s);
      }
    }

    Load(path, onLoad) {
      this.LoadGLB(path, onLoad);
      
    }


    // LoadFBX(path, name, onLoad) {
    //   if (!(name in this.models_)) {
    //     const loader = new FBXLoader();
    //     loader.setPath(path.replace('./','/static/ArExperiment/aiar/js/'));

    //     this.models_[name] = {loader: loader, asset: null, queue: [onLoad]};
    //     this.models_[name].loader.load(name, (fbx) => {
    //       this.models_[name].asset = fbx;

    //       const queue = this.models_[name].queue;
    //       this.models_[name].queue = null;
    //       for (let q of queue) {
    //         const clone = this.models_[name].asset.clone();
    //         q(clone);
    //       }
    //     });
    //   } else if (this.models_[name].asset == null) {
    //     this.models_[name].queue.push(onLoad);
    //   } else {
    //     const clone = this.models_[name].asset.clone();
    //     onLoad(clone);
    //   }
    // }

    LoadGLB(path, onLoad) {
      const fullName = path;
      if (!(fullName in this.models_)) {
        const loader = new GLTFLoader();
        this.models_[fullName] = {loader: loader, asset: null, queue: [onLoad]};
        this.models_[fullName].loader.load(fullName, (glb) => {
          this.models_[fullName].asset = glb;

          const queue = this.models_[fullName].queue;
          this.models_[fullName].queue = null;
          for (let q of queue) {
            const clone_ = {...glb};
            clone_.scene = clone(clone_.scene);

            q(clone_.scene, clone_.animations);
          }
        });
      } else if (this.models_[fullName].asset == null) {
        this.models_[fullName].queue.push(onLoad);
      } else {
        const clone_ = {...this.models_[fullName].asset};
        clone_.scene = clone(clone_.scene);
        // TODO animations here.
        onLoad(clone_.scene, clone_.animations);
      }
    }
    LoadAttachImageToObject(path, name, player, hand, params){
      // const loader = new THREE.TextureLoader()
      // loader.load('/static/eave/experiment/aiar/models/'+name, 
      //   (weightTexture)=>{
      //     let height = params.scale * weightTexture.image.height
      //     let width = params.scale * weightTexture.image.width
      //     let planeGeo =  new THREE.PlaneBufferGeometry( width, height, 1, 1 );
      //     let planeMat= new THREE.MeshBasicMaterial({
      //       map: weightTexture, 
      //       alphaMap: weightTexture, 
      //       alphaTest: 0.5, 
      //       side: THREE.DoubleSide, 
      //       transparent:  true
      //     });
          
      //     let plane = new THREE.Mesh( planeGeo, planeMat );
      //     plane.scale.x = 0.1
      //     plane.scale.y = 0.1
      //     plane.scale.z = 0.1
      //     if(params.item=='bow'){
      //       plane.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler( Math.PI/2, 0, Math.PI/2, 'XYZ' )))
      //       plane.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler( 0, Math.PI/2, 0, 'XYZ' )))
      //       // plane.position.y=5
      //       player.weapon = plane
      //       hand.add(plane)
      //     }else{
      //       plane.scale.y = 0.2
      //       plane.position.y = 55
      //       plane.position.x = 5
      //       player.ammo = plane
      //       hand.add(plane)
      //     }
      //   }
      // )
      
    }

    Update(timeElapsed) {
      for (let i = 0; i < this.playing_.length; ++i) {
        if (!this.playing_[i].isPlaying) {
          this.playing_[i].parent.remove(this.playing_[i]);
        }
      }
      this.playing_ = this.playing_.filter(s => s.isPlaying);
    }
  }

  return {
      LoadController: LoadController,
  };
})();