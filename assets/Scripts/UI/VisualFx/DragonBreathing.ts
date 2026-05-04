import { _decorator, Component, Node, Skeleton } from 'cc';
import { sp } from 'cc';
import { AudioManager } from '../../Managers/AudioManager';
import { Services } from '../../Managers/Services';
const { ccclass, property } = _decorator;

@ccclass('DragonBreathing')
export class DragonBreathing extends Component {

    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;

    start() {

        if(!this.skeleton) 
        {
            console.error('[DragonBreathing] skeleton is null or not assigned in Inspector');
            return;
        }

        this.skeleton.setCompleteListener((trackEntry) => {
            if (trackEntry.animation.name == "blazing7-dragon-idle_animation" ) {
                this.scheduleOnce(this.play,10);
            }
        });
        this.play();
    }

    play() {
        const audioManager = Services.GetService(AudioManager);
        
        if(!audioManager){
            console.error("[SFX DragonBreathing] AudioManager is not registered in the services.");
        }
        
        audioManager.playEffectByName("dragonbreathing");
        this.node.getComponent(sp.Skeleton).setAnimation(0, "blazing7-dragon-idle_animation", false);        
    }
}


