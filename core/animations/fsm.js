import {finite_state_machine} from '../game/finite-state-machine.js'
import {player_bow_state} from './longbow-state.js'
import {player_spear_state} from './spear-state.js'
import {player_sword_state} from './sword-state.js'
import {enemy_state} from './enemy-state.js'//split out?
  
export const fsm = (() => {
  class bow_forwardFSM extends finite_state_machine.FiniteStateMachine {
    constructor(params) {
      super(params);
      this._Init();
    }
  
    _Init() {
      this._AddState('Bow_Empty', player_bow_state.Bow_EmptyState);
      this._AddState('Bow_Forwards', player_bow_state.Bow_ForwardState);
      this._AddState('Bow_Backwards', player_bow_state.Bow_BackwardState);
      // this._AddState('Death', player_bow_state.DeathState);
      }
  };
  // Static states
  class bow_strafeFSM extends finite_state_machine.FiniteStateMachine {
    constructor(params) {
      super(params);
      this._Init();
    }
  
    _Init() {
      this._AddState('Bow_Left', player_bow_state.Bow_LeftState);
      this._AddState('Bow_Right', player_bow_state.Bow_RightState);
      this._AddState('Bow_Idle', player_bow_state.Bow_IdleState);
      // this._AddState('Death', player_bow_state.DeathState);
    }
  };
  // Transition states?
    class bow_attackFSM extends finite_state_machine.FiniteStateMachine {
      constructor(params) {
        super(params);
        this._Init();
      }
    
      _Init() {
        this._AddState('Bow_Draw', player_bow_state.DrawState);
        // this._AddState('Overdraw', player_bow_state.OverdrawState);
        this._AddState('Bow_Recoil', player_bow_state.RecoilState);
        this._AddState('Bow_DrawIdle', player_bow_state.DrawIdleState);
        // this._AddState('Death', player_bow_state.DeathState);
      }
    };

    class sword_forwardFSM extends finite_state_machine.FiniteStateMachine {
      constructor(params) {
        super(params);
        this._Init();
      }
    
      _Init() {
        this._AddState('Sword_Empty', player_sword_state.Sword_EmptyState);
        this._AddState('Sword_Forwards', player_sword_state.Sword_ForwardState);
        this._AddState('Sword_Backwards', player_sword_state.Sword_BackwardState);
        // this._AddState('Death', player_sword_state.DeathState);
        }
    };
    // Static states
    class sword_strafeFSM extends finite_state_machine.FiniteStateMachine {
      constructor(params) {
        super(params);
        this._Init();
      }
    
      _Init() {
        this._AddState('Sword_Left', player_sword_state.Sword_LeftState);
        this._AddState('Sword_Right', player_sword_state.Sword_RightState);
        this._AddState('Sword_Idle', player_sword_state.Sword_IdleState);
        // this._AddState('Death', player_sword_state.DeathState);
      }
    };
    // Transition states?
      class sword_attackFSM extends finite_state_machine.FiniteStateMachine {
        constructor(params) {
          super(params);
          this._Init();
        }
      
        _Init() {
          this._AddState('Sword_AttackIdle', player_sword_state.Sword_AttackIdleState);
          this._AddState('Sword_Attack1', player_sword_state.Sword_Attack1State);
          this._AddState('Sword_Attack2', player_sword_state.Sword_Attack2State);
          // this._AddState('Death', player_sword_state.DeathState);
        }
      };


      class spear_forwardFSM extends finite_state_machine.FiniteStateMachine {
        constructor(params) {
          super(params);
          this._Init();
        }
      
        _Init() {
          this._AddState('Spear_Empty', player_spear_state.Spear_EmptyState);
          this._AddState('Spear_Forwards', player_spear_state.Spear_ForwardState);
          this._AddState('Spear_Backwards', player_spear_state.Spear_BackwardState);
          // this._AddState('Death', player_spear_state.DeathState);
          }
      };
      // Static states
      class spear_strafeFSM extends finite_state_machine.FiniteStateMachine {
        constructor(params) {
          super(params);
          this._Init();
        }
      
        _Init() {
          this._AddState('Spear_Left', player_spear_state.Spear_LeftState);
          this._AddState('Spear_Right', player_spear_state.Spear_RightState);
          this._AddState('Spear_Idle', player_spear_state.Spear_IdleState);
          // this._AddState('Death', player_spear_state.DeathState);
        }
      };
      // Transition states?
        class spear_attackFSM extends finite_state_machine.FiniteStateMachine {
          constructor(params) {
            super(params);
            this._Init();
          }
        
          _Init() {
            this._AddState('Spear_AttackIdle', player_spear_state.Spear_AttackIdleState);
            this._AddState('Spear_Attack1', player_spear_state.Spear_Attack1State);
            this._AddState('Spear_Attack2', player_spear_state.Spear_Attack2State);
          }
        };
  
  class enemyStrafeFSM extends finite_state_machine.FiniteStateMachine {
    constructor(params) {
      super(params);
      this._Init();
    }
  
    _Init() {
      this._AddState('Forward', enemy_state.ForwardState);
      this._AddState('Backward', enemy_state.BackwardState);
      this._AddState('Left', enemy_state.LeftState);
      this._AddState('Right', enemy_state.RightState);
      this._AddState('Idle', enemy_state.IdleState);
      this._AddState('Death', enemy_state.DeathState);
    }
  };
  
  class enemySlashFSM extends finite_state_machine.FiniteStateMachine {
    constructor(params) {
      super(params);
      this._Init();
    }
  
    _Init() {
      this._AddState('Slash', enemy_state.SlashState);
      this._AddState('IdleSlash', enemy_state.IdleSlashState);
    }
  };
  

  return {
    bow_strafeFSM: bow_strafeFSM,
    bow_forwardFSM: bow_forwardFSM,
    bow_attackFSM: bow_attackFSM,

    sword_strafeFSM: sword_strafeFSM,
    sword_forwardFSM: sword_forwardFSM,
    sword_attackFSM: sword_attackFSM,

    spear_strafeFSM: spear_strafeFSM,
    spear_forwardFSM: spear_forwardFSM,
    spear_attackFSM: spear_attackFSM,
    
    enemyStrafeFSM: enemyStrafeFSM,
    enemySlashFSM: enemySlashFSM
  };
})();