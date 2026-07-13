import { describe,expect,it } from 'vitest';
import { awardOnce,canDisguise,decimationPercent,launchVelocity,resolveRound,timedState } from './rules';
import { levels, livingRoom } from './level';
import { humanReaction } from './audio';

describe('decimation rules',()=>{
  it('calculates weighted percentage',()=>expect(decimationPercent(750,1000)).toBe(75));
  it('fails below target even when disguised',()=>expect(resolveRound(74,true,500).passed).toBe(false));
  it('fails at target without disguise',()=>expect(resolveRound(75,false,500).reason).toContain('caught'));
  it('passes only with target and disguise',()=>expect(resolveRound(75,true,500).passed).toBe(true));
  it('awards each object only once',()=>{const ids=new Set<string>();expect(awardOnce(ids,'tv',150)).toBe(150);expect(awardOnce(ids,'tv',150)).toBe(0);});
  it('enters the return warning at ten seconds',()=>expect(timedState(10,'playing')).toBe('return-warning'));
  it('only allows intact copyable disguises',()=>{expect(canDisguise(true,false)).toBe(true);expect(canDisguise(true,true)).toBe(false);expect(canDisguise(false,false)).toBe(false);});
});
describe('catapult trajectory',()=>{
  it('launches forward and upward',()=>{const v=launchVelocity(80,-160);expect(v.y).toBeGreaterThan(5);expect(v.z).toBeLessThan(0);});
  it('clamps extreme drags',()=>expect(launchVelocity(999,-999).power).toBe(24));
});
describe('living room tuning',()=>{
  it('runs for one minute',()=>expect(livingRoom.duration).toBe(60));
  it('contains several durable multi-hit targets',()=>expect(livingRoom.objects.filter(object=>object.breakThreshold>=18).length).toBeGreaterThanOrEqual(5));
});
describe('level progression',()=>{
  it('contains five distinct one-minute rooms',()=>{expect(levels).toHaveLength(5);expect(new Set(levels.map(level=>level.id)).size).toBe(5);expect(levels.every(level=>level.duration===60)).toBe(true);});
  it('raises the target as rooms unlock',()=>expect(levels.map(level=>level.targetPercent)).toEqual([75,77,79,81,83]));
  it('always provides a valid disguise target',()=>expect(levels.every(level=>level.objects.some(object=>object.copyable))).toBe(true));
  it('gives the garage car an exact fifteen-hit requirement',()=>expect(levels.find(level=>level.id==='garage')?.objects.find(object=>object.id==='car')?.hitsRequired).toBe(15));
  it('keeps a king bed in the bedroom',()=>expect(levels.find(level=>level.id==='bedroom')?.objects.some(object=>object.id==='bed')).toBe(true));
});
describe('human return reactions',()=>{
  it('reacts to vanished possessions when the alien is hidden',()=>expect(humanReaction(false,80)).toContain('stuff'));
  it('reacts differently when the alien is caught',()=>expect(humanReaction(true,80)).toContain('thing'));
  it('comments on partial destruction',()=>expect(humanReaction(false,50)).toContain('disaster'));
});
