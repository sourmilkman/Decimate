import type { LevelConfig } from './types';

const common = { duration:60, returnWarning:10 };

export const levels:LevelConfig[] = [
  {
    ...common,id:'living',name:'The Living Room',tagline:'Prime-time property damage',targetPercent:75,
    palette:{floor:0x24212c,backWall:0x393244,sideWall:0x302b3c,rug:0x5f3e72,accent:0x90c9e8},
    objects:[
      {id:'tv',name:'Ultra TV',position:[-3.8,2.1,-4.15],size:[2.3,1.35,.28],color:0x151925,points:150,breakThreshold:24},
      {id:'console',name:'Media Console',position:[-3.8,.55,-4.05],size:[3.2,1,.85],color:0x8a6045,points:90,breakThreshold:18,copyable:true},
      {id:'sofa',name:'Cloud Sofa',position:[3.4,1,-3.7],size:[3.8,1.5,1.25],color:0x526c91,points:140,breakThreshold:32},
      {id:'coffee',name:'Coffee Table',position:[1.2,.55,-.7],size:[2.8,.35,1.5],color:0xc9894e,points:90,breakThreshold:18,copyable:true},
      {id:'lamp',name:'Floor Lamp',position:[5.15,1.65,-1.7],size:[.55,3.1,.55],color:0xf2c75c,points:80,breakThreshold:12,copyable:true},
      {id:'shelf',name:'Bookcase',position:[-5.15,2.15,-1.3],size:[1.35,4.1,1],color:0x72513c,points:120,breakThreshold:28},
      {id:'plant',name:'House Plant',position:[4.8,.75,1.5],size:[1.05,1.45,1.05],color:0x4d9b66,points:65,breakThreshold:12,copyable:true,shape:'sphere'},
      {id:'vase1',name:'Blue Vase',position:[-.5,.65,-3.95],size:[.65,1.2,.65],color:0x55bfe4,points:65,breakThreshold:5,copyable:true,shape:'sphere'},
      {id:'vase2',name:'Gold Vase',position:[.6,.55,-4.05],size:[.55,1,.55],color:0xe7a43c,points:60,breakThreshold:5,copyable:true,shape:'sphere'},
      {id:'ottoman',name:'Ottoman',position:[3.7,.5,.1],size:[1.45,.8,1.3],color:0x8f5e9e,points:60,breakThreshold:16,copyable:true},
      {id:'speaker',name:'Speaker',position:[-2.05,1,-3.85],size:[.65,1.8,.65],color:0x242632,points:70,breakThreshold:15,copyable:true},
      {id:'frames',name:'Picture Frames',position:[1,2.9,-4.58],size:[2.1,1.1,.18],color:0xd76f61,points:55,breakThreshold:9}
    ]
  },
  {
    ...common,id:'kitchen',name:'The Kitchen',tagline:'Tonight’s special: chaos',targetPercent:77,
    palette:{floor:0x263036,backWall:0x3b4a50,sideWall:0x303b40,rug:0x36595b,accent:0x8ff4e1},
    objects:[
      {id:'fridge',name:'Smart Fridge',position:[-4.7,1.75,-4.05],size:[1.55,3.5,1.25],color:0xb8c5ca,points:160,breakThreshold:34},
      {id:'oven',name:'Double Oven',position:[-2.6,1,-4.2],size:[1.55,2,1],color:0x30363b,points:130,breakThreshold:28},
      {id:'island',name:'Kitchen Island',position:[.8,.9,-.5],size:[3.7,1.65,1.6],color:0xd8c4a5,points:150,breakThreshold:34},
      {id:'microwave',name:'Microwave',position:[1.8,1.8,-4.15],size:[1.45,.8,.8],color:0x222932,points:90,breakThreshold:16,copyable:true},
      {id:'cabinet',name:'Pantry Cabinet',position:[4.7,1.7,-4.1],size:[1.55,3.4,1],color:0x77a99d,points:130,breakThreshold:28},
      {id:'stool1',name:'Bar Stool',position:[-.5,.65,1.25],size:[.75,1.3,.75],color:0xc77848,points:55,breakThreshold:10,copyable:true},
      {id:'stool2',name:'Bar Stool',position:[1.1,.65,1.25],size:[.75,1.3,.75],color:0xc77848,points:55,breakThreshold:10,copyable:true},
      {id:'blender',name:'Blender',position:[3,.7,-3.85],size:[.55,1.25,.55],color:0x6dc8d5,points:70,breakThreshold:9,copyable:true},
      {id:'kettle',name:'Kettle',position:[4,.55,-3.85],size:[.7,.9,.7],color:0xe7bd55,points:60,breakThreshold:7,copyable:true,shape:'sphere'},
      {id:'fruit',name:'Fruit Bowl',position:[.7,1.9,-.5],size:[.85,.65,.85],color:0xf07352,points:65,breakThreshold:6,copyable:true,shape:'sphere'},
      {id:'dishes',name:'Dish Stack',position:[-1.4,.4,-3.9],size:[.8,.75,.8],color:0xe9f2ed,points:75,breakThreshold:8,copyable:true},
      {id:'bin',name:'Recycling Bin',position:[5,.65,1.6],size:[1.05,1.3,1.05],color:0x4e82a5,points:60,breakThreshold:14,copyable:true}
    ]
  },
  {
    ...common,id:'bedroom',name:'The Bedroom',tagline:'Sweet dreams are cancelled',targetPercent:79,
    palette:{floor:0x2c2635,backWall:0x4c3d5b,sideWall:0x392f48,rug:0x855f88,accent:0xffa6c9},
    objects:[
      {id:'bed',name:'King Bed',position:[2.7,.65,-3.4],size:[4.6,1.1,2.5],color:0x7f6aa8,points:170,breakThreshold:38},
      {id:'wardrobe',name:'Wardrobe',position:[-4.6,2,-3.9],size:[2.1,4,1.2],color:0x9b7153,points:150,breakThreshold:34},
      {id:'dresser',name:'Dresser',position:[-3.7,.85,-.9],size:[2.7,1.6,1],color:0xb18260,points:110,breakThreshold:25},
      {id:'nightstand',name:'Nightstand',position:[.05,.55,-3.9],size:[1.1,1,1],color:0xa87958,points:65,breakThreshold:12,copyable:true},
      {id:'lamp',name:'Bedside Lamp',position:[.05,1.45,-3.9],size:[.55,1.15,.55],color:0xffcf69,points:55,breakThreshold:7,copyable:true},
      {id:'mirror',name:'Tall Mirror',position:[-5.25,2.25,1.1],size:[.3,3.5,1.5],color:0x91c8dc,points:100,breakThreshold:16},
      {id:'chair',name:'Reading Chair',position:[4.5,.9,.25],size:[1.7,1.7,1.45],color:0xd46f78,points:90,breakThreshold:20,copyable:true},
      {id:'plant',name:'Peace Lily',position:[5,.75,2.2],size:[1.15,1.45,1.15],color:0x68ac71,points:65,breakThreshold:11,copyable:true,shape:'sphere'},
      {id:'alarm',name:'Alarm Clock',position:[-.15,1.15,-3.75],size:[.6,.45,.45],color:0x4fdaee,points:60,breakThreshold:5,copyable:true},
      {id:'laundry',name:'Laundry Basket',position:[-2.8,.65,2],size:[1.25,1.25,1.25],color:0xe0c78f,points:60,breakThreshold:13,copyable:true},
      {id:'books',name:'Book Stack',position:[-3.7,1.9,-.85],size:[1,.55,.8],color:0xd38362,points:55,breakThreshold:7,copyable:true},
      {id:'shoes',name:'Shoe Box',position:[1.2,.35,1.9],size:[1.2,.65,.8],color:0x4e8f9e,points:45,breakThreshold:8,copyable:true}
    ]
  },
  {
    ...common,id:'office',name:'The Home Office',tagline:'Productivity ends here',targetPercent:81,
    palette:{floor:0x202833,backWall:0x293b4b,sideWall:0x253342,rug:0x31506b,accent:0x62d8ff},
    objects:[
      {id:'desk',name:'Standing Desk',position:[0,1,-3.7],size:[4.4,.3,1.25],color:0x8f664b,points:145,breakThreshold:32},
      {id:'monitor1',name:'Main Monitor',position:[-.9,2,-4],size:[1.65,1.05,.25],color:0x20252c,points:110,breakThreshold:19},
      {id:'monitor2',name:'Side Monitor',position:[1,1.95,-4],size:[1.35,.9,.25],color:0x252a31,points:95,breakThreshold:17},
      {id:'tower',name:'Gaming PC',position:[3.1,1,-3.9],size:[.85,2,1],color:0x343145,points:140,breakThreshold:28},
      {id:'chair',name:'Office Chair',position:[.25,.85,-1.35],size:[1.35,1.7,1.25],color:0x465267,points:95,breakThreshold:21,copyable:true},
      {id:'printer',name:'Printer',position:[-4.1,.8,-3.9],size:[1.6,1.1,1.2],color:0xd0d6d9,points:95,breakThreshold:18,copyable:true},
      {id:'bookcase',name:'File Shelf',position:[-5,1.8,-.9],size:[1.55,3.6,1.05],color:0x657c8d,points:125,breakThreshold:29},
      {id:'lamp',name:'Desk Lamp',position:[-2,1.75,-3.6],size:[.5,1.15,.5],color:0xf4c65e,points:55,breakThreshold:7,copyable:true},
      {id:'plant',name:'Desk Plant',position:[2.05,1.65,-3.75],size:[.75,.8,.75],color:0x60a878,points:55,breakThreshold:7,copyable:true,shape:'sphere'},
      {id:'whiteboard',name:'Whiteboard',position:[4.5,2.6,-4.55],size:[2.1,1.5,.18],color:0xe5edeb,points:75,breakThreshold:13},
      {id:'mug',name:'World’s Best Mug',position:[1.65,1.35,-3.25],size:[.42,.55,.42],color:0xd96864,points:50,breakThreshold:5,copyable:true},
      {id:'files',name:'File Box',position:[4.6,.5,1.5],size:[1.2,1,1.1],color:0x4f8da8,points:55,breakThreshold:11,copyable:true}
    ]
  },
  {
    ...common,id:'garage',name:'The Garage',tagline:'Maximum structural mischief',targetPercent:83,
    palette:{floor:0x292c2c,backWall:0x454a48,sideWall:0x363a39,rug:0x614f36,accent:0xff9d45},
    objects:[
      {id:'workbench',name:'Workbench',position:[-2.3,1,-4],size:[4.1,1.7,1.2],color:0x8b6546,points:150,breakThreshold:36},
      {id:'toolchest',name:'Tool Chest',position:[3.8,1.15,-4],size:[2,2.25,1.1],color:0xc8493e,points:145,breakThreshold:34},
      {id:'car',name:'Family Car',position:[1.8,.65,-1.25],size:[4.5,1.15,2.1],color:0x3d8fc1,points:300,breakThreshold:99,hitsRequired:15},
      {id:'bike',name:'Mountain Bike',position:[4.7,1.15,1.8],size:[2.5,2.1,.65],color:0x4e96b9,points:125,breakThreshold:27},
      {id:'shelves',name:'Storage Shelves',position:[-5,2,-1],size:[1.6,4,1.2],color:0x5b6263,points:145,breakThreshold:36},
      {id:'mower',name:'Lawn Mower',position:[1.7,.65,2.2],size:[1.7,1.2,1.5],color:0x72a04c,points:110,breakThreshold:25},
      {id:'tires',name:'Tire Stack',position:[-3.9,.95,2.3],size:[1.35,1.9,1.35],color:0x252728,points:95,breakThreshold:22,copyable:true,shape:'sphere'},
      {id:'crate1',name:'Storage Crate',position:[-1.6,.55,.75],size:[1.5,1.1,1.25],color:0xd09b48,points:65,breakThreshold:14,copyable:true},
      {id:'crate2',name:'Storage Crate',position:[-3.2,.55,.6],size:[1.5,1.1,1.25],color:0x4e8a78,points:65,breakThreshold:14,copyable:true},
      {id:'paint1',name:'Paint Can',position:[-1.1,.55,-3.7],size:[.65,1.05,.65],color:0x5bb7cf,points:55,breakThreshold:7,copyable:true,shape:'sphere'},
      {id:'paint2',name:'Paint Can',position:[-.25,.55,-3.7],size:[.65,1.05,.65],color:0xe8bf48,points:55,breakThreshold:7,copyable:true,shape:'sphere'},
      {id:'toolbox',name:'Toolbox',position:[2.3,.45,-3.7],size:[1.4,.75,.75],color:0xd55b4d,points:70,breakThreshold:13,copyable:true},
      {id:'radio',name:'Garage Radio',position:[-3.8,2.15,-3.8],size:[1.1,.75,.65],color:0x30383e,points:70,breakThreshold:12,copyable:true}
    ]
  }
];

export const livingRoom=levels[0];
