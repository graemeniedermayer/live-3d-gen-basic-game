import {Vector3, Quaternion} from 'three'
import {entity} from '../game/entity.js';

// put in a webworker?

export const ammojs_component = (() => {

  class AmmoJSRigidBody {
    constructor() {
    }

    Destroy() {
      Ammo.destroy(this.body_);
      Ammo.destroy(this.info_);
      Ammo.destroy(this.shape_);
      Ammo.destroy(this.inertia_);
      Ammo.destroy(this.motionState_);
      Ammo.destroy(this.transform_);
      Ammo.destroy(this.userData_);

      if (this.mesh_) {
        Ammo.destroy(this.mesh_);
      }
    }

    InitSphere(pos, quat, size, userData, mass=.5) {
      this.transform_ = new Ammo.btTransform();
      this.transform_.setIdentity();
      this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      this.transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
      this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);

      let btSize = size;
      this.shape_ = new Ammo.btCapsuleShape(btSize, 0.2);
      this.shape_.setMargin(0.01);

      this.inertia_ = new Ammo.btVector3(0, 0, 0);
      this.shape_.calculateLocalInertia(mass, this.inertia_);

      this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this.shape_, this.inertia_);
      this.body_ = new Ammo.btRigidBody(this.info_);
      
      this.userData_ = new Ammo.btVector3(0, 0, 0);
      this.userData_.userData = userData;
      this.body_.setUserPointer(this.userData_);
    }

    InitArrow(pos, quat, size, userData, initialVelocity, mass=.01) {
      console.log(userData)
      this.transform_ = new Ammo.btTransform();
      this.transform_.setIdentity();
      this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      this.transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
      this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);

      let btSize = size;
      this.shape_ = new Ammo.btCapsuleShape(0.01, 0.1);
      this.shape_.setMargin(0.01);

      this.inertia_ = new Ammo.btVector3(0, 0, 0);
      this.shape_.calculateLocalInertia(mass, this.inertia_);

      this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this.shape_, this.inertia_);
      this.body_ = new Ammo.btRigidBody(this.info_);
      this.body_.setLinearVelocity(new Ammo.btVector3(initialVelocity.x, initialVelocity.y, initialVelocity.z))
      this.body_.setGravity( new Ammo.btVector3(0, -3.0, 0))
      this.body_.applyGravity()
      this.userData_ = new Ammo.btVector3(0, 0, 0);
      this.userData_.userData = {name:'arrow'};
      this.body_.setUserPointer(this.userData_);
    }

    InitBox(pos, quat, size, userData) {
      // used for floor if mass changes from zero the rest should be altered.
      this.transform_ = new Ammo.btTransform();
      this.transform_.setIdentity();
      this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      this.transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
      this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);

      let btSize = new Ammo.btVector3(size.x, size.y, size.z);
      this.shape_ = new Ammo.btBoxShape(btSize);
      this.shape_.setMargin(0.05);

      this.inertia_ = new Ammo.btVector3(0, 0, 0);
      this.shape_.calculateLocalInertia(0, this.inertia_);

      this.info_ = new Ammo.btRigidBodyConstructionInfo(10, this.motionState_, this.shape_, this.inertia_);
      this.body_ = new Ammo.btRigidBody(this.info_);

      this.userData_ = new Ammo.btVector3(0, 0, 0);
      this.userData_.userData = userData;
      this.body_.setUserPointer(this.userData_);

      Ammo.destroy(btSize);
    }

    InitMesh(src, pos, quat, userData) {
      const A0 = new Ammo.btVector3(0, 0, 0);
      const A1 = new Ammo.btVector3(0, 0, 0);
      const A2 = new Ammo.btVector3(0, 0, 0);

      const V0 = new Vector3();
      const V1 = new Vector3();
      const V2 = new Vector3();

      this.mesh_ = new Ammo.btTriangleMesh(true, true);

      src.traverse(c => {
        c.updateMatrixWorld(true);
        if (c.geometry) {
          const p = c.geometry.attributes.position.array;
          for (let i = 0; i < c.geometry.index.count; i+=3) {
            const i0 = c.geometry.index.array[i] * 3;
            const i1 = c.geometry.index.array[i+1] * 3;
            const i2 = c.geometry.index.array[i+2] * 3;

            V0.fromArray(p, i0).applyMatrix4(c.matrixWorld);
            V1.fromArray(p, i1).applyMatrix4(c.matrixWorld);
            V2.fromArray(p, i2).applyMatrix4(c.matrixWorld);

            A0.setX(V0.x);
            A0.setY(V0.y);
            A0.setZ(V0.z);
            A1.setX(V1.x);
            A1.setY(V1.y);
            A1.setZ(V1.z);
            A2.setX(V2.x);
            A2.setY(V2.y);
            A2.setZ(V2.z);
            this.mesh_.addTriangle(A0, A1, A2, false);
          }
        }
      });

      this.inertia_ = new Ammo.btVector3(0, 0, 0);
      this.shape_ = new Ammo.btBvhTriangleMeshShape(this.mesh_, true, true);
      this.shape_.setMargin(0.01);
      this.shape_.calculateLocalInertia(10, this.inertia_);

      this.transform_ = new Ammo.btTransform();
      this.transform_.setIdentity();
      this.transform_.getOrigin().setValue(pos.x, pos.y, pos.z);
      this.transform_.getRotation().setValue(quat.x, quat.y, quat.z, quat.w);
      this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);

      this.info_ = new Ammo.btRigidBodyConstructionInfo(10, this.motionState_, this.shape_, this.inertia_);
      this.body_ = new Ammo.btRigidBody(this.info_);

      this.userData_ = new Ammo.btVector3(0, 0, 0);
      this.userData_.userData = userData;
      this.body_.setUserPointer(this.userData_);

      Ammo.destroy(A0);
      Ammo.destroy(A1);
      Ammo.destroy(A2);
    }
    
    InitCompound(poss, quats, sizes, userData, mass=0) {
      this.shape_ = new Ammo.btCompoundShape(); 
      let transform_ = new Ammo.btTransform();
      this.transform_ = transform_ 
      for(let index in poss){
        let pos = poss[index]
        let quat = quats[index]
        let size = sizes[index]

        transform_.setIdentity();
        transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

        let btSize = new Ammo.btVector3(size.x, size.y, size.z);
        let shape_ = new Ammo.btBoxShape(btSize);
        shape_.setMargin(0.01);
        this.shape_.addChildShape(transform_, shape_)
        Ammo.destroy(btSize);
      }
      // should calculatePrincipalAxis is less.
      this.transform_.setIdentity();
      this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);
      this.inertia_ = new Ammo.btVector3(0, 0, 0);
      this.shape_.calculateLocalInertia(mass, this.inertia_);

      this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this.shape_, this.inertia_);
      this.body_ = new Ammo.btRigidBody(this.info_);

      this.userData_ = new Ammo.btVector3(0, 0, 0);
      this.userData_.userData = userData;
      this.body_.setUserPointer(this.userData_);

    }
  }

  class AmmoJSController extends entity.Component {
    constructor() {
      super();
    }

    Destroy() {
      Ammo.Destroy(this.physicsWorld_);
      Ammo.Destroy(this.solver_);
      Ammo.Destroy(this.broadphase_);
      Ammo.Destroy(this.dispatcher_);
      Ammo.Destroy(this.collisionConfiguration_);
    }

    InitEntity() {
      this.items_ = {}
      this.terrain_ = {}
      this.projectiles_ = {}
      this.collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
      this.dispatcher_ = new Ammo.btCollisionDispatcher(this.collisionConfiguration_);
      this.broadphase_ = new Ammo.btDbvtBroadphase();
      this.solver_ = new Ammo.btSequentialImpulseConstraintSolver();
      this.physicsWorld_ = new Ammo.btDiscreteDynamicsWorld(
          this.dispatcher_, this.broadphase_, this.solver_, this.collisionConfiguration_);
      this.physicsWorld_.setGravity(new Ammo.btVector3(0, -3.0, 0));
      this.tmpRayOrigin_ = new Ammo.btVector3();
      this.tmpRayDst_ = new Ammo.btVector3();
      this.rayCallback_ = new Ammo.ClosestRayResultCallback(this.tmpRayOrigin_, this.tmpRayDst_);
    
    // hardcode floor? this definitely needs to be replaced
      let transform = new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(new Ammo.btVector3(0, globalThis.floorHeight-0.005, 0));
      transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
      let motionState = new Ammo.btDefaultMotionState(transform);

      let size = new Ammo.btVector3(4, 0.01, 4);
      let shape = new Ammo.btBoxShape(size);
      shape.setMargin(0.01);

      let mass = 0.0
      let inertia = new Ammo.btVector3(0, 0, 0);
      let info = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, inertia);
      let body = new Ammo.btRigidBody(info);
      let userData = new Ammo.btVector3(0, 0, 0);
      userData.userData = {name:'floor'};
      body.setUserPointer(userData);
      this.physicsWorld_.addRigidBody( body );
    
    }

    RayTest(start, end) {
      const rayCallback = Ammo.castObject(this.rayCallback_, Ammo.RayResultCallback);
      rayCallback.set_m_closestHitFraction(1);
      rayCallback.set_m_collisionObject(null);

      this.tmpRayOrigin_.setValue(start.x, start.y, start.z);
      this.tmpRayDst_.setValue(end.x, end.y, end.z);
      this.rayCallback_.get_m_rayFromWorld().setValue(start.x, start.y, start.z);
      this.rayCallback_.get_m_rayToWorld().setValue(end.x, end.y, end.z);

      this.physicsWorld_.rayTest(this.tmpRayOrigin_, this.tmpRayDst_, this.rayCallback_);

      const hits = [];
      if (this.rayCallback_.hasHit()) {
        const obj = this.rayCallback_.m_collisionObject;
        const ud0 = Ammo.castObject(obj.getUserPointer(), Ammo.btVector3).userData;

        const point = this.rayCallback_.get_m_hitPointWorld();

        hits.push({
          name: ud0.name,
          position: new Vector3(point.x(), point.y(), point.z())
        });
      }
      return hits;
    }

    RemoveRigidBody(body) {
      this.physicsWorld_.removeRigidBody(body.body_);

      // remove from lists
    // this.userData_.userData
      if(this.items_[body.body_.userData_.userData.name]){
        delete this.items_[body.body_.userData_.userData.name];
        body.Destroy();
      }
    }

    CreateBox(pos, quat, size, userData) {
      const box = new AmmoJSRigidBody();

      box.InitBox(pos, quat, size, userData);

      this.physicsWorld_.addRigidBody(box.body_);

      return box;
    }

    CreateSphere(pos, quat, size, userData) {
      const box = new AmmoJSRigidBody();

      box.InitSphere(pos, quat, size, userData);

      this.physicsWorld_.addRigidBody(box.body_);
      box.body_.activate()
      this.items_[userData.name] = box.body_

      // box.body_.setActivationState(4);
      // box.body_.setCollisionFlags(2);
      return box;
    }

    CreatePlane(pos, quat, size, userData) {
      const box = new AmmoJSRigidBody();

      box.InitBox(pos, quat, size, userData);

      this.physicsWorld_.addRigidBody(box.body_);

      return box;
    }

    CreateCompound(pos, quat, size, userData) {
      const box = new AmmoJSRigidBody();
      box.InitCompound(pos, quat, size, userData);

      this.physicsWorld_.addRigidBody(box.body_);
      box.body_.activate()
      this.terrain_[userData.name] = box.body_

      return box;
    }

    CreateArrow(pos, quat, size, userData, initialVelocity) {
      // eventually need to give lifetime
      const box = new AmmoJSRigidBody();
      // box.setGravity(new Ammo.btVector3(0, -0.1, 0));
      box.InitArrow(pos, quat, size, userData, initialVelocity);

      this.physicsWorld_.addRigidBody(box.body_);
      box.body_.activate()
      this.projectiles_[userData.name] = box.body_

      return box;
    }

    CreateMesh(src, pos, quat, userData) {
      const mesh = new AmmoJSRigidBody();

      mesh.InitMesh(src, pos, quat, userData);

      this.physicsWorld_.addRigidBody(mesh.body_);

      return mesh;
    }

    StepSimulation(timeElapsedS) {
      this.physicsWorld_.stepSimulation(timeElapsedS, 10);

      const dispatcher = this.physicsWorld_.getDispatcher();
      const numManifolds = this.dispatcher_.getNumManifolds();
    
      const collisions = {};

      for (let i=0; i < numManifolds; i++) {
        const contactManifold = dispatcher.getManifoldByIndexInternal(i);
        const numContacts = contactManifold.getNumContacts();

        if (numContacts > 0) {
          const rb0 = contactManifold.getBody0();
          const rb1 = contactManifold.getBody1();
          const ud0 = Ammo.castObject(rb0.getUserPointer(), Ammo.btVector3).userData;
          const ud1 = Ammo.castObject(rb1.getUserPointer(), Ammo.btVector3).userData;
          
          // userData for types of collisions

          // do we need all collisions?
          // if (!(ud0.name in collisions)) {
          //   collisions[ud0.name] = [];
          // }
          // collisions[ud0.name].push(ud1.name);

          // if (!(ud1.name in collisions)) {
          //   collisions[ud1.name] = [];
          // }
          // collisions[ud1.name].push(ud0.name);

          // enemy damages
          if((ud1.name == 'arrow' && ud0.name == 'goblin')){
            console.log('arrGoblin')
          }
          if((ud0.name == 'player' && ud1.name == 'enemyWeapon')){
            if (!(ud0.name in collisions)) {
              collisions[ud0.name] = [];
            }
            collisions[ud0.name].push(ud1.name);
          }
          if((ud1.name == 'player' && ud0.name == 'enemyWeapon')){
            if (!(ud1.name in collisions)) {
              collisions[ud1.name] = [];
            }
            collisions[ud1.name].push(ud0.name);
          }

          // ally damages 
          // name in goblins
          if((ud1.name == 'arrow' && ud0.name == 'goblin')){
            if (!(ud0.name in collisions)) {
              collisions[ud0.name] = [];
            }
            collisions[ud0.name].push(ud1.name);
          }
          if((ud0.name == 'arrow' && ud1.name == 'goblin')){
            if (!(ud1.name in collisions)) {
              collisions[ud1.name] = [];
            }
            collisions[ud1.name].push(ud0.name);
          }
        }
        if(Object.keys(collisions).length){
          console.log(collisions)
        }
      }
      for (let k in collisions) {
        const e = this.FindEntity(k);
        // if(e)
        try{
          e.Broadcast({topic: 'player.hit', value: collisions[k]});
          e.Broadcast({topic: 'physics.collision', value: collisions[k]});
        }catch(e){

        }
      }
      
      // for (let k in this.terrain_) {
      //   const e = this.FindEntity(k);
      //   let tmpTransform = new Ammo.btTransform();
      //   this.terrain_[k].getMotionState().getWorldTransform(tmpTransform)
      //   let pos = tmpTransform.getOrigin()
      //   let quat = tmpTransform.getRotation()
      //   console.log(new THREE.Vector3(pos.x(), pos.y(), pos.z()) );
      //   console.log(new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w()) ); 
      // }
      // 
      // updateArrowPositions
      let player = this.FindEntity('player')
      let debug_arrows//bad style
      if(player){
        let arrows = player.GetComponent('ArrowController').arrows_
        if(globalThis.debugging == true){//bad style
          debug_arrows = player.GetComponent('ArrowRigidBodySystem').debug_arrows_
        }
        for(let k in this.projectiles_){
          const e = arrows[k];
          let tmpTransform = new Ammo.btTransform();
          this.projectiles_[k].getMotionState().getWorldTransform(tmpTransform)
          let pos = tmpTransform.getOrigin()
          let quat = tmpTransform.getRotation()
          e.position.copy(new Vector3(pos.x(), pos.y(), pos.z()) );
          e.quaternion.copy(new Quaternion(quat.x(), quat.y(), quat.z(), quat.w()) ); 

        if(globalThis.debugging == true){//bad style
          debug_arrows[k].position.copy(e.position)
          debug_arrows[k].quaternion.copy(e.quaternion)
        }
        }
      }
      for (let k in this.items_) {
        const e = this.FindEntity(k);
        let tmpTransform = new Ammo.btTransform();
        this.items_[k].getMotionState().getWorldTransform(tmpTransform)
        let pos = tmpTransform.getOrigin()
        let quat = tmpTransform.getRotation()
        e.SetPosition(new Vector3(pos.x(), pos.y(), pos.z()) );
        e.SetQuaternion(new Quaternion(quat.x(), quat.y(), quat.z(), quat.w()) ); 
      }
    }

    Update(_) {
    }
  }
  // convex hull

  return {
      AmmoJSController: AmmoJSController,
  };
})();