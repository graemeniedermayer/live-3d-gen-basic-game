import {entity} from './entity.js';
import {render_component} from './core/render-component.js';
import {player_controller} from '../controllers/player-controller.js';
import {player_input} from '../controllers/player-input.js';
// import {health_controller} from './controllers/health-controller.js';
// import {enemy_ai_controller} from './controllers/enemy-ai-controller.js';
import {spatial_grid_controller} from '../controllers/spatial-grid-controller.js';

// import {arrow_effect} from './animations/arrow-effect.js';
import {basic_rigid_body} from '../physics/rigid-body.js';


export const spawners = (() => {
  let scale = 1
  class PlayerSpawner extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Spawn(model) {
      const params = {
        camera: this.params_.camera,
        scene: this.params_.scene,
        characterModel: model, //this.params_characterModel,
        offset: new THREE.Vector3(0, 0, 0),
        blasterStrength: 10,
      };

      const player = new entity.Entity();
      // player.Attributes.team = 'allies';
      player.AddComponent(
        new spatial_grid_controller.SpatialGridController(
            {grid: this.params_.grid})
      );
      player.AddComponent(new render_component.RenderComponent({
        scene: params.scene,
        resourcePath: `../../models/character/`,
        resourceName: `${params.characterModel}.glb`,
        scale: scale,
        castShadow:true,
        receiveShadow:true,
        sided:THREE.FrontSide,
        offset: {
          position: new THREE.Vector3(0, 0, 0),
          quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler( Math.PI/2, 0, 0, 'XYZ' )),
        },
        //this really isn't my favourite style, but it does preserve renderComponents independence and consolidates the resource paths
        callback: (mdl, anim, self) => {
          globalThis.player = mdl
          let controller = self.Parent.components_.PlayerController
          controller._mixer = new THREE.AnimationMixer( mdl.children[0] );
          anim.forEach(x=>{
            controller._animations[x.name] = controller._mixer.clipAction(x);
          });
          controller._rotationFSM.SetState('RotateIdle')
          controller._strafeFSM.SetState('AimIdle') 
          controller._drawFSM.SetState('DrawIdle')

          let righthand = model.getObjectByName('mixamorigRightHandIndex4')
          let lefthand = model.getObjectByName('mixamorigLeftHandIndex4')
          controller.righthand = righthand
          controller.lefthand = lefthand
          
        }
      }));
      // let pos = new THREE.Vector3(0, -1.13, -1)
      let quat = new THREE.Quaternion()
      player.AddComponent(new player_input.PlayerInput());
      // mass
      player.AddComponent(new basic_rigid_body.BasicRigidBody({
        pos: pos,
        quat: quat,
        size: scale*0.7,
      }));
      // player.AddComponent(new health_controller.HealthController({
        // maxHealth: 100,
      // }));
      player.AddComponent(new player_controller.PlayerController());
      // player.AddComponent(new arrow_effect.ArrowController());
      // player.AddComponent(new basic_rigid_body.ArrowRigidBodySystem());
      this.Manager.Add(player, 'player');

      player.SetPosition(pos)
      return player;
    }
  };
// This should be retitled
  class FloraSpawner extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Spawn(model) {
      const params = {
        camera: this.params_.camera,
        scene: this.params_.scene,
        offset: new THREE.Vector3(0, 0, 0),
      };

      const flora = new entity.Entity();
      flora.AddComponent(new render_component.RenderComponent({
        scene: params.scene,
        resourcePath: `../../models/environment/`,
        resourceName: `environment.glb`,
        scale: scale,
        castShadow:true,
        receiveShadow:true,
        sided:THREE.DoubleSide,
        offset: {
          position: new THREE.Vector3(0, 0, 0),
          quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler( Math.PI/2, 0, 0, 'XYZ' )),
        },
        callbackOrder: 'postLoad',
        callback: (mdl, anim, _) => {
          let posArray = []
          let quatArray = []
          let sizeArray = []

          globalThis.envir = mdl
          let enviroSet = mdl.children
          for(let enviro of enviroSet){
            for(let struct of enviro.children){
              if(struct.type =='Object3D'){
                for(let tree of struct.children){
                  let treeScale = tree.getWorldScale().multiplyScalar(0.3) 
                  treeScale.y *= 0.01
                  treeScale.z *= 2
                  posArray.push( tree.getWorldPosition() )
                  quatArray.push( tree.getWorldQuaternion() )
                  sizeArray.push(treeScale )
                  // flora.components_.BasicRigidPlane.InitEntity()

                  let depthMesh =  new THREE.MeshDepthMaterial( {
                    depthPacking: THREE.RGBADepthPacking,
                    map: tree.material.map,
                    alphaTest: 0.5
                  } );
                  tree.customDepthMaterial = depthMesh
                  tree.customDepthMaterial = depthMesh
                }
              }else{
            
                let structScale = struct.getWorldScale().multiplyScalar(0.3) 
                structScale.y *= 0.01
                structScale.z *= 2
                posArray.push( struct.getWorldPosition() )
                quatArray.push( struct.getWorldQuaternion() )
                sizeArray.push( structScale )
                // embed in loader?
                let depthMesh =  new THREE.MeshDepthMaterial( {
                  depthPacking: THREE.RGBADepthPacking,
                  map: struct.material.map,
                  alphaTest: 0.5
                } );
                struct.customDepthMaterial = depthMesh
                struct.customDepthMaterial = depthMesh
                // flora.components_.BasicRigidPlane.InitEntity()

              }
                
            }
            
          }
          let comp = new basic_rigid_body.CompoundRigidBody({
            poss: posArray,
            quats: quatArray,
            sizes: sizeArray,
          })
          flora.AddComponent(comp)
          flora.AddLateComponent(comp)
          
        }
      }));
      globalThis.flora = flora
      flora.SetPosition(new THREE.Vector3(0, globals.floorHeight+0.02, 0))
      this.Manager.Add(flora, 'flora');

      return flora;
    }
  };
  // player weapons Bows exclusively right now
  class WeaponSpawner extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Spawn(model) {
      const params = {
        camera: this.params_.camera,
        scene: this.params_.scene,
        offset: new THREE.Vector3(0, 0, 0),
      };

      const weapon = new entity.Entity();
      weapon.AddComponent(new render_component.RenderComponent({
        scene: params.scene,
        nonScene: true,
        resourcePath: `../../models/equipment/`,
        resourceName: `bow.glb`,
        scale: scale,
        castShadow:true,
        receiveShadow:true,
        sided:THREE.DoubleSide,
        offset: {
          position: new THREE.Vector3(0, 0, 0),
          quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler( Math.PI/2, 0, 0, 'XYZ' )),
        },
        callbackOrder: 'postLoad',
        callback: (mdl, anim, _) => {
          let weaponSet = mdl
          for(let weapon of weaponSet.children){
            try{
              weapon.children[0].scale.multiply(new THREE.Vector3(100, 100, 100) )
              weapon.children[1].scale.multiply(new THREE.Vector3(100, 100, 100) )
              
              let depthMesh =  new THREE.MeshDepthMaterial( {
                depthPacking: THREE.RGBADepthPacking,
                map: weapon.children[0].material.map,
                alphaTest: 0.5
              } );
              weapon.children[0].customDepthMaterial = depthMesh
              weapon.children[1].customDepthMaterial = depthMesh
              
            }catch(e){
              
            }
          }
          // cloning objects?

          // make it accesible

        }
      }));
      this.Manager.Add(weapon, 'weapons');

      return weapon;
    }
  };
  class GoblinWeaponSpawner extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Spawn(model) {
      const params = {
        camera: this.params_.camera,
        scene: this.params_.scene,
        offset: new THREE.Vector3(0, 0, 0),
      };

      const goblinWeapon = new entity.Entity();
      goblinWeapon.AddComponent(new render_component.RenderComponent({
        scene: params.scene,
        nonScene: true,
        resourcePath: `../../models/equipment/`,
        resourceName: `goblinWeapons.glb`,
        scale: scale,
        castShadow:true,
        receiveShadow:true,
        sided:THREE.DoubleSide,
        offset: {
          position: new THREE.Vector3(0, 0, 0),
          quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler( Math.PI/2, 0, 0, 'XYZ' )),
        },
        callbackOrder: 'postLoad',
        callback: (mdl, anim, _) => {
          let weaponSet = mdl
          for(let weapon of weaponSet.children){
            try{
              weapon.children[0].scale.multiply(new THREE.Vector3(100, 100, 100) )
              weapon.children[1].scale.multiply(new THREE.Vector3(100, 100, 100) )
              
              let depthMesh =  new THREE.MeshDepthMaterial( {
                depthPacking: THREE.RGBADepthPacking,
                map: weapon.children[0].material.map,
                alphaTest: 0.5
              } );
              weapon.children[0].customDepthMaterial = depthMesh
              weapon.children[1].customDepthMaterial = depthMesh
              
            }catch(e){
              
            }
          }
          // cloning objects?

          // make it accesible

        }
      }));
      this.Manager.Add(goblinWeapon, 'goblinWeapons');

      return goblinWeapon;
    }
  };

  class ArrowSpawner extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Spawn(model) {
      const params = {
        camera: this.params_.camera,
        scene: this.params_.scene,
        offset: new THREE.Vector3(0, 0, 0),
      };

      const arrow = new entity.Entity();
      arrow.AddComponent(new render_component.RenderComponent({
        scene: params.scene,
        nonScene: true,
        resourcePath: `../../models/equipment/`,
        resourceName: `arrow.glb`,
        scale: scale,
        castShadow:true,
        receiveShadow:true,
        sided:THREE.DoubleSide,
        offset: {
          position: new THREE.Vector3(0, 0, 0),
          quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler( Math.PI/2, 0, 0, 'XYZ' )),
        },
        callbackOrder: 'postLoad',
        callback: (mdl, anim, _) => {
          let arrowSet = mdl
          for(let arrow of arrowSet.children){
              arrow.children[0].scale.multiply(new THREE.Vector3(60, 60, 60) )
              arrow.children[1].scale.multiply(new THREE.Vector3(60, 60, 60) )

              let depthMesh =  new THREE.MeshDepthMaterial( {
                depthPacking: THREE.RGBADepthPacking,
                map: arrow.children[0].material.map,
                alphaTest: 0.5
              } );
              arrow.children[0].customDepthMaterial = depthMesh
              arrow.children[1].customDepthMaterial = depthMesh
          }
          // cloning objects?

          // make it accesible

        }
      }));
      this.Manager.Add(arrow, 'arrows');

      return arrow;
    }
  };

  class BuildingSpawner extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Spawn(model) {
      const params = {
        camera: this.params_.camera,
        scene: this.params_.scene,
        offset: new THREE.Vector3(0, 0, 0),
      };
      const building = new entity.Entity();
      building.AddComponent(new render_component.RenderComponent({
        scene: params.scene,
        resourcePath: `../../models/environment/`,
        resourceName: `town.glb`,
        scale: scale,
        castShadow:true,
        receiveShadow:true,
        sided:THREE.DoubleSide,
        offset: {
          position: new THREE.Vector3(0, 0, 0),
          quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler( Math.PI/2, 0, 0, 'XYZ' )),
        },
        callbackOrder: 'postLoad',
        callback: (mdl, anim, _) => {
          let buildingSet = mdl.children
          globalThis.buildingSet = buildingSet
          for(let build of buildingSet){

            // build.position.copy( new THREE.Vector3(40*(Math.random() - 0.5), 40*(Math.random() - 0.5), 0) )
          }

        }
      }));
      building.SetPosition(new THREE.Vector3(0, -1.15, 0))
      this.Manager.Add(building, 'building');

      return building;
    }
  };

  class GoblinSpawner extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;

      globalThis.enemySpawner = this
    }

    Spawn() {
      const params = {
        camera: this.params_.camera,
        scene: this.params_.scene,
        offset: new THREE.Vector3(0, 0, 0),
        blasterStrength: 10,
      };

      const enemy = new entity.Entity();
      enemy.AddComponent(
        new spatial_grid_controller.SpatialGridController(
            {grid: this.params_.grid}));

      enemy.AddComponent(new enemy_ai_controller.EnemyAIController({
        grid: this.params_.grid,
      }));
      enemy.AddComponent(new render_component.RenderComponent({
        scene: params.scene,
        resourcePath: '../../models/enemy/',
        resourceName: 'goblin1.glb',
        scale: 0.7*scale,
        castShadow:true,
        receiveShadow:true,
        sided:THREE.DoubleSide,
        // scale: 0.0015,
        offset: {
          position: new THREE.Vector3(0, 0, 0),
          quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler( Math.PI/2, 0, 0, 'XYZ' )),
        },
        //this really isn't my favourite style, but it does preserve renderComponents independence and consolidates the resource paths
        callback: (mdl, anim, self) => {
          let controller = self.Parent.components_.EnemyAIController
          controller._mixer = new THREE.AnimationMixer( mdl.children[0] );
          globalThis.control = controller
          anim.forEach(x=>{
            controller._animations[x.name] = controller._mixer.clipAction(x);
          });
          controller._enemyStrafeFSM.SetState('Idle') 
          controller._enemySlashFSM.SetState('IdleSlash')

          // TODO this is silly is there a cleaner way to traverse armitures?
          let righthand = mdl.children[0].children[0].children[0].children[0].children[0].children[2].children[0].children[0].children[0]
          controller.righthand = righthand
          mdl.children[0].children[1].frustumCulled=false
          // this should be more easily accesible.
          let weapons = self.Parent.FindEntity('goblinWeapons').GetComponent('RenderComponent').group_.children[0].children
          
          // create a clone
          // TODO name weapons
          controller.weapons = weapons.filter(x=> x.name=='Plane');
          let weapon = controller.weapons[0]
          globalThis.goblinWeapon = weapon
          controller.weapon = weapon

          righthand.add(weapon)
            // something is rewritting the material (no idea what)
            // it would be cool to do a physics based weapon at some point 
          setTimeout(() => {
            weapon.material.side = THREE.DoubleSide
            weapon.material.needsUpdate = true
          }, 1000);

        }
      }));
      let pos = new THREE.Vector3(0, -1.14, -1.5)
      let quat = new THREE.Quaternion()

      enemy.AddComponent(new basic_rigid_body.BasicRigidBody({
        pos: pos,
        quat: quat,
        size: scale*0.7*0.7,
      }));
      enemy.AddComponent(new health_controller.HealthController({
        maxHealth: 50,
      }));
      // DEMO
      // e.AddComponent(new enemy_controller.PlayerController());

      // add as enemy?
      this.Manager.Add(enemy, 'goblin');
      enemy.SetPosition(pos)

      return enemy;
    }
  };

  return {
    PlayerSpawner: PlayerSpawner,
    FloraSpawner: FloraSpawner,
    BuildingSpawner: BuildingSpawner,
    WeaponSpawner: WeaponSpawner,
    GoblinSpawner: GoblinSpawner,
    GoblinWeaponSpawner: GoblinWeaponSpawner,
    ArrowSpawner: ArrowSpawner,
    // ParticleEffectSpawner: ParticleEffectSpawner,
  };
})();