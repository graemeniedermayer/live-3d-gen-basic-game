import {THREE} from '../core/three-defs.js';
import {entity} from '../core/entity.js';

import {fsm} from '../animations/fsm.js';

export const enemy_ai_controller = (() => {
  
  const _TMP_V3_0 = new THREE.Vector3();

  const _WANDER_FORCE = 0.5;
  const _MAX_TARGET_DISTANCE = 15;

  const _TMP_M0 = new THREE.Matrix4();
  const _TMP_Q0 = new THREE.Quaternion();

  class EnemyAIController extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
      this.grid_ = params.grid;
      this.input_ = {button1:false,axis1Forward:0, axis1Side:0};
      this.dead_ = false;
      this.attackReach_ = 0.1;
      this.strafeRate_ = 0.001;
      this._mixer;
      this.scale = 1
      this._animations = {};
      this._enemySlashFSM = new fsm.enemySlashFSM(this);
      this._enemyStrafeFSM = new fsm.enemyStrafeFSM(this);
    }

    InitComponent() {
      this.RegisterHandler_('physics.collision', (m) => { this.OnCollision_(m); });
      this.RegisterHandler_('health.dead', (m) => { this.OnDeath_(m); });
      this.decceleration_ = new THREE.Vector3(-0.00005, -0.00001, -0.01);
      this.acceleration_ = new THREE.Vector3(1, 0.005, 250);
      this.velocity_ = new THREE.Vector3(0, 0, 0);
    }


    // 
    OnCollision_(){

    }

    OnDeath_(){
      if (!this.dead_) {
        this.dead_ = true;
        let body = this.Parent.components_.BasicRigidBody
        this._enemyStrafeFSM.SetState('Death') 
        _APP.ammojs_.RemoveRigidBody(body)
        // spawn new goblin?
      }
    }

    Update(timeElapsed) {
    }

    Slash_() {
      // is in range?
      this.input_.button1
    }
  
    AcquireTarget_() {
      const pos = this.Parent.Position;
      const enemies = this.params_.grid.FindNear(
          [pos.x, pos.z], [10, 10]).filter(
          c => c.entity.Attributes.team == 'allies'
      );

      if (enemies.length == 0) {
        return;
      }

      this.target_ = enemies[0].entity;
    }
// this doesn't initially need to be applied
    ApplyCollisionAvoidance_() {
      const pos = this.Parent.Position;
      const colliders = this.grid_.FindNear([pos.x, pos.z], [5, 5]).filter(
          c => c.entity.ID != this.Parent.ID
      );

      const force = new THREE.Vector3(0, 0, 0);
  
      for (const c of colliders) {
        const entityPos = c.entity.Position;
        const entityRadius = c.entity.Attributes.roughRadius;
        const dist = entityPos.distanceTo(pos);

        if (dist > (entityRadius + 5)) {
          continue;
        }

        const directionFromEntity = _TMP_V3_0.subVectors(
            pos, entityPos);
        const multiplier = (entityRadius + this.Parent.Attributes.roughRadius) / Math.max(1, (dist - 2));
        directionFromEntity.normalize();
        directionFromEntity.multiplyScalar(multiplier * _COLLISION_FORCE);
        force.add(directionFromEntity);
      }
  
      return force;
    }

    ApplyAttack_() {
      if(distanceToTarget > this.attackReach_){
        this.input_.button1 = true
      }
    }
    ApplyMovement_(timeInSeconds){
      const velocity = this.velocity_;
  
      const _PARENT_Q = this.Parent.Quaternion.clone();
      const _PARENT_P = this.Parent.Position.clone();

      const _Q = new THREE.Quaternion();
      const _A = new THREE.Vector3();
      const _R = _PARENT_Q.clone();

      let direction = new THREE.Vector3(0, 0, 1).applyQuaternion(_PARENT_Q)
      
      let anglesin = (direction.clone().cross(this.target_)
        ).dot(new THREE.Vector3(0,1,0))/(direction.length() * target.length())
  
      const acc = this.acceleration_.clone();
      let sinTime = Math.sin(timeInSeconds*this.strafeRate_)
      let velForward = direction.length() > 0 ? 1.38/0.7333 : 0
      let velLeft = sinTime > 0 ? -1.8/1.3333 : sinTime < 0 ? 1.8/1.2333 : 0
      // slow when attacking
      if(input.button1){
        velForward /= 2
        velLeft /= 2
      }
      velocity.z = velForward * this.scale
      velocity.x = velLeft * this.scale
      
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 0.1*anglesin );
      _R.multiply(_Q);
  
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(_PARENT_Q);
      forward.normalize();
  
      const updown = new THREE.Vector3(0, 1, 0);
      updown.applyQuaternion(_PARENT_Q);
      updown.normalize();

      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(_PARENT_Q);
      sideways.normalize();
      let vel = velocity.clone().multiplyScalar(1.2).applyQuaternion(_PARENT_Q)
      try{
        // likely not scaled correctly...
        this.Parent.components_.BasicRigidBody.body_.body_.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z))
        this.Parent.SetQuaternion(_R);
        this.Parent.components_.BasicRigidBody.body_.body_.activate()
      }catch(e){
        sideways.multiplyScalar(velocity.x * timeInSeconds);
        updown.multiplyScalar(velocity.y * timeInSeconds);
        forward.multiplyScalar(velocity.z * timeInSeconds);
        this.lastTime = timeInSeconds
        
        const pos = _PARENT_P;
        pos.add(forward);
        pos.add(sideways);
        pos.add(updown);

        this.Parent.SetQuaternion(_R);
        this.Parent.SetPosition(pos);
      }
      // strafe back and forth while moving forward?
    }

    Update(timeInSeconds) {

      if(this._mixer){
        this._mixer.update(timeInSeconds);
      }
      this._enemySlashFSM.Update(timeInSeconds, this.input_);
      this._enemyStrafeFSM.Update(timeInSeconds, this.input_);
      if (this.dead_) {
        return;
      }
      this.AcquireTarget_()
      if(this.target_){
        let distanceToTarget = this.target_.Position.distanceTo(this.Parent.Position)
        this.ApplyAttack_(distanceToTarget)
        this.ApplyMovement_(timeInSeconds, distanceToTarget)
      }
      
      // this.Parent.Attributes.InputCurrent;
      if (!this.input_) {
        return;
      }
    }
  };

  return {
    EnemyAIController: EnemyAIController,
  };

})();