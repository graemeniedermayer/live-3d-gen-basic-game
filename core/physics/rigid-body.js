import { BoxGeometry, CylinderGeometry, MeshBasicMaterial, Mesh} from 'three'
import {entity} from '../game/entity.js';

// this should build network controller.

export const basic_rigid_body = (() => {

  class BasicRigidBody extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Destroy() {  
      this.FindEntity('physics').GetComponent('AmmoJSController').RemoveRigidBody(this.body_);
    }

    InitEntity() {
      // render component should be offset!
      const pos = this.Parent.Position;
      const quat = this.Parent.Quaternion;

      this.body_ = this.FindEntity('physics').GetComponent('AmmoJSController').CreateSphere(
        this.params_.pos,  this.params_.quat, this.params_.size, {name: this.Parent.Name});
      if(globalThis.debugging){
        const geometry = new CylinderGeometry( this.params_.size, this.params_.size, 0.2, 12 );
        const material = new MeshBasicMaterial( {color: 0x0000ff} );
        this.debug_ = new Mesh(geometry, material);
        this.debug_.position.copy( this.params_.pos)
        this.debug_.quaternion.copy( this.params_.quat)
        globalThis.scene.add(this.debug_)
      }
      this.Broadcast({topic: 'physics.loaded'});
    }

    InitComponent() {
      this.RegisterHandler_('update.position', (m) => { this.OnPosition_(m); });
      this.RegisterHandler_('update.rotation', (m) => { this.OnRotation_(m); });
      this.RegisterHandler_('physics.collision', (m) => { this.OnCollision_(m); });
    }

    OnCollision_() {
    }

    OnPosition_(m) {
      this.OnTransformChanged_();
    }

    OnRotation_(m) {
      this.OnTransformChanged_();
    }

    OnTransformChanged_() {
      const pos = this.Parent.Position;
      const quat = this.Parent.Quaternion;
      const ms = this.body_.motionState_;
      const t = this.body_.transform_;

      if(globalThis.debugging){
        this.debug_.position.copy(pos)
        this.debug_.quaternion.copy(quat)
      }
      
      ms.getWorldTransform(t);
      t.setIdentity();
      t.getOrigin().setValue(pos.x, pos.y, pos.z);
      t.getRotation().setValue(quat.x, quat.y, quat.z, quat.w);
      ms.setWorldTransform(t);


    }

    Update(_) {
    }
  };


  class FloorRigidBody extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Destroy() {  
      this.FindEntity('physics').GetComponent('AmmoJSController').RemoveRigidBody(this.body_);
    }

    InitEntity() {
      // render component should be offset!
      const pos = this.Parent.Position;
      const quat = this.Parent.Quaternion;

      this.body_ = this.FindEntity('physics').GetComponent('AmmoJSController').CreateFloor(
          pos, quat, this.params_.size, {name: 'floor'});
      if(globalThis.debugging){
        const geometry = new BoxGeometry( this.params_.size.x, this.params_.size.y, this.params_.size.z);
        const material = new MeshBasicMaterial( {color: 0x0000ff} );
        this.debug_ = new Mesh(geometry, material);
        this.debug_.position.copy(pos)
        this.debug_.quaternion.copy(quat)
        globalThis.scene.add(this.debug_)
      }
      this.Broadcast({topic: 'physics.loaded'});
    }

    InitComponent() {
      this.RegisterHandler_('update.position', (m) => { this.OnPosition_(m); });
      this.RegisterHandler_('update.rotation', (m) => { this.OnRotation_(m); });
      this.RegisterHandler_('physics.collision', (m) => { this.OnCollision_(m); });
    }

    OnCollision_() {
    }

    OnPosition_(m) {
      this.OnTransformChanged_();
    }

    OnRotation_(m) {
      this.OnTransformChanged_();
    }

    OnTransformChanged_() {
      // floor shouldn't change
      // const pos = this.Parent.Position;
      // const quat = this.Parent.Quaternion;
      // const ms = this.body_.motionState_;
      // const t = this.body_.transform_;

      // if(globalThis.debugging){
      //   this.debug_.position.copy(pos)
      //   this.debug_.quaternion.copy(quat)
      // }
      
      // ms.getWorldTransform(t);
      // t.setIdentity();
      // t.getOrigin().setValue(pos.x, pos.y, pos.z);
      // t.getRotation().setValue(quat.x, quat.y, quat.z, quat.w);
      // ms.setWorldTransform(t);


    }

    Update(_) {
    }
  };

  // for environment in particular
  class CompoundRigidBody extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Destroy() {
      this.FindEntity('physics').GetComponent('AmmoJSController').RemoveRigidBody(this.body_);
    }

    InitEntity() {
      const pos = this.Parent.Position;
      this.pos = pos
      const quat = this.Parent.Quaternion;
      this.quat = quat

      // add all meshes
      this.body_ = this.FindEntity('physics').GetComponent('AmmoJSController').CreateCompound(
        this.params_.poss, this.params_.quats, this.params_.sizes, {name: this.Parent.Name});
         
      for(let index in this.params_.poss){
        let pos = this.params_.poss[index]
        let quat = this.params_.quats[index]
        let size = this.params_.sizes[index]
        if(globalThis.debugging){
          const geometry = new BoxGeometry(1, 1);
          const material = new MeshBasicMaterial( {color: 0x00ff00} );
          this.debug_ = new Mesh(geometry, material);
          this.debug_.scale.copy(size);
          this.debug_.quaternion.copy(quat);
          this.debug_.position.copy(pos);
  
          globalThis.scene.add(this.debug_)
        }

      }
      this.Broadcast({topic: 'physics.loaded'});
    }

    InitComponent() {
      this.RegisterHandler_('physics.collision', (m) => { this.OnCollision_(m); });
    }

    OnCollision_() {
    }

    OnPosition_(m) {
      this.OnTransformChanged_();
    }

    OnRotation_(m) {
      this.OnTransformChanged_();
    }

    OnTransformChanged_() {
      
      // this.debug_.position.copy(origin);
      // this.debug_.quaternion.copy(quat);
    }

    Update(_) {
    }
  };

  class ArrowRigidBodySystem extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Destroy() {
      this.FindEntity('physics').GetComponent('AmmoJSController').RemoveRigidBody(this.body_);
    }

    InitEntity() {

      this.Broadcast({topic: 'physics.loaded'});
      this.arrows = {}
      if(globalThis.debugging){
        this.debug_arrows_ = {}
      }
    }

    InitArrow(id, params){
      // eventually have a lifetime system

      let body_ = this.FindEntity('physics').GetComponent('AmmoJSController').CreateArrow(
        params.pos, params.quat, params.size, {name: id},  params.initialVelocity)
      if(globalThis.debugging){
        const geometry = new CylinderGeometry( 0.01, 0.01, 0.1, 12);
        const material = new MeshBasicMaterial( {color: 0xff0000} );
        let debug_arrow = new Mesh(geometry, material);
        debug_arrow.position.copy(params.pos)
        debug_arrow.quaternion.copy(params.quat)
        this.debug_arrows_[id] = debug_arrow
        globalThis.scene.add(debug_arrow)
      }
      
      this.arrows[id] = body_
    }

    InitComponent() {
      this.RegisterHandler_('physics.collision', (m) => { this.OnCollision_(m); });
    }

    OnCollision_() {
      // cause and effect?
    }

    OnPosition_(m) {
      this.OnTransformChanged_();
    }

    OnRotation_(m) {
      this.OnTransformChanged_();
    }

    OnTransformChanged_() {
      
      // this.debug_.position.copy(origin);
      // this.debug_.quaternion.copy(quat);
    }

    Update(_) {
    }
  };

  return {
    BasicRigidBody: BasicRigidBody,
    CompoundRigidBody: CompoundRigidBody,
    ArrowRigidBodySystem: ArrowRigidBodySystem,
    FloorRigidBody: FloorRigidBody
  };
})();