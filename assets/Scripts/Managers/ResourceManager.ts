import { _decorator, 
    Component, 
    Node, 
    resources, 
    Prefab, 
    instantiate,
    AudioClip,
 } from 'cc';

 const { ccclass, property } = _decorator;

@ccclass('ResourceManager')
export default class ResourceManager{

    public Init(): void {
        console.log('[ResourceManager] Initialized');
    }

    public async LoadPrefab(path: string): Promise<Node> {
        return new Promise((resolve, reject) => {
            resources.load(path, Prefab, (err, prefab) => {
                if (err || !prefab) {
                    console.error(`[ResourceManager] Failed to load prefab: ${path}`, err);
                    reject(err);
                    return;
                }
    
                const node = instantiate(prefab);
                resolve(node);
            });
        });
    }

    public async GetAudioClip(path: string) {
        if (!path) return null;
        return new Promise((res, rej) => {
          resources.load(path, AudioClip, (err, audioClip) => {
            if (err) {
              return res(null);
            }
            res(audioClip);
          });
        });
      }
}


