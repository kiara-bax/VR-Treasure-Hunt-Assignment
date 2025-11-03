import {
  Mesh, MeshStandardMaterial,
  SphereGeometry,
  SessionMode,
  World,
  PlaneGeometry,
  Scene,
  AssetManager, AssetType, 
  LocomotionEnvironment, EnvironmentType, PlaneGeometry,
} from '@iwsdk/core';

import {
  Interactable,
  PanelUI,
  ScreenSpace
} from '@iwsdk/core';

import { PanelSystem } from './panel.js'; // system for displaying "Enter VR" panel on Quest 1

const assets = { 
  mapleTree: {
    url:'/gltf/plantSansevieria/maple_tree.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },

  coin: {
    url: '/gltf/plantSansevieria/coin.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  }
};

World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: 'always',
    features: { }
  },

  features: { 
    locomotion: true,
  },

}).then((world) => {

  const { camera } = world;

  
  // Create a green sphere
  const sphereGeometry = new SphereGeometry(0.5, 32, 32);
  const greenMaterial = new MeshStandardMaterial({ color: 0x33ff33 });
  const sphere = new Mesh(sphereGeometry, greenMaterial);
  //sphere.position.set(1, 0, -2);
  const sphereEntity = world.createTransformEntity(sphere);

  sphereEntity.object3D.position.set(1, 0, -2);

  // create a floor
  const floorGeometry = new PlaneGeometry(10, 10);
  const floorMaterial = new MeshStandardMaterial({color: "green"});
  const floorMesh = new Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  const floorEntity = world.createTransformEntity(floorMesh);
  
  floorEntity.addComponent(LocomotionEnvironment, {type: EnvironmentType.STATIC});

  //import 3d object (tree)
  const tree = AssetManager.getGLTF('mapleTree').scene;
  tree.position.set(5, 0, 5);
  const treeEntity = world.createTransformEntity(tree);

  //import 3d object (coin1)
  const coin1 = AssetManager.getGLTF('coin').scene;
  coin1.position.set(6, 1, 6);
  const coin1Entity = world.createTransformEntity(coin1);

  // coin2
  const coin2 = AssetManager.getGLTF('coin').scene;
  coin1.position.set(8, 1, 7);
  const coin2Entity = world.createTransformEntity(coin2);

  //coin3
  const coin3 = AssetManager.getGLTF('coin').scene;
  coin3.position.set(8, 1, 7);
  const coin3Entity = world.createTransformEntity(coin3);


  // vvvvvvvv EVERYTHING BELOW WAS ADDED TO DISPLAY A BUTTON TO ENTER VR FOR QUEST 1 DEVICES vvvvvv
  //          (for some reason IWSDK doesn't show Enter VR button on Quest 1)
  world.registerSystem(PanelSystem);
  
  if (isMetaQuest1()) {
    const panelEntity = world
      .createTransformEntity()
      .addComponent(PanelUI, {
        config: '/ui/welcome.json',
        maxHeight: 0.8,
        maxWidth: 1.6
      })
      .addComponent(Interactable)
      .addComponent(ScreenSpace, {
        top: '20px',
        left: '20px',
        height: '40%'
      });
    panelEntity.object3D.position.set(0, 1.29, -1.9);
  } else {
    // Skip panel on non-Meta-Quest-1 devices
    // Useful for debugging on desktop or newer headsets.
    console.log('Panel UI skipped: not running on Meta Quest 1 (heuristic).');
  }
  function isMetaQuest1() {
    try {
      const ua = (navigator && (navigator.userAgent || '')) || '';
      const hasOculus = /Oculus|Quest|Meta Quest/i.test(ua);
      const isQuest2or3 = /Quest\s?2|Quest\s?3|Quest2|Quest3|MetaQuest2|Meta Quest 2/i.test(ua);
      return hasOculus && !isQuest2or3;
    } catch (e) {
      return false;
    }
  }

});
