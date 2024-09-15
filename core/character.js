// import {character_template, inventory_template} from 'templates.js'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"
import { remove_children } from './util.js'
import { ImageUtils, AnimationObjectGroup, AnimationMixer, Group, Vector3, Quaternion, Euler, FrontSide } from 'three'
import { signal, effect } from "@preact/signals-core";
import { entity } from './game/entity.js'
import {player_controller} from './controllers/player-controller.js';
import {player_input} from './game_ui/player-input.js';
// import {health_controller} from './controllers/health-controller.js';
// import {enemy_ai_controller} from './controllers/enemy-ai-controller.js';
import {spatial_grid_controller} from './controllers/spatial-grid-controller.js';
import {render_component} from './game/render-component.js';

// import {arrow_effect} from './animations/arrow-effect.js';
import {basic_rigid_body} from './physics/rigid-body.js';


const loader = new GLTFLoader();

class character_sheet{
    constructor(){
        // this = Object.assign(this, character_template)
        // this.inventory = inventory_templates
    }

    import_char(char_sheet, inventory){
        this.set_sheet(template)
        this.set_inventory(inventory)
    }

    set_sheet(char_sheet){

    }
    
    set_inventory(inventory){

    }

    get_json_sheet(){

    }

    get_inventory(){

    }

    add_equip_stats(char){
        // get inventory
        active_items = char.inventory.active_items
        char.active_stats = char.base_stats
        for(let item of Object.values(active_items)){
            char.active_stats.max_health += item.max_health
            char.active_stats.attack += item.attack
            char.active_stats.defence += item.defence
        }
        for(let item of Object.values(active_items)){
            char.active_stats.max_health *= item.multiply_max_health
            char.active_stats.attack *= item.multiply_attack
            char.active_stats.defence *= item.multiply_defence
        }
        return char
    }
}

class Character extends entity.Entity{
    constructor(inventory, active_item){
        super();
        this.hand_equip = signal('item_src')
        this.inventory = inventory 
        this.active_item = active_item // group
        this.char_type = 'bow' // bow, spear, sword
        this.hand_loading = false
        globalThis.character = this
    }

    replace(model_src){
        // 
        let scale = 1
        const params = {
            camera: globalThis.camera,
            scene: globalThis.scene,
            characterModel: model_src, //this.params_characterModel,
            offset: new Vector3(0, 0, 0)
          };
        
        let Render_Component = this.components_.RenderComponent
        Render_Component.Reset({
            scene: params.scene,
            resourcePath: model_src,
            scale: scale,
            castShadow:true,
            receiveShadow:true,
            sided:FrontSide,
            offset: {
              position: new Vector3(0, 0.85, 0),
              quaternion: new Quaternion().setFromEuler(new Euler( Math.PI/2, 0, 0, 'XYZ' )),
            },
            //this really isn't my favourite style, but it does preserve renderComponents independence and consolidates the resource paths
            callback: (model, anim, self) => {
              globalThis.player = model
              self.Parent.model = model
              let player_controller = self.Parent.components_.PlayerController
            //   player_controller.Reset()
              player_controller._mixer = new AnimationMixer( model.children[0] );
              let top_actions = ['Attack', 'Idle', 'Draw', 'Recoil']
              let spine = model.getObjectByName('mixamorigSpine')
              let left_leg = model.getObjectByName('mixamorigLeftUpLeg')
              let right_leg = model.getObjectByName('mixamorigRightUpLeg')
            //   globalThis.legs = legs
              anim.forEach(x=>{
                let name = x.name
                if(top_actions.some(v => name.includes(v))){
                    player_controller._animations[name] = player_controller._mixer.clipAction(x, spine);
                    player_controller._animations[name].stop()
                    if(name==='Bow_Idle'){
                        player_controller._animations['Idle_Legs_R'] = player_controller._mixer.clipAction(x, left_leg)
                        player_controller._animations['Idle_Legs_L'] = player_controller._mixer.clipAction(x, right_leg)
                    }
                }else{
                    player_controller._animations[ name + '_R' ] = player_controller._mixer.clipAction(x, left_leg)
                    player_controller._animations[ name + '_L' ] = player_controller._mixer.clipAction(x, right_leg)
                    player_controller._animations[ name + '_R' ].stop()
                    player_controller._animations[ name + '_L' ].stop()
                }
              });   
              player_controller.InitState(this.char_type)
              player_controller.InitState(this.char_type)
    
              let righthand = model.getObjectByName('mixamorigRightHandIndex4')
              let lefthand = model.getObjectByName('mixamorigLeftHandIndex1')
              player_controller.righthand = righthand
              player_controller.lefthand = lefthand
              self.Parent.righthand = righthand
              self.Parent.lefthand = lefthand
              
            }
          }) 
    }

    loadModel(model_src){
        // not great
        let scale = 1
        const params = {
            camera: globalThis.camera,
            scene: globalThis.scene,
            characterModel: model_src, //this.params_characterModel,
            offset: new Vector3(0, 0, 0)
          };
    
          // player.Attributes.team = 'allies';
          this.AddComponent(
            new spatial_grid_controller.SpatialGridController(
                {grid: globalThis.game_grid})
          );
          this.AddComponent(new render_component.RenderComponent({
            scene: params.scene,
            resourcePath: model_src,
            scale: scale,
            castShadow:true,
            receiveShadow:true,
            sided:FrontSide,
            offset: {
              position: new Vector3(0, 0.85, 0),
              quaternion: new Quaternion().setFromEuler(new Euler( Math.PI/2, 0, 0, 'XYZ' )),
            },
            //this really isn't my favourite style, but it does preserve renderComponents independence and consolidates the resource paths
            callback: (model, anim, self) => {
              globalThis.player = model
              self.Parent.model = model
              let player_controller = self.Parent.components_.PlayerController
              player_controller._mixer = new AnimationMixer( model.children[0] );
              let top_actions = ['Attack', 'Idle', 'Draw', 'Recoil']
              let spine = model.getObjectByName('mixamorigSpine')
            //   WHY WAS AnimationObjectGroup NOT WORKING
            //   let legs =  new AnimationObjectGroup()
              let left_leg = model.getObjectByName('mixamorigLeftUpLeg')
              let right_leg = model.getObjectByName('mixamorigRightUpLeg')
            //   globalThis.legs = legs
              anim.forEach(x=>{
                let name = x.name
                if(top_actions.some(v => name.includes(v))){
                    player_controller._animations[name] = player_controller._mixer.clipAction(x, spine);
                    player_controller._animations[name].stop()
                    if(name==='Bow_Idle'){
                        player_controller._animations['Idle_Legs_R'] = player_controller._mixer.clipAction(x, left_leg)
                        player_controller._animations['Idle_Legs_L'] = player_controller._mixer.clipAction(x, right_leg)
                    }
                }else{
                    player_controller._animations[ name + '_R' ] = player_controller._mixer.clipAction(x, left_leg)
                    player_controller._animations[ name + '_L' ] = player_controller._mixer.clipAction(x, right_leg)
                    player_controller._animations[ name + '_R' ].stop()
                    player_controller._animations[ name + '_L' ].stop()
                }
              });   
              player_controller.InitState(this.char_type)
    
              let righthand = model.getObjectByName('mixamorigRightHandIndex4')
              let lefthand = model.getObjectByName('mixamorigLeftHandIndex1')
              player_controller.righthand = righthand
              player_controller.lefthand = lefthand
              self.Parent.righthand = righthand
              self.Parent.lefthand = lefthand
              
            }
          }));
          this.AddComponent(new player_input.PlayerInput());
          // mass
          // player.AddComponent(new health_controller.HealthController({
            // maxHealth: 100,
          // }));
          this.AddComponent(new player_controller.PlayerController({'type':'bow'}));
          // player.AddComponent(new arrow_effect.ArrowController());
          // player.AddComponent(new basic_rigid_body.ArrowRigidBodySystem());
        //   this.parent_.Add(player, 'player');
    
        let pos = new Vector3(0,0,-1)
        let quat = new Quaternion()
        this.SetPosition(pos)
        this.SetQuaternion(quat)
        return this; 
    }

    addRigidBody(){
        let scale = 1
        let pos = new Vector3(0,0,0)
        let quat = new Quaternion()
        let rigid = new basic_rigid_body.BasicRigidBody({
            pos: pos,
            quat: quat,
            size: scale*0.7,
          });
        this.AddComponent(rigid)
        this.AddLateComponent(rigid)
        
    }

    Equip(){

    }

    // For UI item panel
    loadItem(src_path, type='sword', old_load = true){
        remove_children( this.active_item )
        loader.load(
            // resource URL
            src_path,
            // called when the resource is loaded
            ( gltf ) => {
                let model =  gltf.scene
                // placement
                remove_children(this.active_item)
                this.active_item.add(model)
                this.active_item.traverse(function(child) {
                    if (child.isMesh) {
                      child.castShadow = true;
                      child.receiveShadow = true;
                    }
                })
                if(type=='sword'){
                    this.active_item.scale.set(1,1,1)
                    this.active_item.position.set(0,2.2,-1.5)
                    this.active_item.rotation.set(0,0,0)
                    this.active_item.rotation.set(0,0,0)
                }else if(type=='spear'){
                    this.active_item.scale.set(1,1,1)
                    this.active_item.position.set(0,3.2,-1.5)
                    this.active_item.rotation.set(0,0,0)
                    this.active_item.rotation.set(0,0,0)
                }else if(type=='bow'){
                    this.active_item.scale.set(1.5,1.5,1.5)
                    this.active_item.position.set(0,2.2,-1.5)
                    this.active_item.rotation.set(0,0,0)
                    this.active_item.rotation.set(0,0,0)
                }
                // this.char_type = type
            },
            // called while loading is progressing
            function ( xhr ) {
            },
            // called when loading has errors
            function ( error ) {
            }
        );
    }
    retexture(type, src){
        if(type=='char'){
            // presumably model
            let char_model = this.model.children[0].children[0].children[0]
            char_model.material.map = ImageUtils.loadTexture( src );
            char_model.material.needsUpdate = true;
        }else{
            let item_model = this.equipment_hand.children[0]
            item_model.material.map = ImageUtils.loadTexture( src );
            item_model.material.needsUpdate = true;

        }
    }
    reequip(){
        if(this.equipment_hand){
            if(this.char_type == 'bow'){
                this.lefthand.add(this.equipment_hand)
            }else{
                this.righthand.add(this.equipment_hand)
            }
        }
    }
    loadEquipmentHand(src_path, type){
        let hand 
        if(type == 'bow'){
            hand = this.lefthand
        }else{
            hand = this.righthand
        }
        remove_children( hand )
        loader.load(
            // resource URL
            src_path,
            // called when the resource is loaded
            ( gltf ) => {
                this.hand_loading = true
                let model =  gltf.scene
                let group = new Group()
                // placement
                group.add(model)
                group.traverse(function(child) {
                    if (child.isMesh) {
                      child.castShadow = true;
                      child.receiveShadow = true;
                    }
                })

                if(type=='sword'){
                    group.scale.set(30,30,40)
                    group.position.set(13.8,-60,0)
                    group.rotation.set(0,0,0)
                }else if(type=='spear'){
                    group.scale.set(30,30,40)
                    group.position.set(13.8,-75,0)
                    group.rotation.set(3.14,0,0)
                }else if(type=='bow'){
                    group.scale.set(30,30,40)
                    group.position.set(0, 12, -20)
                    group.rotation.set(0, 1.57, 1.57)
                }
                this.equipment_hand = group
                hand.add( group )
                this.char_type = type

                let player_controller = this.components_.PlayerController
                player_controller.Reset(type)
                
            },
            // called while loading is progressing
            function ( xhr ) {
            },
            // called when loading has errors
            function ( error ) {
            }
        );
    }
    setupEquipSignals(){
        effect(()=>{
            if (this.hand_loading = true && this.hand_equip.value!== 'item_src'){
                this.hand_loading = false
                let src = this.hand_equip.value.src
                let type = this.hand_equip.value.type
                this.loadEquipmentHand(src, type)
            }

        })
        // effect(())
    }
}

export {Character}