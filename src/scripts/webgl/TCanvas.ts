import * as THREE from 'three'
import { gl } from './core/WebGL'
import { Assets, loadAssets } from './utils/assetLoader'
// import { GLB } from 'three/examples/jsm/loaders/GLBLoader'
import { controls } from './utils/OrbitControls'
import vertexShader from './shader/vs.glsl'
import fragmentShader from './shader/fs.glsl'
import { calcCoveredTextureScale } from './utils/coveredTexture'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'

export class TCanvas {
  private assets: Assets = {
    image: { path: 'images/unsplash.jpg' },
    screen: { path: 'videos/SquareGlitch.mp4' },
    // pheonix: { path: 'models/phoenix_bird.glb' },
    room: { path: 'models/room.glb' },
  }

  constructor(private container: HTMLElement) {
    loadAssets(this.assets).then(() => {
      this.init()
      // this.createObjects()
      this.createModel()
      this.addLights()
      gl.requestAnimationFrame(this.anime)
    })
  }

  private init() {
    gl.setup(this.container)
    gl.scene.background = new THREE.Color('#012')
    gl.camera.position.set(0.8, 0.8, 0.8)
  }

  private createObjects() {
    const texture = this.assets.image.data as THREE.Texture
    const scale = calcCoveredTextureScale(texture, 1 / 1)

    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tImage: { value: texture },
        uUvScale: { value: new THREE.Vector2(scale[0], scale[1]) },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geometry, material)

    gl.scene.add(mesh)
  }

  private createModel() {
    console.log(this.assets.screen.data)
    if (!this.assets.room?.data) return
    const room = this.assets.room.data as GLTF
    console.log(room)
    room.scene.scale.set(0.05, 0.05, 0.05)


    const screen = this.assets.screen.data as THREE.VideoTexture

    // screen.play()
    // screen.loop = true
    // screen.muted = true

    room.scene.traverse((child) => {
      if (child.name === 'screen') {
        console.log(child)
        child.material = new THREE.MeshMatcapMaterial({ color: 0xffffff, map: screen })
      }
    })

    document.addEventListener('click', () => {
      this.assets.screen.source?.play()
    })




    gl.scene.add(room.scene)
    // const mesh = gltf.scene.children[0] as THREE.Mesh
    // const material = mesh.material as THREE.MeshStandardMaterial
    // material.roughness = 0.5
    // material.metalness = 0.5
    // material.envMapIntensity = 1
    // material.envMap = this.assets.image.data as THREE.Texture
    // material.needsUpdate = true
    // gl.createAnimationMixer('pheonix', pheonix.scene)
    // gl.generateAnimationActions('pheonix')

  }
  private addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    gl.scene.add(ambientLight)

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    // directionalLight.position.set(0.5, 0.5, 0.5)
    // gl.scene.add(directionalLight)
  }
  
  // ----------------------------------
  // animation
  private anime = () => {
    controls.update()
    gl.render()
  }

  // ----------------------------------
  // dispose
  dispose() {
    gl.dispose()
  }
}
