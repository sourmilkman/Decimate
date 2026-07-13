import type { RoundResult } from './types';
import type { GameState } from './types';

export const clamp = (n:number, min:number, max:number) => Math.max(min, Math.min(max, n));
export const decimationPercent = (awarded:number, total:number) => total ? Math.round(awarded / total * 100) : 0;
export function resolveRound(percent:number, disguised:boolean, score:number, target=75): RoundResult {
  if (percent < target) return { passed:false, reason:`Only ${percent}% decimated — ${target}% required.`, percent, score };
  if (!disguised) return { passed:false, reason:'The human caught you before you could disguise!', percent, score };
  return { passed:true, reason:'Room decimated. Cover maintained.', percent, score };
}
export function awardOnce(awarded:Set<string>, id:string, points:number) {
  if (awarded.has(id)) return 0;
  awarded.add(id); return points;
}
export const timedState = (remaining:number, state:GameState, warning=10):GameState => remaining<=warning&&state==='playing'?'return-warning':state;
export const canDisguise = (copyable:boolean|undefined, broken:boolean) => Boolean(copyable)&&!broken;
export function launchVelocity(dx:number, dy:number) {
  const drag = clamp(Math.hypot(dx, dy), 30, 260);
  const power = 8 + (drag - 30) / 230 * 16;
  const yaw = clamp(dx / 260, -.72, .72);
  const lift = clamp(-dy / 260, 0, 1);
  return { x:yaw * power, y:1.5 + lift * 6.5, z:-power * (1 - Math.abs(yaw) * .28), power };
}
