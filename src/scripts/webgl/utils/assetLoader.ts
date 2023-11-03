import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { resolvePath } from '../../utils'

export type Assets = {
  [key in string]: {
    data?: THREE.Texture | THREE.VideoTexture | GLTF
    path: string
    encoding?: boolean
    flipY?: boolean,
    source?: any
  }
}

export async function loadAssets(assets: Assets) {
  const textureLoader = new THREE.TextureLoader()
  const gltfLoader = new GLTFLoader()
  const rgbeLoader = new RGBELoader()

  const getExtension = (path: string) => {
    const s = path.split('.')
    return s[s.length - 1]
  }

  await Promise.all(
    Object.values(assets).map(async (v) => {
      const path = resolvePath(v.path)
      const extension = getExtension(path)

      if (['jpg', 'png', 'webp'].includes(extension)) {
        const texture = await textureLoader.loadAsync(path)
        texture.userData.aspect = texture.image.width / texture.image.height
        v.encoding && (texture.colorSpace = THREE.SRGBColorSpace)
        v.flipY !== undefined && (texture.flipY = v.flipY)
        v.data = texture
      } else if (['glb', 'gltf'].includes(extension)) {
        const gltf = await gltfLoader.loadAsync(path)
        v.data = gltf
      } else if (['webm', 'mp4'].includes(extension)) {
        v.source = document.createElement('video')
        
        v.source.src = path
        v.source.muted = true
        v.source.loop = true
        v.source.autoplay = true
        v.source.preload = 'metadata'
        v.source.playsInline = true
        v.source.play()
        // await v.source.play()
        const texture = new THREE.VideoTexture(v.source)
        texture.needsUpdate = true
        texture.userData.aspect = v.source.videoWidth / v.source.videoHeight
        v.encoding && (texture.colorSpace = THREE.SRGBColorSpace)
        v.data = texture
      } else if (['hdr'].includes(extension)) {
        const texture = await rgbeLoader.loadAsync(path)
        texture.mapping = THREE.EquirectangularReflectionMapping
        v.data = texture
      }
    }),
  )
}
