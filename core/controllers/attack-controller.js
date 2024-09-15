import {THREE} from '../core/three-defs.js';
import {entity} from '../core/entity.js';

import {particle_system} from "../animations/particle-system.js";

export const bow_controller = (() => {

  class BowController extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
      this.cooldownTimer_ = 0.0;
      this.cooldownRate_ = 0.075;
      this.powerLevel_ = 0.0;

      const x = 0.4 * .2;
      const y1 = -0.02  * .2;
      const z = 0.1 * .2;
      this.offsets_ = [
          new THREE.Vector3(-x, y1, -z),
          new THREE.Vector3(x, y1, -z),
      ];
      for (let i = 0; i < this.offsets_.length; ++i) {
        this.offsets_[i].add(this.params_.offset);
      }
      this.offsetIndex_ = 0;
      this.shots_ = [];
    }

    Destroy() {
      this.blasterFX_.Destroy();
      this.blasterFX_ = null;
    }

    InitComponent() {
      this.RegisterHandler_('player.fire', (m) => this.OnFire_(m));
    }

    InitEntity() {
      const group = this.GetComponent('RenderComponent').group_;
      this.blasterFX_ = new particle_system.ParticleSystem({
          camera: this.params_.camera,
          parent: group,
          texture: '/static/resources/fx/moon.png',
      });

      

      this.spotlight_ = new THREE.SpotLight(
          0xFFFFFF, 0.050, 2, Math.PI / 2, 0.5);
      this.spotlight_.position.set(0, 0, -0.05);
      this.spotlight_.target.position.set(0, 0, -0.06);

      group.add(this.spotlight_);
      group.add(this.spotlight_.target);
    }

    SetupFlashFX_(index) {
      const group = this.GetComponent('RenderComponent').group_;
      const emitter = new FlashFXEmitter(this.offsets_[index], group);
      emitter.alphaSpline_.AddPoint(0.0, 0.0);
      emitter.alphaSpline_.AddPoint(0.5, 1.0);
      emitter.alphaSpline_.AddPoint(1.0, 0.0);
      
      emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0xFF4040));
      emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0xA86A4F));
      
      emitter.sizeSpline_.AddPoint(0.0, 0.25);
      emitter.sizeSpline_.AddPoint(0.25/2, 1.0);
      emitter.sizeSpline_.AddPoint(0.5, 0.25/2);
      emitter.SetEmissionRate(0);
      emitter.blend_ = 0.0;  
      this.blasterFX_.AddEmitter(emitter);
      emitter.AddParticles(1);
    }

    OnFire_() {
      if (this.cooldownTimer_ > 0.0) {
        return;
      }

      if (this.powerLevel_ < 0.2) {
        return;
      }

      this.powerLevel_ = Math.max(this.powerLevel_ - 0.2, 0.0);

      this.cooldownTimer_ = this.cooldownRate_;
      this.offsetIndex_ = (this.offsetIndex_ + 1) % this.offsets_.length;

      const fx = this.FindEntity('fx').GetComponent('ArrowSystem');
      const p1 = fx.CreateParticle();
    // create cylinder +
    // rigid-body
    // LoadGLB(path, name, onLoad) 


      p1.Start = this.offsets_[this.offsetIndex_].clone();
      p1.Start.applyQuaternion(this.Parent.Quaternion);
      p1.Start.add(this.Parent.Position);
      p1.End = p1.Start.clone();
      p1.Velocity = this.Parent.Forward.clone().multiplyScalar(20.0);
      p1.Length = 0.50;
      p1.Colours = [
          new THREE.Color(4.0, 0.5, 0.5), new THREE.Color(0.0, 0.0, 0.0)];
      p1.Life = 5.0;
      p1.TotalLife = 5.0;
      p1.Width = 0.0025;

      
      this.shots_.push(p1);
      this.SetupFlashFX_(this.offsetIndex_);
    }

    UpdateShots_() {
      this.shots_ = this.shots_.filter(p => {
        return p.Life > 0.0;
      });

      const physics = this.FindEntity('physics').GetComponent('AmmoJSController');
      for (let s of this.shots_) {
        const hits = physics.RayTest(s.Start, s.End);
        for (let h of hits) {
          if (h.name == this.Parent.Name) {
            continue;
          }
          const e = this.FindEntity(h.name);
          e.Broadcast({topic: 'player.hit', value: this.params_.blasterStrength});
          s.Life = 0.0;

          const explosion = this.FindEntity('spawners').GetComponent('TinyExplosionSpawner')
          explosion.Spawn(h.position);    
        }
      }
    }

    Update(timeElapsed) {
      this.cooldownTimer_ = Math.max(this.cooldownTimer_ - timeElapsed, 0.0);
      this.powerLevel_ = Math.min(this.powerLevel_ + timeElapsed, 4.0);

      this.blasterFX_.Update(timeElapsed);

      this.UpdateShots_();
    }
  };

  return {
    AllyFighterController: AllyFighterController,
  };
})();