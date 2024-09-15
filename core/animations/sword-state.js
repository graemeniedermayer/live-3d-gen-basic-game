// const 2200 = 2200;
// const LoopRepeat = 2201;
// const LoopPingPong = 2202;


// Soo I've started strongly coupling playercontroller and state is that okay?
// playerinput and playercontrollers need to be separate.
export const player_sword_state = (() => {
  // ._parent._parent is code smell.
    class State {
      constructor(parent) {
        this._parent = parent;
      }
    
      Enter() {}
      Exit() {}
      Update() {}
    };
  
    class DeathState extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'death0';
      }
    
      Enter(prevState) {
        // random number between 0-5 (eventually do math to decide?)
        let deathNum = 0
        this._action = this._parent._parent._animations[`death${deathNum}`];
        this._action.loop = 2200;
        if (prevState) {
          const prevAction = this._parent._parent._animations[prevState.Name];
  
          this._action.enabled = true;
    
          
          this._action.time = 0.0;
          this._action.setEffectiveTimeScale(1.0);
          this._action.setEffectiveWeight(1.0);
          
  
          this._action.crossFadeFrom(prevAction, 0.1, true);
          this._action.play();
        } else {
          this._action.play();
        }
        
      }
    
      Exit() {
      }
    
      Update(_) {
      }
    };
  
    class Sword_AttackIdleState extends State {
      constructor(parent) {
        super(parent);
        this._action = null;
      }
    
      get Name() {
        return 'Sword_Idle';
      }
    
      Enter(prevState) {
        this._action = this._parent._parent._animations['Sword_Idle'];
        if(prevState){
          const prevAction = this._parent._parent._animations[prevState.Name];   
          // this._action = this._parent._parent._animations['Sword_TopIdle'];
          
          this._action.enabled = true;
  
          if(prevState.Name!='Sword_Idle'){
            const ratio = this._action.getClip().duration / prevAction.getClip().duration;
            this._action.time = prevAction.time * ratio;
          } else {
            this._action.time = 0.0;
            this._action.setEffectiveWeight(1.0);
            this._action.setEffectiveTimeScale(1.0);
            // this._action.setEffectiveWeight(1.0);
          }
          this._action.setEffectiveWeight(1.0);
          this._action.crossFadeFrom(prevAction, 0.3, true);
          this._action.play();
        } else {
          this._action.setEffectiveWeight(1.0);
          this._action.play();
        }
        
      }
    
      Exit() {
      }
    
      Update(_,input) {
        // questionable
        // combos here?
        if( input && input.button1){
          if((parseInt(Math.random()*10)%2)==0){
            this._parent.SetState('Sword_Attack2');
          }else{
            this._parent.SetState('Sword_Attack1');
          }
          return
          
        }
      }
    };
  
    class Sword_Attack1State extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Sword_Attack1';
      }
    
      Enter(prevState) {
        if(prevState){
          const prevAction = this._parent._parent._animations[prevState.Name];
          this._action = this._parent._parent._animations['Sword_Attack1'];
          
          this._action.time =0
          this._action.enabled = true;
          this._action.loop = 2200;
          this._action.crossFadeFrom(prevAction, 0.3, true);
          // this._action.fadeIn(0.3)
          this._action.setEffectiveWeight(8.0);
          this._action.play();
        }
      }
    
      Exit() {
      }
    
      Update(_) {
        // if(this._action.time > 0.2){
        //   this._parent._parent.arrows[0].visible = true
        // }
        if( this._action.time > 1.2 ){
          // unblocked firing?
          this._parent.SetState('Sword_AttackIdle');
        }
      }
    };
  
    class Sword_Attack2State extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Sword_Attack2';
      }
    
      Enter(prevState) {
        if(prevState){
          const prevAction = this._parent._parent._animations[prevState.Name];
          this._action = this._parent._parent._animations['Sword_Attack2'];
          
          this._action.time =0
          this._action.enabled = true;
          this._action.loop = 2200;
          this._action.crossFadeFrom(prevAction, 0.3, true);
          // this._action.fadeIn(0.3)
          this._action.setEffectiveWeight(8.0);
          this._action.play();
        }
      }
    
      Exit() {
      }
    
      Update(_) {
        // if(this._action.time > 0.2){
        //   this._parent._parent.arrows[0].visible = true
        // }
        if( this._action.time > 1.2 ){
          // unblocked firing?
          this._parent.SetState('Sword_AttackIdle');
        }
      }
    };

    class Sword_IdleState extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Idle_Legs';
      }
    
      Enter(prevState) {
        this._action_l = this._parent._parent._animations['Idle_Legs_R'];
        this._action_r = this._parent._parent._animations['Idle_Legs_L'];
        this._action = this._action_l
        if (prevState) {
          const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
    
          this._action_l.enabled = true;
          this._action_r.enabled = true;
    
          if (prevState?.Name !== 'Idle_Legs' ) {
            const ratio = this._action_l.getClip().duration / prevAction.getClip().duration;
            this._action_l.time = prevAction.time * ratio;
            this._action_r.time = prevAction.time * ratio;
          } else {
            this._action_l.time = 0.0;
            this._action_r.time = 0.0;
            this._action_l.setEffectiveTimeScale(1.0);
            this._action_r.setEffectiveTimeScale(1.0);
            // this._action.setEffectiveWeight(0.0);
          }
  
          this._action_l.crossFadeFrom(prevAction, 0.1, true);
          this._action_r.crossFadeFrom(prevAction, 0.1, true);
          this._action_l.play();
          this._action_r.play();
        } else {
          this._action_l.play();
          this._action_r.play();
        }
      }
    
      Exit() {
      }
    
      Update(_, input) {
    
        if (!input) {
          return;
        }
        // if(input.c_right!==0 && input.c_forward!==0){
        //   this._action.setEffectiveWeight(1.0);
        // }else{
        //   this._action.setEffectiveWeight(0.0);
        // }
    // aome concept of momentum?
        if (input.c_right < 0) {
          this._parent.SetState('Sword_Left');
          return;
        }
        if (input.c_right > 0) {
          this._parent.SetState('Sword_Right');
          return;
        }
        return;
      }
    };
    
    class Sword_LeftState extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Sword_Left';
      }
    
      Enter(prevState) {
        this._action_l = this._parent._parent._animations['Sword_Left_R'];
        this._action_r = this._parent._parent._animations['Sword_Left_L'];
        this._action = this._action_l
        if (prevState) {
          const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
    
          this._action_l.enabled = true;
          this._action_r.enabled = true;
    
          if (prevState?.Name !== 'Sword_Left' ) {
            const ratio = this._action_l.getClip().duration / prevAction.getClip().duration;
            this._action_l.time = prevAction.time * ratio;
            this._action_r.time = prevAction.time * ratio;
          } else {
            this._action_l.time = 0.0;
            this._action_r.time = 0.0;
            this._action_l.setEffectiveTimeScale(1.0);
            this._action_r.setEffectiveTimeScale(1.0);
            // this._action.setEffectiveWeight(0.0);
          }
  
          this._action_l.crossFadeFrom(prevAction, 0.1, true);
          this._action_r.crossFadeFrom(prevAction, 0.1, true);
          this._action_l.play();
          this._action_r.play();
        } else {
          this._action_l.play();
          this._action_r.play();
        }
      }
    
      Exit() {
        this._action_l.stop();
        this._action_r.stop();
      }
    
      Update(_, input) {
        if (!input) {
          return;
        }
        if (input.c_right < 0) {
          this._action_l.setEffectiveWeight( Math.min(1,-input.c_right));
          this._action_r.setEffectiveWeight( Math.min(1,-input.c_right));
          return;
        }
        if (input.c_right==0) {
          this._parent.SetState('Sword_Idle');
        }
        return;
      }
    };
    
    class Sword_RightState extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Sword_Right';
      }
    
      Enter(prevState) {
        this._action_l = this._parent._parent._animations['Sword_Right_R'];
        this._action_r = this._parent._parent._animations['Sword_Right_L'];
        this._action = this._action_l
        if (prevState) {
          const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
    
          this._action_l.enabled = true;
          this._action_r.enabled = true;
    
          if (prevState?.Name !== 'Sword_Right' ) {
            const ratio = this._action_l.getClip().duration / prevAction.getClip().duration;
            this._action_l.time = prevAction.time * ratio;
            this._action_r.time = prevAction.time * ratio;
          } else {
            this._action_l.time = 0.0;
            this._action_r.time = 0.0;
            this._action_l.setEffectiveTimeScale(1.0);
            this._action_r.setEffectiveTimeScale(1.0);
            // this._action.setEffectiveWeight(0.0);
          }
  
          this._action_l.crossFadeFrom(prevAction, 0.1, true);
          this._action_r.crossFadeFrom(prevAction, 0.1, true);
          this._action_l.play();
          this._action_r.play();
        } else {
          this._action_l.play();
          this._action_r.play();
        }
      }
    
      Exit() {
        this._action_l.stop();
        this._action_r.stop();
      }
    
      Update(_, input) {
        if (!input) {
          return;
        }
        if (input.c_right > 0) {
          this._action_l.setEffectiveWeight( Math.min(1,input.c_right));
          this._action_r.setEffectiveWeight( Math.min(1,input.c_right));
          return;
        }
        if (input.c_right==0) {
          this._parent.SetState('Sword_Idle');
        }
        return;
      }
    
    };
  
  
    // Forwards Backwards State
    class Sword_EmptyState extends State{
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Idle_Legs';
      }
    
      Enter(prevState) {
        this._action_l = this._parent._parent._animations['Idle_Legs_R'];
        this._action_r = this._parent._parent._animations['Idle_Legs_L'];
        this._action = this._action_l
        if (prevState) {
          const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
    
          this._action_l.enabled = true;
          this._action_r.enabled = true;
    
          if (prevState?.Name !== 'Idle_Legs' ) {
            const ratio = this._action_l.getClip().duration / prevAction.getClip().duration;
            this._action_l.time = prevAction.time * ratio;
            this._action_r.time = prevAction.time * ratio;
          } else {
            this._action_l.time = 0.0;
            this._action_r.time = 0.0;
            this._action_l.setEffectiveTimeScale(1.0);
            this._action_r.setEffectiveTimeScale(1.0);
            // this._action.setEffectiveWeight(0.0);
          }
  
          this._action_l.crossFadeFrom(prevAction, 0.1, true);
          this._action_r.crossFadeFrom(prevAction, 0.1, true);
          this._action_l.play();
          this._action_r.play();
        } else {
          this._action_l.play();
          this._action_r.play();
        }
      }
    
      Exit() {
      }
  
      Update(_, input) {
    
        if (!input) {
          return;
        }
  
        if (input.c_forward > 0) {
          this._parent.SetState('Sword_Forwards');
          return;
        }
        if (input.c_forward < 0) {
          this._parent.SetState('Sword_Backwards');
          return;
        }
      }
    }
    class Sword_ForwardState extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Sword_Forwards';
      }
    
      Enter(prevState) {
        this._action_l = this._parent._parent._animations['Sword_Forwards_R'];
        this._action_r = this._parent._parent._animations['Sword_Forwards_L'];
        this._action = this._action_l
        if (prevState) {
          const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
    
          this._action_l.enabled = true;
          this._action_r.enabled = true;
    
          if (prevState?.Name !== 'Sword_Forwards' ) {
            const ratio = this._action_l.getClip().duration / prevAction.getClip().duration;
            this._action_l.time = prevAction.time * ratio;
            this._action_r.time = prevAction.time * ratio;
          } else {
            this._action_l.time = 0.0;
            this._action_r.time = 0.0;
            this._action_l.setEffectiveTimeScale(1.0);
            this._action_r.setEffectiveTimeScale(1.0);
            // this._action.setEffectiveWeight(0.0);
          }
  
          this._action_l.crossFadeFrom(prevAction, 0.1, true);
          this._action_r.crossFadeFrom(prevAction, 0.1, true);
          this._action_l.play();
          this._action_r.play();
        } else {
          this._action_l.play();
          this._action_r.play();
        }
      }
    
      Exit() {
        this._action_l.stop();
        this._action_r.stop();
      }
    
      Update(_, input) {
        if (!input) {
          return;
        }
        if (input.c_forward > 0) {
          this._action_l.setEffectiveWeight( Math.min(1, input.c_forward));
          this._action_r.setEffectiveWeight( Math.min(1, input.c_forward));
          return;
        }
        if (input.c_forward==0) {
          this._parent.SetState('Sword_Empty');
        }
        return;
      }
    };

    class Sword_BackwardState extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Sword_Backwards';
      }
    
      Enter(prevState) {
        this._action_l = this._parent._parent._animations['Sword_Backwards_R'];
        this._action_r = this._parent._parent._animations['Sword_Backwards_L'];
        this._action = this._action_l
        if (prevState) {
          const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
    
          this._action_l.enabled = true;
          this._action_r.enabled = true;
    
          if (prevState?.Name !== 'Sword_Backwards' ) {
            const ratio = this._action_l.getClip().duration / prevAction.getClip().duration;
            this._action_l.time = prevAction.time * ratio;
            this._action_r.time = prevAction.time * ratio;
          } else {
            this._action_l.time = 0.0;
            this._action_r.time = 0.0;
            this._action_l.setEffectiveTimeScale(1.0);
            this._action_r.setEffectiveTimeScale(1.0);
            // this._action.setEffectiveWeight(0.0);
          }
  
          this._action_l.crossFadeFrom(prevAction, 0.1, true);
          this._action_r.crossFadeFrom(prevAction, 0.1, true);
          this._action_l.play();
          this._action_r.play();
        } else {
          this._action_l.play();
          this._action_r.play();
        }
      }
    
      Exit() {
        this._action_l.stop();
        this._action_r.stop();
      }
    
      Update(_, input) {
        if (!input) {
          return;
        }
        if (input.c_forward < 0) {
          this._action_l.setEffectiveWeight( Math.min(-input.c_forward, 1));
          this._action_r.setEffectiveWeight( Math.min(-input.c_forward, 1));
          return;
        }
        if (input.c_forward==0) {
          this._parent.SetState('Sword_Empty');
        }
        return;
      }
    };
    
  
  
    return {
      Sword_IdleState:Sword_IdleState,
      Sword_RightState: Sword_RightState,
      Sword_LeftState:  Sword_LeftState,
  
      Sword_EmptyState:Sword_EmptyState,
      Sword_ForwardState: Sword_ForwardState,
      Sword_BackwardState:Sword_BackwardState,
    
      Sword_Attack1State: Sword_Attack1State,
      Sword_Attack2State: Sword_Attack2State,
      Sword_AttackIdleState: Sword_AttackIdleState,
    
    
      DeathState: DeathState
    };
  })();