// const 2200 = 2200;
// const LoopRepeat = 2201;
// const LoopPingPong = 2202;


// Soo I've started strongly coupling playercontroller and state is that okay?
// playerinput and playercontrollers need to be separate.
export const player_bow_state = (() => {
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
      // this._action.stop();
    }
  
    Update(_) {
    }
  };

  class DrawIdleState extends State {
    constructor(parent) {
      super(parent);
  
      this._action = null;
    }
  
    get Name() {
      return 'Bow_DrawIdle';
    }
  
    Enter(prevState) {
      this._action = this._parent._parent._animations['Bow_DrawIdle'];
      if(prevState){
        const prevAction = this._parent._parent._animations[prevState.Name];   
        // this._action = this._parent._parent._animations['Bow_TopIdle'];
        
        this._action.enabled = true;

        if(prevState.Name!='Bow_DrawIdle'){
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
      // this._action.stop();
    }
  
    Update(_,input) {
      // questionable

      if( input ){
        if( input.button1){
        // block action button
          this._parent.SetState('Bow_Recoil');
        }else if(input.c_forward){
          // this._action.fadeOut(1.0)
          // this._action.fade;
        }else if(input.c_right){
          // this._action.fadeOut(1.0)
        }
      }
    }
  };

  class DrawState extends State {
    constructor(parent) {
      super(parent);
  
      this._action = null;
    }
  
    get Name() {
      return 'Bow_Draw';
    }
  
    Enter(prevState) {
      if(prevState){
        const prevAction = this._parent._parent._animations[prevState.Name];
        this._action = this._parent._parent._animations['Bow_Draw'];
        
        this._action.enabled = true;
        this._action.loop = 2200;
        if(prevAction && prevAction.Name!='Bow_Draw'){
          this._action.crossFadeFrom(prevAction, 0.3, true);
          this._action.time =0
          // this._action.fadeOut(1.0)
          this._action.setEffectiveWeight(8.0);
          this._action.play();
        }
      }
    }
  
    Exit() {
    }
  
    Update(_) {
      // if(this._action.time > 0.2){
      //   this._parent._parent.arrows[0].visible = true
      // }
      // if( !this._action.isRunning() ){
      //   // unblocked firing?
      //   this._parent.SetState('Bow_DrawIdle');
      // }
      if( this._action.time > 0.8 ){
        // unblocked firing?
        this._parent.SetState('Bow_DrawIdle');
      }
    }
  };

  class RecoilState extends State {
    constructor(parent) {
      super(parent);
  
      this._action = null;
    }
  
    get Name() {
      return 'Bow_Recoil';
    }
  
    Enter(prevState) {
      if(prevState){
        this.fired = false // block any but first arrow
        const prevAction = this._parent._parent._animations[prevState.Name];
        
        this._action = this._parent._parent._animations['Bow_Recoil'];
        this._action.time =0
        this._action.enabled = true;
        this._action.loop = 2200;
        this._action.crossFadeFrom(prevAction, 0.3, true);
        // this._action.fadeIn(0.3)
        this._action.setEffectiveWeight(8.0);
        this._action.play();
        // hide arrow
        
      }
    }
  
    Exit() {
      // this._action.stop();
    }
  
    Update(_,input) {
      

      // if(this._action.time > 0.3){
      if(this._action.time > 0.6){
      // if(!this.fired && this._action.time > 0.3){
        this.fired = true
        // this._parent._parent.Broadcast({
        //     topic: 'player.fire'
        // });
        // this._parent._parent.arrows[0].visible = false
        this._parent.SetState('Bow_Draw');
      }
      // if( !this._action.isRunning() ){
      //   this._parent.SetState('Bow_Draw');
      // }
    }
  };

  class Bow_IdleState extends State {
    constructor(parent) {
      super(parent);
  
      this._action = null;
    }
  
    get Name() {
      return 'Idle_Legs';
    }
  
    Enter(prevState) {
      // this._action = this._parent._parent._animations['Bow_BottomIdle'];
      this._action_r = this._parent._parent._animations['Idle_Legs_R'];
      this._action_l = this._parent._parent._animations['Idle_Legs_L'];
      this._action = this._action_l
      if (prevState) {
        const prevAction = this._parent._parent._animations[prevState.Name+'_L'];
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
        this._parent.SetState('Bow_Left');
        return;
      }
      if (input.c_right > 0) {
        this._parent.SetState('Bow_Right');
        return;
      }
      return;
    }
  };
  
  class Bow_LeftState extends State {
    constructor(parent) {
      super(parent);
  
      this._action = null;
    }

    get Name() {
      return 'Bow_Forwards';
    }
  
    Enter(prevState) {
      this._action_l = this._parent._parent._animations['Bow_Forwards_R'];
      this._action_r = this._parent._parent._animations['Bow_Forwards_L'];
      this._action = this._action_l
      if (prevState) {
        const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
  
        this._action_l.enabled = true;
        this._action_r.enabled = true;
  
        if (prevState?.Name !== 'Bow_Forwards' ) {
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
        this._action_l.setEffectiveWeight( Math.min(-input.c_right,1));
        this._action_r.setEffectiveWeight( Math.min(-input.c_right,1));
        return;
      }
      if (input.c_right==0) {
        this._parent.SetState('Bow_Idle');
      }
      return;
    }
  };

  class Bow_RightState extends State {
    constructor(parent) {
      super(parent);
  
      this._action = null;
    }

    get Name() {
      return 'Bow_Backwards';
    }

    Enter(prevState) {
      this._action_l = this._parent._parent._animations['Bow_Backwards_R'];
      this._action_r = this._parent._parent._animations['Bow_Backwards_L'];
      this._action = this._action_l
      if (prevState) {
        const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
  
        this._action_l.enabled = true;
        this._action_r.enabled = true;
  
        if (prevState?.Name !== 'Bow_Backwards' ) {
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
        this._action_l.setEffectiveWeight( Math.min(input.c_right,1));
        this._action_r.setEffectiveWeight( Math.min(input.c_right,1));
        return;
      }
      if (input.c_right==0) {
        this._parent.SetState('Bow_Idle');
      }
      return;
    }
  };


  // Forwards Backwards State
  class Bow_EmptyState extends State{
    constructor(parent) {
      super(parent);
  
      this._action = null;
    }
  
    get Name() {
      return 'Idle_Legs';
    }
  
    Enter(prevState) {
      // this._action = this._parent._parent._animations['Bow_BottomIdle'];
      this._action_r = this._parent._parent._animations['Idle_Legs_R'];
      this._action_l = this._parent._parent._animations['Idle_Legs_L'];
      this._action = this._action_r
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
        this._parent.SetState('Bow_Forwards');
        return;
      }
      if (input.c_forward < 0) {
        this._parent.SetState('Bow_Backwards');
        return;
      }
    }
  }
  class Bow_ForwardState extends State {
    constructor(parent) {
      super(parent);
  
      this._action = null;
    }
  
    get Name() {
      return 'Bow_Right';
    }
  
    Enter(prevState) {
      this._action_l = this._parent._parent._animations['Bow_Right_R'];
      this._action_r = this._parent._parent._animations['Bow_Right_L'];
      this._action = this._action_l
      if (prevState) {
        const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
  
        this._action_l.enabled = true;
        this._action_r.enabled = true;
  
        if (prevState?.Name !== 'Bow_Right' ) {
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
      if (input.c_forward == 0) {
        this._parent.SetState('Bow_Empty');
      }
      return;
    }
  };
  class Bow_BackwardState extends State {
    constructor(parent) {
      super(parent);
  
      this._action = null;
    }
  
    get Name() {
      return 'Bow_Left';
    }


  
    Enter(prevState) {
      this._action_l = this._parent._parent._animations['Bow_Left_R'];
      this._action_r = this._parent._parent._animations['Bow_Left_L'];
      this._action = this._action_l
      if (prevState) {
        const prevAction = this._parent._parent._animations[prevState.Name + '_L'];
        
        this._action_l.enabled = true;
        this._action_r.enabled = true;

        if (prevState?.Name !== 'Bow_Left' ) {
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
        this._action_l.setEffectiveWeight( Math.min(1, -input.c_forward));
        this._action_r.setEffectiveWeight( Math.min(1, -input.c_forward));
        return;
      }
      if (input.c_forward == 0) {
        this._parent.SetState('Bow_Empty');
      }
      return;
    }

  };
  

  return {
    Bow_IdleState:Bow_IdleState,
    Bow_RightState: Bow_RightState,
    Bow_LeftState:  Bow_LeftState,

    Bow_EmptyState:Bow_EmptyState,
    Bow_ForwardState: Bow_ForwardState,
    Bow_BackwardState:Bow_BackwardState,
  
    DrawState: DrawState,
    RecoilState: RecoilState,
    // OverdrawState: OverdrawState,
    DrawIdleState: DrawIdleState,
  
    DeathState: DeathState
  };
})();