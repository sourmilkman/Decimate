import type { LevelConfig } from './types';

export const livingRoom: LevelConfig = {
  name: 'The Living Room', duration: 60, returnWarning: 10, targetPercent: 75,
  objects: [
    { id:'tv', name:'Ultra TV', position:[-3.8,2.1,-4.15], size:[2.3,1.35,.28], color:0x151925, points:150, breakThreshold:24 },
    { id:'console', name:'Media Console', position:[-3.8,.55,-4.05], size:[3.2,1.0,.85], color:0x8a6045, points:90, breakThreshold:18, copyable:true },
    { id:'sofa', name:'Cloud Sofa', position:[3.4,1,-3.7], size:[3.8,1.5,1.25], color:0x526c91, points:140, breakThreshold:32 },
    { id:'coffee', name:'Coffee Table', position:[1.2,.55,-.7], size:[2.8,.35,1.5], color:0xc9894e, points:90, breakThreshold:18, copyable:true },
    { id:'lamp', name:'Floor Lamp', position:[5.15,1.65,-1.7], size:[.55,3.1,.55], color:0xf2c75c, points:80, breakThreshold:12, copyable:true },
    { id:'shelf', name:'Bookcase', position:[-5.15,2.15,-1.3], size:[1.35,4.1,1.0], color:0x72513c, points:120, breakThreshold:28 },
    { id:'plant', name:'House Plant', position:[4.8,.75,1.5], size:[1.05,1.45,1.05], color:0x4d9b66, points:65, breakThreshold:12, copyable:true, shape:'sphere' },
    { id:'vase1', name:'Blue Vase', position:[-.5,.65,-3.95], size:[.65,1.2,.65], color:0x55bfe4, points:65, breakThreshold:5, copyable:true, shape:'sphere' },
    { id:'vase2', name:'Gold Vase', position:[.6,.55,-4.05], size:[.55,1,.55], color:0xe7a43c, points:60, breakThreshold:5, copyable:true, shape:'sphere' },
    { id:'ottoman', name:'Ottoman', position:[3.7,.5,.1], size:[1.45,.8,1.3], color:0x8f5e9e, points:60, breakThreshold:16, copyable:true },
    { id:'speaker', name:'Speaker', position:[-2.05,1,-3.85], size:[.65,1.8,.65], color:0x242632, points:70, breakThreshold:15, copyable:true },
    { id:'frames', name:'Picture Frames', position:[1.0,2.9,-4.58], size:[2.1,1.1,.18], color:0xd76f61, points:55, breakThreshold:9 }
  ]
};
