import {THREE} from '../core/three-defs.js';

export const particle_system = (() => {

  const _VS = `
  uniform float pointMultiplier;
  
  attribute float size;
  attribute float angle;
  attribute float blend;
  attribute vec4 colour;
  
  varying vec4 vColour;
  varying vec2 vAngle;
  varying float vBlend;
  
  void main() {
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = 0.1*size * pointMultiplier / (gl_Position.w*gl_Position.w);
  
    vAngle = vec2(cos(angle), sin(angle));
    vColour = colour;
    vBlend = blend;
  }`;
  
const _FS = `
  
  uniform sampler2D diffuseTexture;
  
  varying vec4 vColour;
  varying vec2 vAngle;
  varying float vBlend;
  
  void main() {
    vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
    float coordLength = length(gl_PointCoord - 0.5);
    float fallOff = 1.0 - 2.0*coordLength;
    gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
    gl_FragColor.xyz *= fallOff;
    gl_FragColor.w *= vBlend*fallOff;
  }`;

const _DIR_VS = `
#define PI 3.1415926538
uniform float pointMultiplier;
uniform vec3 camDirection;
uniform vec4 camQuat;

attribute float size;
attribute float angle;
attribute float blend;
attribute vec4 colour;
attribute vec3 direction;

varying vec4 vColour;
varying vec2 vAngle;
varying mat2 transform2d;
varying float vBlend;

float atan2(in float y, in float x) {
    bool s = (abs(x) > abs(y));
    return mix(PI/2.0 - atan(x,y), atan(y,x), s);
}

void main() {
  float directAngle = atan2(direction.y, direction.x);
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = 0.1*size * pointMultiplier / (gl_Position.w*gl_Position.w);

  vAngle = vec2(cos(2.0*angle-directAngle), sin(2.0*angle-directAngle));
  vColour = colour;
  vBlend = blend;
}`;
const _DIR_FS = `

uniform sampler2D diffuseTexture;

varying vec4 vColour;
varying vec2 vAngle;
varying float vBlend;
varying mat2 transform2d;

void main() {
  vec2 coords = ( ((gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x))  + 0.5);
  float coordLength = length(gl_PointCoord - 0.5);
  float fallOff = 1.0 - 2.0*coordLength;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
  gl_FragColor.xyz *= fallOff;
  gl_FragColor.w *= vBlend*fallOff;
}`;
  
   
  class LinearSpline {
    constructor(lerp) {
      this.points_ = [];
      this._lerp = lerp;
    }
  
    AddPoint(t, d) {
      this.points_.push([t, d]);
    }
  
    Get(t) {
      let p1 = 0;
  
      for (let i = 0; i < this.points_.length; i++) {
        if (this.points_[i][0] >= t) {
          break;
        }
        p1 = i;
      }
  
      const p2 = Math.min(this.points_.length - 1, p1 + 1);
  
      if (p1 == p2) {
        return this.points_[p1][1];
      }
  
      return this._lerp(
          (t - this.points_[p1][0]) / (
              this.points_[p2][0] - this.points_[p1][0]),
          this.points_[p1][1], this.points_[p2][1]);
    }
  }
  
  class ParticleEmitter {
    constructor() {
      this.alphaSpline_ = new LinearSpline((t, a, b) => {
        return a + t * (b - a);
      });
  
      this.colourSpline_ = new LinearSpline((t, a, b) => {
        const c = a.clone();
        return c.lerp(b, t);
      });
  
      this.sizeSpline_ = new LinearSpline((t, a, b) => {
        return a + t * (b - a);
      });

      this.emissionRate_ = 0.0;
      this.emissionAccumulator_ = 0.0;
      this.particles_ = [];
      this.emitterLife_ = null;
      this.delay_ = 0.0;
    }

    OnDestroy() {
    }

    UpdateParticles_(timeElapsed) {
      for (let p of this.particles_) {
        p.life -= timeElapsed;
      }
  
      this.particles_ = this.particles_.filter(p => {
        return p.life > 0.0;
      });
  
      for (let i = 0; i < this.particles_.length; ++i) {
        const p = this.particles_[i];
        const t = 1.0 - p.life / p.maxLife;

        if (t < 0 || t > 1) {
          let a =  0;
        }
  
        p.rotation += timeElapsed * 0.5;
        p.alpha = this.alphaSpline_.Get(t);
        p.currentSize = p.size * this.sizeSpline_.Get(t);
        p.colour.copy(this.colourSpline_.Get(t));
  
        p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));
        p.velocity.multiplyScalar(p.drag);
      }
    }
    
    CreateParticle_() {
      const life = (Math.random() * 0.75 + 0.25) * 5.0;
      return {
          position: new THREE.Vector3(
              (Math.random() * 2 - 1) * .04 + -.44,
              (Math.random() * 2 - 1) * .04 + 0,
              (Math.random() * 2 - 1) * .04 + .12),
          size: (Math.random() * 0.5 + 0.5) * .020,
          colour: new THREE.Color(),
          alpha: 1.0,
          life: life,
          maxLife: life,
          rotation: Math.random() * 2.0 * Math.PI,
          velocity: new THREE.Vector3(0, 0.01, 0),
          blend: 0.0,
          drag: 1.0,
      };
    }

    get IsAlive() {
      if (this.emitterLife_ === null) {
        return this.particles_.length > 0;
      } else {
        return this.emitterLife_ > 0.0 || this.particles_.length > 0;
      }
    }

    get IsEmitterAlive() {
      return (this.emitterLife_ === null || this.emitterLife_ > 0.0);
    }

    SetLife(life) {
      this.emitterLife_ = life;
    }

    SetEmissionRate(rate) {
      this.emissionRate_ = rate;
    }

    OnUpdate_(_) {
    }

    Update(timeElapsed) {
      if(this.delay_ > 0.0) {
        this.delay_ -= timeElapsed;
        return;
      }

      this.OnUpdate_(timeElapsed);

      if (this.emitterLife_ !== null) {
        this.emitterLife_ -= timeElapsed;
      }

      if (this.emissionRate_ > 0.0 && this.IsEmitterAlive) {
        this.emissionAccumulator_ += timeElapsed;
        const n = Math.floor(this.emissionAccumulator_ * this.emissionRate_);
        this.emissionAccumulator_ -= n / this.emissionRate_;
    
        for (let i = 0; i < n; i++) {
          const p = this.CreateParticle_();
          this.particles_.push(p);
        }
      }

      this.UpdateParticles_(timeElapsed);
    }
  };
  class DirectionalEmitter {
    constructor() {
      this.alphaSpline_ = new LinearSpline((t, a, b) => {
        return a + t * (b - a);
      });

      this.colourSpline_ = new LinearSpline((t, a, b) => {
        const c = a.clone();
        return c.lerp(b, t);
      });

      this.sizeSpline_ = new LinearSpline((t, a, b) => {
        return a + t * (b - a);
      });
      this.emissionRate_ = 0.0;
      this.emissionAccumulator_ = 0.0;
      this.particles_ = [];
      this.emitterLife_ = null;
      this.delay_ = 0.0;
      this.rotationSpeed = 0;
      this.lifeTime = 5.0;
      this.speed = 10.0
      this.count = 0.0;
    }
    OnDestroy() {
    }
    UpdateParticles_(timeElapsed) {
      for (let p of this.particles_) {
        p.life -= timeElapsed;
      }

      this.particles_ = this.particles_.filter(p => {
        return p.life > 0.0;
      });

      for (let i = 0; i < this.particles_.length; ++i) {
        const p = this.particles_[i];
        const t = 1.0 - p.life / p.maxLife;
        if (t < 0 || t > 1) {
          let a =  0;
        }

        p.rotation += timeElapsed * this.rotationSpeed;
        p.alpha = this.alphaSpline_.Get(t);
        p.currentSize = p.size * this.sizeSpline_.Get(t);
        p.colour.copy(this.colourSpline_.Get(t));

        p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));
        p.velocity.multiplyScalar(p.drag);
      }
    }

    AddParticles(num, p=zero) {
      for (let i = 0; i < num; ++i) {
        this.particles_.push(this.CreateParticle_(p));
      }
    }
    CreateParticle_(p=zero) {
      const life = (Math.random() * 0.75 + 0.25) * this.lifeTime;
      const speed = this.speed
      this.count+=1
      return {
          position:(new THREE.Vector3(0.5*Math.sin(this.count/20), 0.5*Math.cos(this.count/20), 0)),
          direction: (new THREE.Vector3(Math.cos(this.count/20), -Math.sin(this.count/20), 0)),
          size: (Math.random() * 0.5 + 0.5) * 2.0,
          colour: new THREE.Color(),
          alpha: 0.0,
          life: life,
          maxLife: life,
          rotation: 0,
          velocity: new THREE.Vector3(0, 0, 0),
          blend: 0.2,
          drag: 1.0,
      };
    }
    get IsAlive() {
      if (this.emitterLife_ === null) {
        return this.particles_.length > 0;
      } else {
        return this.emitterLife_ > 0.0 || this.particles_.length > 0;
      }
    }
    get IsEmitterAlive() {
      return (this.emitterLife_ === null || this.emitterLife_ > 0.0);
    }
    SetLife(life) {
      this.emitterLife_ = life;
    }
    SetEmissionRate(rate) {
      this.emissionRate_ = rate;
    }
    OnUpdate_(_) {
    }
    Update(timeElapsed) {
      if(this.delay_ > 0.0) {
        this.delay_ -= timeElapsed;
        return;
      }
      this.OnUpdate_(timeElapsed);
      if (this.emitterLife_ !== null) {
        this.emitterLife_ -= timeElapsed;
      }
      if (this.emissionRate_ > 0.0 && this.IsEmitterAlive) {
        this.emissionAccumulator_ += timeElapsed;
        const n = Math.floor(this.emissionAccumulator_ * this.emissionRate_);
        this.emissionAccumulator_ -= n / this.emissionRate_;
      
        for (let i = 0; i < n; i++) {
          const p = this.CreateParticle_(this.offset,this.particles_.length);
          this.particles_.push(p);
        }
      }
      this.UpdateParticles_(timeElapsed);
    }
  };

  class DirectionalSystem {
    constructor(params) {
      const uniforms = {
          diffuseTexture: {
              value: new THREE.TextureLoader().load(params.texture)
          },
          pointMultiplier: {
              value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
          },
          camDirection:{
              value: (new THREE.Vector3(0,0,-1)).applyQuaternion(camera.quaternion).toArray()
          },
          camQuat:{
              value: camera.quaternion.toArray()
          }
      };
  
      this.material_ = new THREE.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: _DIR_VS,
          fragmentShader: _DIR_FS,
          blending: THREE.CustomBlending,
          blendEquation: THREE.AddEquation,
          blendSrc: THREE.OneFactor,
          blendDst: THREE.OneMinusSrcAlphaFactor,
          depthTest: true,
          depthWrite: false,
          transparent: true,
          vertexColors: true
      });
  
      this.camera_ = params.camera;
      this.particles_ = [];
  
      this.geometry_ = new THREE.BufferGeometry();
      this.geometry_.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
      this.geometry_.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
      this.geometry_.setAttribute('colour', new THREE.Float32BufferAttribute([], 4));
      this.geometry_.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));
      this.geometry_.setAttribute('blend', new THREE.Float32BufferAttribute([], 1));
  
      this.points_ = new THREE.Points(this.geometry_, this.material_);
  
      params.parent.add(this.points_);
  
      this.emitters_ = [];
      this.particles_ = [];
  
      this.UpdateGeometry_();
    }
  
    Destroy() {
      this.material_.dispose();
      this.geometry_.dispose();
      if (this.points_.parent) {
        this.points_.parent.remove(this.points_);
      }
    }
  
    AddEmitter(e) {
      this.emitters_.push(e);
    }
    UpdateGeometry_() {
  
    let y = new THREE.Vector3(1,0,0).applyQuaternion(this.camera_.quaternion).y
    let upsideDown = new THREE.Vector3(0,1,0).applyQuaternion(this.camera_.quaternion).y>0 ? 1:-1
    let forwardsBack = new THREE.Vector3(0,0,1).applyQuaternion(this.camera_.quaternion).z>0 ? 1:0
      let tilt = forwardsBack*upsideDown*Math.asin(y)
      const positions = [];
      const sizes = [];
      const colours = [];
      const angles = [];
      const blends = [];
      const directions = [];
  
      const box = new THREE.Box3();
      for (let p of this.particles_) {
        // .inverse()
        let direction = p.direction.clone().applyQuaternion(this.camera_.quaternion)
        positions.push(p.position.x, p.position.y, p.position.z);
        directions.push(direction.x, direction.y, direction.z);
        colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
        sizes.push(p.currentSize);
        angles.push(tilt);
        blends.push(p.blend);
  
        box.expandByPoint(p.position);
      }
  
      this.geometry_.setAttribute(
          'direction', new THREE.Float32BufferAttribute(directions, 3));
      this.geometry_.setAttribute(
          'position', new THREE.Float32BufferAttribute(positions, 3));
      this.geometry_.setAttribute(
          'size', new THREE.Float32BufferAttribute(sizes, 1));
      this.geometry_.setAttribute(
          'colour', new THREE.Float32BufferAttribute(colours, 4));
      this.geometry_.setAttribute(
          'angle', new THREE.Float32BufferAttribute(angles, 1));
      this.geometry_.setAttribute(
          'blend', new THREE.Float32BufferAttribute(blends, 1));
      this.geometry_.attributes.position.needsUpdate = true;
      this.geometry_.attributes.size.needsUpdate = true;
      this.geometry_.attributes.colour.needsUpdate = true;
      this.geometry_.attributes.angle.needsUpdate = true;
      this.geometry_.attributes.blend.needsUpdate = true;
      this.geometry_.boundingBox = box;
      this.geometry_.boundingSphere = new THREE.Sphere();
  
      this.material_.uniforms.camDirection.value = (new THREE.Vector3(0,0,-1)).applyQuaternion(camera.quaternion).toArray()
      this.material_.uniforms.camQuat.value = camera.quaternion.toArray()
      box.getBoundingSphere(this.geometry_.boundingSphere);
    }
  
    UpdateParticles_(timeElapsed) {
      this.particles_ = this.emitters_.map(e => e.particles_);
      this.particles_ = this.particles_.flat();
      this.particles_.sort((a, b) => {
        const d1 = this.camera_.position.distanceTo(a.position);
        const d2 = this.camera_.position.distanceTo(b.position);
  
        if (d1 > d2) {
          return -1;
        }
  
        if (d1 < d2) {
          return 1;
        }
  
        return 0;
      });
    }
    UpdateEmitters_(timeElapsed) {
      for (let i = 0; i < this.emitters_.length; ++i) {
        this.emitters_[i].Update(timeElapsed);
      }
      const dead = this.emitters_.filter(e => !e.IsAlive);
      for (let d of dead) {
        d.OnDestroy();
      }
      this.emitters_= this.emitters_.filter(e => e.IsAlive);
    }
  
    Update(timeElapsed) {
      this.UpdateEmitters_(timeElapsed);
      this.UpdateParticles_(timeElapsed);
      this.UpdateGeometry_();
    }
  }
  
  class ParticleSystem {
    constructor(params) {
      const uniforms = {
          diffuseTexture: {
              value: new THREE.TextureLoader().load(params.texture)
          },
          pointMultiplier: {
              value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
          }
      };
  
      this.material_ = new THREE.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: _VS,
          fragmentShader: _FS,
          blending: THREE.CustomBlending,
          blendEquation: THREE.AddEquation,
          blendSrc: THREE.OneFactor,
          blendDst: THREE.OneMinusSrcAlphaFactor,
          depthTest: true,
          depthWrite: false,
          transparent: true,
          vertexColors: true
      });
  
      this.camera_ = params.camera;
      this.particles_ = [];
  
      this.geometry_ = new THREE.BufferGeometry();
      this.geometry_.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
      this.geometry_.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
      this.geometry_.setAttribute('colour', new THREE.Float32BufferAttribute([], 4));
      this.geometry_.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));
      this.geometry_.setAttribute('blend', new THREE.Float32BufferAttribute([], 1));
  
      this.points_ = new THREE.Points(this.geometry_, this.material_);
  
      params.parent.add(this.points_);
  
      this.emitters_ = [];
      this.particles_ = [];
  
      this.UpdateGeometry_();
    }
  
    Destroy() {
      this.material_.dispose();
      this.geometry_.dispose();
      if (this.points_.parent) {
        this.points_.parent.remove(this.points_);
      }
    }
  

    AddEmitter(e) {
      this.emitters_.push(e);
    }

    UpdateGeometry_() {
      const positions = [];
      const sizes = [];
      const colours = [];
      const angles = [];
      const blends = [];
  
      const box = new THREE.Box3();
      for (let p of this.particles_) {
        positions.push(p.position.x, p.position.y, p.position.z);
        colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
        sizes.push(p.currentSize);
        angles.push(p.rotation);
        blends.push(p.blend);
  
        box.expandByPoint(p.position);
      }
  
      this.geometry_.setAttribute(
          'position', new THREE.Float32BufferAttribute(positions, 3));
      this.geometry_.setAttribute(
          'size', new THREE.Float32BufferAttribute(sizes, 1));
      this.geometry_.setAttribute(
          'colour', new THREE.Float32BufferAttribute(colours, 4));
      this.geometry_.setAttribute(
          'angle', new THREE.Float32BufferAttribute(angles, 1));
      this.geometry_.setAttribute(
          'blend', new THREE.Float32BufferAttribute(blends, 1));
    
      this.geometry_.attributes.position.needsUpdate = true;
      this.geometry_.attributes.size.needsUpdate = true;
      this.geometry_.attributes.colour.needsUpdate = true;
      this.geometry_.attributes.angle.needsUpdate = true;
      this.geometry_.attributes.blend.needsUpdate = true;
      this.geometry_.boundingBox = box;
      this.geometry_.boundingSphere = new THREE.Sphere();
  
      box.getBoundingSphere(this.geometry_.boundingSphere);
    }
  
    UpdateParticles_(timeElapsed) {
      this.particles_ = this.emitters_.map(e => e.particles_);
      this.particles_ = this.particles_.flat();
      this.particles_.sort((a, b) => {
        const d1 = this.camera_.position.distanceTo(a.position);
        const d2 = this.camera_.position.distanceTo(b.position);
  
        if (d1 > d2) {
          return -1;
        }
  
        if (d1 < d2) {
          return 1;
        }
  
        return 0;
      });
    }

    UpdateEmitters_(timeElapsed) {
      for (let i = 0; i < this.emitters_.length; ++i) {
        this.emitters_[i].Update(timeElapsed);
      }

      const dead = this.emitters_.filter(e => !e.IsAlive);
      for (let d of dead) {
        d.OnDestroy();
      }
      this.emitters_= this.emitters_.filter(e => e.IsAlive);
    }
  
    Update(timeElapsed) {
      this.UpdateEmitters_(timeElapsed);
      this.UpdateParticles_(timeElapsed);
      this.UpdateGeometry_();
    }
  };

  return {
      ParticleEmitter: ParticleEmitter,
      ParticleSystem: ParticleSystem,
      DirectionalEmitter: DirectionalEmitter,
      DirectionalSystem: DirectionalSystem,
  };
})();