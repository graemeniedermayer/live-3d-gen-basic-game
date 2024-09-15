// UI


// transition code

import {ui_class} from './core/ui.js'
import {XRButton} from "xrbutton"

import {entity_manager} from './core/game/entity-manager.js';
import {spatial_hash_grid} from './core/game/spatial-hash-grid.js';
import {entity} from './core/game/entity.js';
import {load_controller} from './core/game/load-controller.js';
import {threejs_component} from './core/game/threejs-component.js';
import {floor_plane} from './core/game/floor.js';
import { reversePainterSortStable} from '@pmndrs/uikit'

import {ammojs_component} from './core/physics/ammojs-component.js';

import { Group } from 'three'
import {Inventory} from './core/inventory.js'
import {Character} from './core/character.js'
import { static_path } from './core/globals.js';

import { animate_texture } from './core/requests/animate_texture.js';
// import {basic_rigid_body} from './core/physics/rigid-body.js';

// import {spawners} from './spawners.js';


class ai_gen_game {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this.entityManager_ = new entity_manager.EntityManager();

    this.OnGameStarted_();
  }

  OnGameStarted_() {
    this.grid_ = new spatial_hash_grid.SpatialHashGrid(
        [[-50, -50], [50, 50]], [1, 1]);
    globalThis.game_grid = this.grid_
    this.LoadControllers_();

    this.previousRAF_ = null;
    // this.RAF_();
  }

  LoadControllers_() {
    const threejs = new entity.Entity();
    threejs.AddComponent(new threejs_component.ThreeJSController());
    this.entityManager_.Add(threejs, 'threejs');

    // This might be an issue if the player controller moves too soon.
    
  
    // Hack
    this.scene_ = threejs.GetComponent('ThreeJSController').scene_;
    this.camera_ = threejs.GetComponent('ThreeJSController').camera_;
    this.threejs_ = threejs.GetComponent('ThreeJSController');
		this.scene_.add( floor_plane );


    const l = new entity.Entity();
    l.AddComponent(new load_controller.LoadController());
    this.entityManager_.Add(l, 'loader');

    const basicParams = {
      grid: this.grid_,
      scene: this.scene_,
      camera: this.camera_,
    };

    let inventory = new Inventory()
    let active_item = new Group()
    let character = new Character(inventory, active_item)
    // character.loadModel(static_path + 'characters/wheat_elf.glb')
    character.loadModel(static_path + 'characters/pastel_warrior.glb')
    // setTimeout(()=>{
    //   animate_texture(character.model.children[0].children[0], static_path + 'characters/images/pastel_knight--ai_humanoid.mp4')
    // }, 5000)
    // setTimeout(()=>{
    //   animate_texture(character.model.children[0].children[0], static_path + 'characters/images/travel-rife-00035.mp4')
    // }, 5000)
    // character.loadModel(src_path)

    this.entityManager_.Add(character, 'character');

    let ui = new ui_class(character)

    renderer = globalThis.renderer
    renderer.setAnimationLoop((t)=>{
      ui.update(t, ui)

      renderer.autoClearColor = true;
      renderer.render(this.scene_, this.camera_);

      // Step the algo
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      } else {
        this.Step_(t - this.previousRAF_);
        this.previousRAF_ = t;
      }
    })
    renderer.localClippingEnabled = true
    renderer.setTransparentSort(reversePainterSortStable)

    let xrButton = XRButton.createButton( renderer,
      { 
         'optionalFeatures': [ "depth-sensing", 'dom-overlay'],
           'domOverlay': { root: document.body },
          //  'depth-sensing':{
          //   usagePreference: [ "gpu-optimized"],
          //   dataFormatPreference: [ "float32"],
          //  }
        //  'optionalFeatures': [ 'local'] 
       } 
    )
    
    xrButton.addEventListener('click', ()=>{
        ui.xr_start()
        ui.character.xr_start()
    })
    document.body.append(xrButton) 

    Ammo().then((AmmoLib) => {
      Ammo = AmmoLib;
      const ammojs = new entity.Entity();
      ammojs.AddComponent( new ammojs_component.AmmoJSController());
      // is this still in scope?
      _APP.entityManager_.Add(ammojs, 'physics');
      _APP.ammojs_ = ammojs.GetComponent('AmmoJSController');
      // character.addRigidBody()
    })
    // const spawner = new entity.Entity();
    // // spawner.AddComponent(new spawners.BuildingSpawner(basicParams));
    // spawner.AddComponent(new spawners.GoblinWeaponSpawner(basicParams));
    // spawner.AddComponent(new spawners.WeaponSpawner(basicParams));
    // spawner.AddComponent(new spawners.ArrowSpawner(basicParams));
    // spawner.AddComponent(new spawners.FloraSpawner(basicParams));
    // spawner.AddComponent(new spawners.PlayerSpawner(basicParams));
    // spawner.AddComponent(new spawners.GoblinSpawner(basicParams));
    
    // this.entityManager_.Add(spawner, 'spawners');
    // spawner.GetComponent('WeaponSpawner').Spawn()
    // spawner.GetComponent('GoblinWeaponSpawner').Spawn()
    // spawner.GetComponent('ArrowSpawner').Spawn()

    // document.getElementById('character').addEventListener('click',(e)=>{
    //   let ele = e.target
    //   spawner.GetComponent('PlayerSpawner').Spawn(ele.id);
    //   
    //   spawner.GetComponent('GoblinSpawner').Spawn()
    //   document.getElementById('character').style.display = 'none'
    // })
    // spawner.GetComponent('FloraSpawner').Spawn()

    // const webxr = new entity.Entity();
    // webxr.AddComponent(new  xr_component.XRController(this.threejs_.threejs_, basicParams))
    // this.entityManager_.Add(webxr, 'webxr');

  }

  RAF_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      } else {
        this.Step_(t - this.previousRAF_);
        this.threejs_.Render();
        this.previousRAF_ = t;
      }

      setTimeout(() => {
        this.RAF_();
      }, 1);
    });
  }

  Step_(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this.entityManager_.Update(timeElapsedS, 0);
    this.entityManager_.Update(timeElapsedS, 1);
    if(this.ammojs_){
      this.ammojs_.StepSimulation(timeElapsedS);
    }
  }
}


let _APP = null;

// This could be automatic right?
window.addEventListener('DOMContentLoaded', () => {
  // this is blocking...
      _APP = new ai_gen_game();
      globalThis._APP =_APP
});
