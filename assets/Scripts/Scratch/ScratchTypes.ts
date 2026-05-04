// ScratchTypes.ts

export interface GridCell {
    row: number;
    col: number;
    x: number;
    y: number;
    width: number;
    height: number;
    valid: boolean;
}

export interface TrajectoryPoint {
    t: number;  // 相对开始时间 ms
    x: number;  // 纹理坐标
    y: number;
    r: number;  // 行索引
    c: number;  // 刮卡次数
}

export interface ScratchTrajectory {
    type: 'manual' | 'auto';
    startTime: number;
    endTime: number;
    points: TrajectoryPoint[];
    brushSize: number;
    autoMethodName?: string;
}
