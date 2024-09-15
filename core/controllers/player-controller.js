import {Vector3, Quaternion} from 'three'
import {entity} from '../game/entity.js';

import {fsm} from '../animations/fsm.js';

let velocity_type = {
  bow:{
    forwards:1.38/0.7333,
    left:1.8/1.3333,
    right:1.8/1.3333,
    backwards:1.38/1.0333
  },
  spear:{
    forwards:1.38/0.7333,
    left:1.8/1.3333,
    right:1.8/1.3333,
    backwards:1.38/1.0333
  },
  sword:{
    forwards:4*1.38/0.7333,
    left:4*1.38/0.7333,
    right:4*1.38/0.7333,
    backwards:4*1.38/0.7333*1.1
  }
}

export const player_controller = (() => {

  class PlayerController extends entity.Component {
    constructor(params) {
      super();
      this.type = 'bow'
      this.params_ = params;
      this.dead_ = false;
      this._mixer;
      this.scale = 0.2
      this._animations = {};
      // style
      this.char_type = params.type
      if(this.char_type=='bow'){
        this._attackFSM = new fsm.bow_attackFSM(this);
        this._forwardFSM = new fsm.bow_forwardFSM(this);
        this._strafeFSM = new fsm.bow_strafeFSM(this);
      }else if(this.char_type=='spear'){
        this._attackFSM = new fsm.spear_attackFSM(this);
        this._forwardFSM = new fsm.spear_forwardFSM(this);
        this._strafeFSM = new fsm.spear_strafeFSM(this);
      }else if(this.char_type=='sword'){
        this._attackFSM = new fsm.sword_attackFSM(this);
        this._forwardFSM = new fsm.sword_forwardFSM(this);
        this._strafeFSM = new fsm.sword_strafeFSM(this);
      }
    }

    Reset(type){
      this._mixer.stopAllAction()
      if(type=='bow'){
        this._attackFSM = new fsm.bow_attackFSM(this);
        this._forwardFSM = new fsm.bow_forwardFSM(this);
        this._strafeFSM = new fsm.bow_strafeFSM(this);
      }else if(type=='spear'){
        this._attackFSM = new fsm.spear_attackFSM(this);
        this._forwardFSM = new fsm.spear_forwardFSM(this);
        this._strafeFSM = new fsm.spear_strafeFSM(this);
      }else if(type=='sword'){
        this._attackFSM = new fsm.sword_attackFSM(this);
        this._forwardFSM = new fsm.sword_forwardFSM(this);
        this._strafeFSM = new fsm.sword_strafeFSM(this);
      }
      this.InitState(type)
    }

    InitState(type){
      this.type = type
      if(type=='bow'){
        this._forwardFSM.SetState('Bow_Empty') 
        this._strafeFSM.SetState('Bow_Idle') 
        this._attackFSM.SetState('Bow_DrawIdle')
      }else if(type=='spear'){
        this._forwardFSM.SetState('Spear_Empty') 
        this._strafeFSM.SetState('Spear_Idle') 
        this._attackFSM.SetState('Spear_AttackIdle')
      }else if(type=='sword'){
        this._forwardFSM.SetState('Sword_Empty') 
        this._strafeFSM.SetState('Sword_Idle') 
        this._attackFSM.SetState('Sword_AttackIdle')
      }
    }

    InitComponent() {
      this.RegisterHandler_('physics.collision', (m) => { this.OnCollision_(m); });
      this.RegisterHandler_('health.dead', (m) => { this.OnDeath_(m); });
    }

    InitEntity() {
      this.decceleration_ = new Vector3(-0.00005, -0.00001, -0.01);
      this.acceleration_ = new  Vector3(1, 0.005, 250);
      this.velocity_ = new  Vector3(0, 0, 0);
    }
    OnDeath_(m) {
      if (!this.dead_) {
        this.dead_ = true;
      }
      this.Parent.components_.BasicRigidBody.Destroy()
      
      this._forwardFSM.SetState('Death')
      this._strafeFSM.SetState('Death') 
      this._attackFSM.SetState('Death')
    }
    OnCollision_(m) {
      // This should be used for death aminations

      // damage dealing collision
      // if(collision.EnemyWeapon){
      //     this.Broadcast({topic: 'health.dead'});

      // }
      // if(collision.EnemySpawner && collision.PlayerSpawner){

      // }

      // if (!this.dead_) {
      //   this.dead_ = true;
      //   this.Broadcast({topic: 'health.dead'});
      // }
    }

    Fire_() {
    }

    Update(timeInSeconds) {
      if (this.dead_) {
        return;
      }
      if(this._mixer){
        this._mixer.update(timeInSeconds);
      }

      const input = this.Parent.Attributes.InputCurrent;
      if (!input) {
        return;
      }
      let model_scale
      try{
        model_scale = this.Parent.model.scale.x
      }catch(e){
        model_scale = 1
      }
      const velocity = this.velocity_;
  
      const _PARENT_Q = this.Parent.Quaternion.clone();
      const _PARENT_P = this.Parent.Position.clone();
      const _CAM_Q = globalThis.camera.quaternion.clone()
      
      const right_stick = new Vector3( -input.inputRightRight, 0, -input.inputRightForward).applyQuaternion(_CAM_Q)
      right_stick.y = 0
      let direction = new Vector3(0, 0, 1).applyQuaternion(_PARENT_Q)
      let direction_x = new Vector3(1, 0, 0).applyQuaternion(_PARENT_Q)
      let direction_z = new Vector3(0, 0, 1).applyQuaternion(_PARENT_Q)
      
      right_stick.normalize()
    

      // animation scaling should be done here (ie 1.333 factors later below )
      right_stick.applyQuaternion(_PARENT_Q.clone().invert())
      
      // let direction = new Vector3(0, 0, 1).applyQuaternion(_PARENT_Q)
      // let orientation_motion =  direction.clone()
    
      if(input.inputRightRight!== 0 || input.inputRightForward!==0){
        input.c_right = -direction_x.dot(right_stick)
        input.c_forward = direction_z.dot(right_stick)
      }else{
        input.c_right = 0
        input.c_forward = 0
      }

      input.right = right_stick.x
      input.forward = right_stick.z


      const left_stick = new Vector3( -input.inputLeftRight, 0, -input.inputLeftForward).applyQuaternion(_CAM_Q)
      left_stick.y = 0
      left_stick.normalize()

      
      const _Q = new Quaternion();
      const _A = new Vector3();
      const _R = _PARENT_Q.clone();

      
      globalThis.direction = direction

      
      this._attackFSM.Update(timeInSeconds, input);
      this._forwardFSM.Update(timeInSeconds, input);
      this._strafeFSM.Update(timeInSeconds, input);
      // let target = input.target.clone().sub(_PARENT_P)
      // let target = new Vector3( input.inputLeftForward, 0, input.inputLeftRight)
      let anglesin
      if(left_stick.length()>0){
        anglesin = (direction.clone().cross(left_stick)).dot(new Vector3(0,1,0))/(direction.length() * left_stick.length())        
      }
      const acc = this.acceleration_.clone();
      // let velocity_traits = this.char_type
      let vel_stance = velocity_type[this.type]
      if (input.button2) {
        // movement should be scaled earlier
        
        let velForward = input.forward > 0 ? input.forward * vel_stance.forwards : input.forward < 0 ? input.forward * vel_stance.backwards : 0
        let velLeft = input.right > 0 ? input.right * vel_stance.right : input.right < 0 ? input.right * vel_stance.left : 0
        // let velForward = input.forward > 0 ? velocity_traits.forwards : input.forward < 0 ? velocity_traits.backwards : 0
        // let velLeft = input.right > 0 ? velocity_traits.right : input.right < 0 ? velocity_traits.left : 0
        if(input.button1){
          velForward /= 2
          velLeft /= 2
        }
        velocity.z = velForward * this.scale * model_scale
        velocity.x = velLeft * this.scale * model_scale
      }else{
        // let velForward = input.inputRightForward > 0 ? 1.38/0.7333 : input.inputRightForward < 0 ? -1.38/1.0333 : 0
        // let velLeft = input.inputRightRight > 0 ? -1.8/1.3333 : input.inputRightRight < 0 ? 1.8/1.2333 : 0
        
        let velForward = input.forward > 0 ? input.forward * vel_stance.forwards : input.forward < 0 ? input.forward * vel_stance.backwards : 0
        let velLeft = input.right > 0 ? input.right * vel_stance.right : input.right < 0 ? input.right * vel_stance.left : 0
        if(input.button1){
          velForward /= 2
          velLeft /= 2
        }
        velocity.z = velForward * this.scale * model_scale
        velocity.x = velLeft * this.scale * model_scale
        
        _A.set(0, 1, 0);
        if(left_stick.length()>0){
          _Q.setFromAxisAngle(_A, 0.1*anglesin );
          _R.multiply(_Q);
        }
      }
  
      const forward = new Vector3(0, 0, 1);
      forward.applyQuaternion(_PARENT_Q);
      forward.normalize();
  
      const updown = new Vector3(0, 1, 0);
      updown.applyQuaternion(_PARENT_Q);
      updown.normalize();

      const sideways = new Vector3(1, 0, 0);
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
    }
  };
  
  return {
    PlayerController: PlayerController,
  };

})();