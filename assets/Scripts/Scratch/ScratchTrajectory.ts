// ScratchTrajectoryRecorder.ts
import { ScratchTrajectory, TrajectoryPoint } from './ScratchTypes';

export class ScratchTrajectoryRecorder {
    private trajectory: ScratchTrajectory | null = null;
    private recording = false;
    private startTime = 0;
    private lastSampleTime = 0;
    private lastPoint: TrajectoryPoint | null = null;

    // 采样参数
    public sampleInterval = 50;
    public distanceThreshold = 15;
    public maxPoints = 500;
    public maxDuration = 30000;

    constructor() {}

    /** 开始手动刮卡轨迹 */
    startManual(brushSize: number) {
        if(this.trajectory) return;
        const now = Date.now();
        this.startTime = now;
        this.lastSampleTime = now;
        this.recording = true;
        this.lastPoint = null;

        this.trajectory = {
            type: 'manual',
            startTime: now,
            endTime: 0,
            points: [],
            brushSize
        };
    }

    /** 记录一个轨迹点（只在 totalEraseArea>0 时调用） */
    recordPoint(texX: number, texY: number, rowIndex: number, count: number) {
        if (!this.trajectory) return;

        const now = Date.now();
        const elapsed = now - this.startTime;

        // 点数硬上限：防炸接口
        if (this.trajectory.points.length >= this.maxPoints) {
            this.stop(false);
            console.log('[TrajectoryRecorder] reach max points, stop record.');
            return;
        }

        // 超过最大时长：只警告，仍可继续记录（你原需求）
        if (elapsed > this.maxDuration) {
            const overOnce = !this.trajectory.points.some(p => p.t > this.maxDuration);
            if (overOnce) {
                console.log('[TrajectoryRecorder] duration over maxDuration, but continue recording.');
            }
        }

        const timeDelta = now - this.lastSampleTime;

        let shouldRecord = false;
        if (!this.lastPoint) {
            shouldRecord = true;
        } else if (timeDelta >= this.sampleInterval) {
            shouldRecord = true;
        } else {
            const dx = texX - this.lastPoint.x;
            const dy = texY - this.lastPoint.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist >= this.distanceThreshold) shouldRecord = true;
        }

        if (!shouldRecord) return;

        const pt: TrajectoryPoint = {
            t: now - this.startTime,
            x: texX,
            y: texY,
            r: rowIndex,
            c: count
        };

        this.trajectory.points.push(pt);
        this.lastPoint = pt;
        this.lastSampleTime = now;

        // console.log('recordPoint', this.trajectory.points);
    }

    /** 触摸开始时可以强制打一个点（例如单点点击产生小洞） */
    recordStartPoint(texX: number, texY: number, rowIndex: number, count: number) {
        if (!this.trajectory) return;
        const now = Date.now();
        const pt: TrajectoryPoint = {
            t: now - this.startTime,
            x: texX,
            y: texY,
            r: rowIndex,
            c: count
        };
        this.trajectory.points.push(pt);
        this.lastPoint = pt;
        this.lastSampleTime = now;
        // console.log('recordStartPoint', this.trajectory.points);
    }

    /** 停止记录（complete=true 表示刮卡完成） */
    stop(complete: boolean) {
        if (!this.trajectory) return;
        const now = Date.now();
        this.recording = false;
        this.trajectory.endTime = now;
        if (complete) {
            // 这里不直接上传，由上层决定何时上传
            console.log('[TrajectoryRecorder] complete, points=', this.trajectory.points.length);
        }
    }

    /** 开始自动刮卡轨迹，只记录方法名，不记录点 */
    startAuto(methodName: string, brushSize: number) {
        const now = Date.now();
        this.recording = true;
        this.startTime = now;
        this.lastSampleTime = now;
        this.lastPoint = null;

        // 注意：points 为空
        this.trajectory = {
            type: 'auto',
            startTime: now,
            endTime: 0,
            points: [],
            brushSize,
            autoMethodName: methodName
        };
    }

    /** 自动刮卡结束 */
    stopAuto(complete: boolean) {
        this.stop(complete);
    }

    /** 获取当前轨迹（不清空） */
    getTrajectory(): ScratchTrajectory | null {
        return this.trajectory;
    }

    /** 清空轨迹 */
    clear() {
        this.trajectory = null;
        this.recording = false;
        this.lastPoint = null;
    }
}
