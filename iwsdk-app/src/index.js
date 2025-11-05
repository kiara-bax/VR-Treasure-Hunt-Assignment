import {
  Mesh, MeshStandardMaterial,
  SphereGeometry,
  SessionMode,
  World,
  PlaneGeometry,
  Scene,
  AssetManager, AssetType, 
  LocomotionEnvironment, EnvironmentType,
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

  
  // // Create a green sphere
  // const sphereGeometry = new SphereGeometry(0.5, 32, 32);
  // const greenMaterial = new MeshStandardMaterial({ color: 0x33ff33 });
  // const sphere = new Mesh(sphereGeometry, greenMaterial);
  // //sphere.position.set(1, 0, -2);
  // const sphereEntity = world.createTransformEntity(sphere);

  // // detect x button press
  // function gameLoop() {


  //     const leftCtrl = world.input.gamepads.left
  //     if (leftCtrl?.gamepad.buttons[4].pressed) {
  //           console.log('x button pressed!');
  //           sphereEntity.object3D.position.y += 0.05;
  //           // do something like spawn a new object
  //     }


  //     requestAnimationFrame(gameLoop);
  // };
  // gameLoop();

  //sphereEntity.object3D.position.set(1, 0, -2);

  // create a floor
  const floorGeometry = new PlaneGeometry(200, 200);
  const floorMaterial = new MeshStandardMaterial({color: "green"});
  const floorMesh = new Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  const floorEntity = world.createTransformEntity(floorMesh);
  
  floorEntity.addComponent(LocomotionEnvironment, {type: EnvironmentType.STATIC});

  //import 3d object (tree)
  const treeAsset = AssetManager.getGLTF('mapleTree').scene;

  //tree1 clone
  const tree1 = treeAsset.clone();
  tree1.position.set(5, -2, 5);
  tree1.scale.set(0.5, 0.5, 0.5);
  const tree1Entity = world.createTransformEntity(tree1);

  //tree2 clone
  const tree2 = treeAsset.clone();
  tree2.position.set(19, -2, -24);
  tree2.scale.set(0.5, 0.5, 0.5);
  const tree2Entity = world.createTransformEntity(tree2);

  //tree3 clone
  const tree3 = treeAsset.clone();
  tree3.position.set(50, -2, -50);
  tree3.scale.set(0.5, 0.5, 0.5);
  const tree3Entity = world.createTransformEntity(tree3);


  //import 3d object (coin)
  const coinAsset = AssetManager.getGLTF('coin').scene;

  // coin1 clone
  const coin1 = coinAsset.clone();
  coin1.position.set(6, 1, 6);
  coin1.scale.set(0.5, 0.5, 0.5);
  const coin1Entity = world.createTransformEntity(coin1).addComponent(Interactable);
  coin1Entity.object3D.addEventListener("pointerdown", removeCoin1);

  function removeCoin1(){
    coin1Entity.destroy();
    showMessage("Score: " + score);
  }

  // coin2 clone
  const coin2 = coinAsset.clone();
  coin2.position.set(20, 1, -25);
  coin2.scale.set(0.5, 0.5, 0.5);
  const coin2Entity = world.createTransformEntity(coin2).addComponent(Interactable);
  coin2Entity.object3D.addEventListener("pointerdown", removeCoin2);

  function removeCoin2(){
    coin2Entity.destroy();
  }

  //coin3 clone
  const coin3 = coinAsset.clone();
  coin3.position.set(30, 1, 8);
  coin3.scale.set(0.5, 0.5, 0.5);
  const coin3Entity = world.createTransformEntity(coin3).addComponent(Interactable);
  coin3Entity.object3D.addEventListener("pointerdown", removeCoin3);

  function removeCoin3(){
    coin3Entity.destroy();
  }


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
 // create a message board using a canvas texture (scoreBox)
  const canvas = document.createElement('canvas');
  canvas.width = 2000;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 120px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Place message here', canvas.width / 2, canvas.height / 2);
  const texture = new CanvasTexture(canvas);
  const aspect = canvas.width / canvas.height;
  const boardWidth = 3;                 // world units
  const boardHeight = boardWidth / aspect;
  const boardMat = new MeshBasicMaterial({ map: texture, transparent: true, depthTest: false });
  const boardGeo = new PlaneGeometry(boardWidth, boardHeight);
  const boardMesh = new Mesh(boardGeo, boardMat);
  const boardEntity = world.createTransformEntity(boardMesh);
  boardEntity.object3D.position.set(1, 3, -5);  // in front of the user
  boardEntity.object3D.visible = false; // start hidden
  function showMessage(message) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillText(message, canvas.width / 2, canvas.height / 2);
      texture.needsUpdate = true;
      boardEntity.object3D.visible = true;
  }
  function hideMessage() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      texture.needsUpdate = true;
      boardEntity.object3D.visible = false;
  }
  function showTemporaryMessage(message, duration = 2000) {
      showMessage(message);
      setTimeout(() => {
          hideMessage();
      }, duration);
  }
});
