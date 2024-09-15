// const 2200 = 2200;
// const LoopRepeat = 2201;
// const LoopPingPong = 2202;


// Soo I've started strongly coupling playercontroller and state is that okay?
// playerinput and playercontrollers need to be separate.
export const player_spear_state = (() => {
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
  
    class Spear_AttackIdleState extends State {
      constructor(parent) {
        super(parent);
        this._action = null;
      }
    
      get Name() {
        return 'AA_Spear_Idle';
      }
    
      Enter(prevState) {
        this._action = this._parent._parent._animations['AA_Spear_Idle'];
        if(prevState){
          const prevAction = this._parent._parent._animations[prevState.Name];   
          // this._action = this._parent._parent._animations['Spear_TopIdle'];
          
          this._action.enabled = true;
  
          if(prevState.Name!='AA_Spear_Idle'){
            const ratio = this._action.getClip().duration / prevAction.getClip().duration;
            this._action.time = prevAction.time * ratio;
          } else {
            this._action.time = 0.0;
            this._action.setEffectiveWeight(1.0);
            this._action.setEffectiveTimeScale(1.0);
          }
          this._action.crossFadeFrom(prevAction, 0.3, true);
          this._action.play();
        } else {
          this._action.play();
        }
      }
    
      Exit() {
      }
    
      Update(_,input) {
        // questionable
        // combos here?
        if( input && input.button1){
          if( (parseInt(Math.random()*10)%2)==0){
            this._parent.SetState('Spear_Attack2');
          }else{
            this._parent.SetState('Spear_Attack1');
          }
          return
    
        }
      }
    };
  
    class Spear_Attack1State extends State {
      constructor(parent) {
        super(parent);
    
        this._counter = 0
        this._action = null;
      }
    
      get Name() {
        return 'Spear_Attack4';
      }
    
      Enter(prevState) {
        if(prevState){
          const prevAction = this._parent._parent._animations[prevState.Name];
          this._action = this._parent._parent._animations['Spear_Attack4'];
          
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
        if( this._action.time > 1.3 ){
          // unblocked firing?
          this._parent.SetState('Spear_AttackIdle');
        }
      }
    };
  
    class Spear_Attack2State extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Spear_Attack3';
      }
    
      Enter(prevState) {
        if(prevState){
          const prevAction = this._parent._parent._animations[prevState.Name];
          this._action = this._parent._parent._animations['Spear_Attack3'];
          
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
        if( this._action.time > 1.3 ){
          // unblocked firing?
          this._parent.SetState('Spear_AttackIdle');
        }
      }
    };

    class Spear_IdleState extends State {
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
          this._parent.SetState('Spear_Left');
          return;
        }
        if (input.c_right > 0) {
          this._parent.SetState('Spear_Right');
          return;
        }
        return;
      }
    };
    
    class Spear_LeftState extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Spear_Left';
      }
    
      Enter(prevState) {
        this._action_l = this._parent._parent._animations['Spear_Left_R'];
        this._action_r = this._parent._parent._animations['Spear_Left_L'];
        this._action = this._action_l
        if (prevState) {
          const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
    
          this._action_l.enabled = true;
          this._action_r.enabled = true;
    
          if (prevState?.Name !== 'Spear_Left' ) {
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
          this._parent.SetState('Spear_Idle');
        }
        return;
      }
    };

    class Spear_RightState extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Spear_Right';
      }
    
      Enter(prevState) {
        this._action_l = this._parent._parent._animations['Spear_Right_R'];
        this._action_r = this._parent._parent._animations['Spear_Right_L'];
        this._action = this._action_l
        if (prevState) {
          const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
    
          this._action_l.enabled = true;
          this._action_r.enabled = true;
    
          if (prevState?.Name !== 'Spear_Right' ) {
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
          this._parent.SetState('Spear_Idle');
        }
        return;
      }
    };
  
  
    // Forwards Backwards State
    class Spear_EmptyState extends State{
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
  
        if (input.c_forward > 0) {
          this._parent.SetState('Spear_Forwards');
          return;
        }
        if (input.c_forward < 0) {
          this._parent.SetState('Spear_Backwards');
          return;
        }
      }
    }
    class Spear_ForwardState extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Spear_Forwards';
      }
    
      Enter(prevState) {
        this._action_l = this._parent._parent._animations['Spear_Forwards_R'];
        this._action_r = this._parent._parent._animations['Spear_Forwards_L'];
        this._action = this._action_l
        if (prevState) {
          const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
    
          this._action_l.enabled = true;
          this._action_r.enabled = true;
    
          if (prevState?.Name !== 'Spear_Forwards' ) {
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
          this._parent.SetState('Spear_Empty');
        }
        return;
      }
    };
    class Spear_BackwardState extends State {
      constructor(parent) {
        super(parent);
    
        this._action = null;
      }
    
      get Name() {
        return 'Spear_Backwards';
      }
    
      Enter(prevState) {
        this._action_l = this._parent._parent._animations['Spear_Backwards_R'];
        this._action_r = this._parent._parent._animations['Spear_Backwards_L'];
        this._action = this._action_l
        if (prevState) {
          const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
    
          this._action_l.enabled = true;
          this._action_r.enabled = true;
    
          if (prevState?.Name !== 'Spear_Backwards' ) {
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
          this._parent.SetState('Spear_Empty');
        }
        return;
      }
    };
    
  
    return {
      Spear_IdleState:Spear_IdleState,
      Spear_RightState: Spear_RightState,
      Spear_LeftState:  Spear_LeftState,
  
      Spear_EmptyState:Spear_EmptyState,
      Spear_ForwardState: Spear_ForwardState,
      Spear_BackwardState:Spear_BackwardState,
    
      Spear_Attack1State: Spear_Attack1State,
      Spear_Attack2State: Spear_Attack2State,
      Spear_AttackIdleState: Spear_AttackIdleState,
    
      DeathState: DeathState
    };
  })();