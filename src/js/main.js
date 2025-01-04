import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import vertexSource from "./shader/vertexShader.glsl";
import fragmentSource from "./shader/fragmentShader.glsl";
import { gsap } from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

import Lenis from '@studio-freight/lenis';


class Main {
  constructor() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.uniforms = {
      uTime: { value: 0.0 }
    };

    this.planeMappings = [
      { name: 'plane1', texture: 'image/1.jpg' },
      { name: 'plane2', texture: 'image/2.jpg' },
      { name: 'plane3', texture: 'image/3.jpg' },
      { name: 'plane4', texture: 'image/4.jpg' },
      { name: 'plane5', texture: 'image/5.jpg' },
      { name: 'plane6', texture: 'image/6.jpg' },
      { name: 'plane7', texture: 'image/7.jpg' },
      { name: 'plane8', texture: 'image/8.jpg' },
    ];

    this.canvas = document.querySelector("#canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.viewport.width, this.viewport.height);

    this.textureLoader = new THREE.TextureLoader();

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('libs/draco/');
    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.dracoLoader);

    this.animations = null;
    this.mixer = null;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.camera = null;
    this.mesh = null;

    this.controls = null;

    this.lenis = new Lenis({
      duration: 1.2,
    });
    this.lenis.stop();

    this._init();

    this._addEvent();
  }

  _setCamera() {
    //ウインドウとWebGL座標を一致させる
    const fov = 45;
    const fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
    const distance = (this.viewport.height / 2) / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
    this.camera = new THREE.PerspectiveCamera(fov, this.viewport.width / this.viewport.height, 1, distance * 2);
    this.camera.position.z = distance;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
  }

  _setLight() {
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(1, 1, 1);
    this.scene.add(light);

    const ambLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
    this.scene.add(ambLight);
  }

  _addModel() {
    this.loader.load('model/2d_scene3.glb', (gltf) => {
      const model = gltf.scene;
      this.animations = gltf.animations;

      // 各planeにテクスチャを適用
      this._applyTextureToPlanes(model);

      this.camera = gltf.cameras[0];

      if(this.animations && this.animations.length) {
 
          //Animation Mixerインスタンスを生成
          this.mixer = new THREE.AnimationMixer(model);
  
          //全てのAnimation Clipに対して
          for (let i = 0; i < this.animations.length; i++) {
              let animation = this.animations[i];
  
              //Animation Actionを生成
              let action = this.mixer.clipAction(animation) ;
  
              //ループ設定
              action.setLoop(THREE.LoopOnce); // 1回再生
              // action.setLoop(THREE.LoopRepeat); // ループ再生
  
              //アニメーションの最後のフレームでアニメーションが終了
              action.clampWhenFinished = true;
  
              //アニメーションを再生
              action.play();
          }
            
          this._addEventScroll();
      }


      this.scene.add(model);

      this._onResize();

      this._update();


    });
  }

  _applyTextureToPlanes(model) {
    this.planeMappings.forEach(mapping => {
      const plane = model.getObjectByName(mapping.name);
      if (plane) {
        const texture = this.textureLoader.load(mapping.texture, (tex) => {
          this._applyTexture(tex, plane);
        });
      }
    });
  }

  _applyTexture(texture, plane) {

    const planeUniforms = Object.assign({}, this.uniforms, {
      uTex: { value: texture }
    });

    // ShaderMaterialを設定
    const material = new THREE.ShaderMaterial({
      uniforms: planeUniforms,
      vertexShader: vertexSource,
      fragmentShader: fragmentSource,
      transparent: true
    });

    texture.flipY = false; // テクスチャの上下反転を防ぐ

    plane.material = material;
    plane.material.needsUpdate = true;
  }

  _loadAnimation() {
    const tlLoadAnimation = gsap.timeline();
    tlLoadAnimation.to('.js-ttl', {
      opacity: 1,
      delay: 0.3,
    })
    .to('.js-ttl-txts', {
      y: 0,
      delay: 0.5,
      duration: 0.6,
      // ease: 'circ.inOut',
      ease: 'circ.out',
      stagger: 0.03,
      onComplete: () => {
        this.lenis.start();
      }
    });
  }

  _scrollAnimation() {
    const tlScrollAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: '.js-section-02',
        start: 'top 96%',
        onLeaveBack: () => tlScrollAnimation.reverse(), // 逆再生させる
        // markers: true,
      }
    });
    tlScrollAnimation.to('.js-ttl-txts', {
      duration: 0.9,
      ease: 'circ.inOut',
      y: '-100%',
    })
  }

  _init() {
    this._addModel();

    this._loadAnimation();
    this._scrollAnimation();
  }

  _update(time) {

    this.lenis.raf(time);

    this.uniforms.uTime.value = this.clock.getElapsedTime();

    //レンダリング
    this.renderer.render(this.scene, this.camera);
    // this.controls.update();
    requestAnimationFrame(this._update.bind(this));

  }

  _onResize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    // レンダラーのサイズを修正
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    // カメラのアスペクト比を修正
    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();
  }

  _scrollReset() {
    window.scrollTo(0, 0);
  }

  _addEvent() {
    window.addEventListener("resize", this._onResize.bind(this));
    window.addEventListener("beforeunload", this._scrollReset.bind(this));
  }

  _addEventScroll() {

    console.log(this.animations);

    // スクロールとカメラアニメーションの連動
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY; // スクロール量
      const scrollHeight = document.querySelector('.scroll').clientHeight; // スクロール領域の高さ
      const viewportHeight = window.innerHeight;
      const scrollProgress = scrollY / (scrollHeight - viewportHeight); // スクロールの進捗度0~1

      this.animations.forEach(animation => {
        const animationDuration = animation.duration;
        const animationTime = scrollProgress * animationDuration;
        
        const action = this.mixer.existingAction(animation);
        action.reset();
        this.mixer.setTime(animationTime); // アニメーションの時間を設定
      });
      this.renderer.render(this.scene, this.camera);
    });
  }
}

new Main();



