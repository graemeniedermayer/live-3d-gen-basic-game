import {THREE, SkeletonUtils} from '../core/three-defs.js';
import {entity} from "../core/entity.js";

import {particle_system} from "./particle-system.js";

export const arrow_effect = (() => {

  class ArrowTrail extends particle_system.DirectionalEmitter {
    constructor(offset, parent) {
      super();
      this.parent_ = parent;
      this.offset_ = offset;
      this.blend_ = 1.0;
    }

    OnUpdate_() {
    }

    AddParticles(num) {


      for (let i = 0; i < num; ++i) {
        this.particles_.push(this.CreateParticle_());
      }
    }

    CreateParticle_() {
      const life = (Math.random() * 0.85 + 0.15) * 6.0;
      const p = this.offset_.clone().applyQuaternion(this.parent_.Quaternion).add(this.parent_.Position);
      const d = new THREE.Vector3(0, 0, 0);

      return {
          position: p,
          size: 0.1,
          colour: new THREE.Color(),
          alpha: 1.0,
          life: life,
          maxLife: life,
          rotation: 0,
          velocity: d,
          blend: this.blend_,
          drag: 1.0,
      };
    }
  };

  class ArrowImpact extends particle_system.ParticleEmitter {
    constructor(offset, parent) {
      super();
      this.parent_ = parent;
      this.offset_ = offset;
      this.blend_ = 1.0;
    }

    OnUpdate_() {
    }

    AddParticles(num) {


      for (let i = 0; i < num; ++i) {
        this.particles_.push(this.CreateParticle_());
      }
    }

    CreateParticle_() {
      const life = (Math.random() * 0.85 + 0.15) * 6.0;
      const p = this.offset_.clone().applyQuaternion(this.parent_.Quaternion).add(this.parent_.Position);
      // spherically random
      const phi = 2*Math.PI * Math.random()
      const theta = Math.PI * Math.random()
      // since is random (x,y,z) order doesn't really matter
      const d = new THREE.Vector3(Math.cos(theta), Math.sin(theta)*Math.cos(phi), Math.sin(theta)*Math.sin(phi));

      return {
          position: p,
          size: Math.random()*0.2+0.2,
          colour: new THREE.Color(),
          alpha: 1.0,
          life: life,
          maxLife: life,
          rotation: 2*Math.PI*Math.random(),
          velocity: d.multiplyScalar(0.1*Math.random()),
          blend: this.blend_,
          drag: 1.0,
      };
    }
  };
  class ArrowTrailComponent extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
      this.particles_ = null;
      this.emitter_ = null;
    }


    Destroy() {
      this.particles_.Destroy();
      this.particles_ = null;
    }

    InitEntity() {
      this.particles_ = new particle_system.DirecitonalSystem({
          camera: this.params_.camera,
          parent: this.params_.scene,
          texture: '/static/eave/experiment/aiar/textures/fx/'+this.params_.type+'Trail.png',
      });
      this.ArrowFired_();
    }
    // alter trail?

    ArrowFired_() {
      const emitter = new ArrowEffect(new THREE.Vector3(0, 0, .05), this.Parent);
      emitter.SetEmissionRate(50);
      emitter.SetLife(8.0);
      emitter.blend_ = 1.0;
      this.particles_.AddEmitter(emitter);
      emitter.AddParticles(15);

      this.emitter_ = emitter;
    }

    Update(timeElapsed) {
      this.particles_.Update(timeElapsed);

      const emitter = new ArrowEffect(new THREE.Vector3(0, 0, .05), this.Parent);
      emitter.alphaSpline_.AddPoint(0.0, 0.0);
      emitter.alphaSpline_.AddPoint(0.7, 1.0);
      emitter.alphaSpline_.AddPoint(1.0, 0.0);
      
      emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0x808080));
      emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0x404040));
      
      emitter.sizeSpline_.AddPoint(0.0, 0.5);
      emitter.sizeSpline_.AddPoint(0.25, 2.0);
      emitter.sizeSpline_.AddPoint(0.75, 4.0);
      emitter.sizeSpline_.AddPoint(1.0, 10.0);
      emitter.SetEmissionRate(50);
      emitter.SetLife(8.0);
      emitter.blend_ = 1.0;
      this.particles_.AddEmitter(emitter);
      emitter.AddParticles(15);

      this.emitter_ = emitter;

      if (!this.emitter_.IsAlive) {
        this.Parent.SetDead(true);
        return;
      }
      if (this.params_.target.IsDead) {
        this.emitter_.SetLife(0.0);
        return;
      }
      this.Parent.SetPosition(this.params_.target.Position);
    }
  }
  
  // only for effect arrows (exploding/fire/ice)
  class ArrowImpactComponent extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
      this.particles_ = null;
      this.emitter_ = null;
    }


    Destroy() {
      this.particles_.Destroy();
      this.particles_ = null;
    }

    InitEntity() {
      this.particles_ = new particle_system.ParticleSystem({
          camera: this.params_.camera,
          parent: this.params_.scene,
          texture: '/static/eave/experiment/aiar/textures/fx/'+this.params_.type+'Explosion.png',
      });
      this.OnDamaged_();
    }

    OnDamaged_() {
      const emitter = new ArrowEffect(new THREE.Vector3(0, 0, .05), this.Parent);
      emitter.alphaSpline_.AddPoint(0.0, 0.0);
      emitter.alphaSpline_.AddPoint(0.7, 1.0);
      emitter.alphaSpline_.AddPoint(1.0, 0.0);
      
      emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0x808080));
      emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0x404040));
      
      emitter.sizeSpline_.AddPoint(0.0, 0.5);
      emitter.sizeSpline_.AddPoint(0.25, 2.0);
      emitter.sizeSpline_.AddPoint(0.75, 4.0);
      emitter.sizeSpline_.AddPoint(1.0, 10.0);
      emitter.SetEmissionRate(50);
      emitter.SetLife(8.0);
      emitter.blend_ = 1.0;
      this.particles_.AddEmitter(emitter);
      emitter.AddParticles(15);

      this.emitter_ = emitter;
    }

    Update(timeElapsed) {
      this.particles_.Update(timeElapsed);

      if (!this.emitter_.IsAlive) {
        this.Parent.SetDead(true);
        return;
      }
      if (this.params_.target.IsDead) {
        this.emitter_.SetLife(0.0);
        return;
      }
      this.Parent.SetPosition(this.params_.target.Position);
    }
  }


  class ArrowImpactSpawner extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Spawn(target) {
      const params = {
        camera: this.params_.camera,
        scene: this.params_.scene,
        target: target,
        type: 'flame'
      };

      const e = new entity.Entity();
      e.SetPosition(target.Position);
      e.AddComponent(new ArrowImpactComponent(params));

      this.Manager.Add(e);

      return e;
    }
  }

  class ArrowTrailerSpawner extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Spawn(target) {
      const params = {
        camera: this.params_.camera,
        scene: this.params_.scene,
        target: target,
        type: 'flame'
      };

      const e = new entity.Entity();
      e.SetPosition(target.Position);
      e.AddComponent(new ArrowTrailComponent(params));

      this.Manager.Add(e);

      return e;
    }
  }

  class ArrowController extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
      this.particles_ = null;
      this.emitter_ = null;
      this.particleSystem_ = new THREE.Group()
      this.arrows_ = {}
      this.trails_ = []
      this.explosions_ = []
    }


    Destroy() {
      this.particles_.Destroy();
      this.particles_ = null;
    }

    InitEntity() {
      this.particleSystem_ = new THREE.Group()
      scene.add(this.particleSystem_)
      this.arrows_ = {}
      this.rigidBodies = this.Parent.GetComponent('ArrowRigidBodySystem')
      this.RegisterHandler_('player.fire', (m) => { this.FireArrow_(m); });
    }

    FireArrow_(m){
      let arrowOrig = this.Parent.FindEntity('arrows').GetComponent('RenderComponent').group_.children[0].children[0]
      let player = this.Parent.FindEntity('arrows')
      let index = Object.keys(this.arrows_).length;
      let direction = (new THREE.Vector3(0,0,1)).applyQuaternion(this.Parent._rotation)
      let pos = direction.clone().multiplyScalar(0.1).add(this.Parent._position)
      pos.y+=0.05
      let quat = this.Parent._rotation.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler( Math.PI/2, 0, 0, 'XYZ' )))
      this.rigidBodies.InitArrow(index, {
        initialVelocity: direction.multiplyScalar(5) ,
        pos: pos,
        quat: quat,
        size:1,
      });
      // this struct okay? maybe we want arrowOrig.children[0]
      let arrow = SkeletonUtils.clone(arrowOrig);
      this.arrows_[index] = arrow
      arrow.frustumCulled = false;

      arrow.scale.copy( new THREE.Vector3(0.001,0.001,0.001))
      arrow.position.copy( pos )
      arrow.quaternion.copy( quat)
      // useful to have off for debugging

      this.particleSystem_.add( arrow );

      // this.arrows_.push((new ArrowTrailerSpawner()).spawn({Position:pos}))
    }

    Update(timeElapsed) {
    }
  }

  return {
    ArrowController: ArrowController
  };
})();