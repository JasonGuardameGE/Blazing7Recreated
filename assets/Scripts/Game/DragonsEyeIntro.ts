import { _decorator, Component, game, Node, sp, tween, UIOpacity } from 'cc';
import { GameManager } from '../Managers/GameManager';
import { Services } from '../Managers/Services';
const { ccclass, property } = _decorator;

@ccclass('DragonsEyeIntro')
export class DragonsEyeIntro extends Component {
    @property(sp.Skeleton)
    web_skeleton: sp.Skeleton = null;
  
    @property(sp.Skeleton)
    mobile_skeleton: sp.Skeleton = null;

    protected start(): void {
        this.showIntro();
    }
    
    private showIntro(){
        const gameManager = Services.GetService(GameManager);

        console.log(`[DragonEyeIntro][UIROOT] DEVICE TYPE: ${gameManager.GameData.DeviceType}`)

        if(gameManager.GameData.DeviceType == 'pc')
        {
            this.web_skeleton.node.active = true;
            this.web_skeleton.setAnimation(0, "Web size - animation", false);
            this.web_skeleton.setCompleteListener((trackEntry) => {
              if (trackEntry.animation.name == "Web size - animation" && trackEntry.isComplete) {
                this.onLockFinished();
              }
            });    
        }else{
            this.mobile_skeleton.node.active = true;
            this.mobile_skeleton.setAnimation(0, "Mobile Size - Animation", false);
            this.mobile_skeleton.setCompleteListener((trackEntry) => {
              if (trackEntry.animation.name == "Mobile Size - Animation" && trackEntry.isComplete) {
                this.onLockFinished();
              }
            });
        }

        const opacity = this.node.getComponent(UIOpacity);
        tween(opacity).delay(1.2).to(1, { opacity: 0 }).call(()=>{
          this.node.active = false;
        }).start();
    }

    onLockFinished() {
        this.node.active = false;
    }
}

