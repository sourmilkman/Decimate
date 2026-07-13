import { describe,expect,it } from 'vitest';
import { decimationPercent,launchVelocity,resolveRound } from './rules';

describe('decimation rules',()=>{
  it('calculates weighted percentage',()=>expect(decimationPercent(750,1000)).toBe(75));
  it('fails below target even when disguised',()=>expect(resolveRound(74,true,500).passed).toBe(false));
  it('fails at target without disguise',()=>expect(resolveRound(75,false,500).reason).toContain('caught'));
  it('passes only with target and disguise',()=>expect(resolveRound(75,true,500).passed).toBe(true));
});
describe('catapult trajectory',()=>{
  it('launches forward and upward',()=>{const v=launchVelocity(80,-160);expect(v.y).toBeGreaterThan(5);expect(v.z).toBeLessThan(0);});
  it('clamps extreme drags',()=>expect(launchVelocity(999,-999).power).toBe(24));
});
