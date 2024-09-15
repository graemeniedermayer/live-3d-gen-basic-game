

import { entity } from './game/entity.js'

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
        resourcePath: '../../models/enemy/goblin1.glb',
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

    Spawn_Weapon(model) {
      const params = {
        camera: this.params_.camera,
        scene: this.params_.scene,
        offset: new THREE.Vector3(0, 0, 0),
      };

      const goblinWeapon = new entity.Entity();
      goblinWeapon.AddComponent(new render_component.RenderComponent({
        scene: params.scene,
        nonScene: true,
        resourcePath: `../../models/equipment/goblinWeapons.glb`,
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

export {GoblinSpawner}