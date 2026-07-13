export type GameState = 'menu' | 'playing' | 'return-warning' | 'disguised' | 'passed' | 'failed' | 'paused';

export interface DestructibleConfig {
  id: string;
  name: string;
  position: [number, number, number];
  size: [number, number, number];
  color: number;
  points: number;
  breakThreshold: number;
  copyable?: boolean;
  shape?: 'box' | 'sphere';
}

export interface LevelConfig {
  name: string;
  duration: number;
  returnWarning: number;
  targetPercent: number;
  objects: DestructibleConfig[];
}

export interface RoundResult { passed: boolean; reason: string; percent: number; score: number; }

declare global { const __BUILD_ID__: string; }
