// One-off: copies the frontend worldData (25 cells) into the "world" singleton.
// Run from the studio folder: npx sanity exec migrations/importWorld.mjs --with-user-token
import {createReadStream} from 'node:fs'
import path from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-02-01'})
const publicDir = path.resolve('../chloe-girten-portfolio/public/world')

const text =
  'Ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'

// Same order and content as chloe-girten-portfolio/src/data/worldData.js.
const worldData = [
  {type: 'photoCrop', src: 'img/world_6.png', alt: "Sculpture à l'atelier"},
  {type: 'empty'},
  {type: 'empty'},
  {type: 'photoCrop', src: 'img/world_5.png', alt: "Dessins sur la table de l'atelier"},
  {type: 'photoFull', src: 'img/world_3.png', alt: 'Dessin de cheval'},

  {type: 'empty'},
  {type: 'photoCrop', src: 'img/world_1.png', alt: 'Sculpture devant le four'},
  {type: 'text', text},
  {type: 'empty'},
  {type: 'empty'},

  {type: 'photoFull', src: 'img/world_2.png', alt: 'Dessin de plante'},
  {type: 'empty'},
  {type: 'empty'},
  {type: 'photoCrop', src: 'img/world_4.png', alt: 'Sculpture de cheval en cours'},
  {type: 'empty'},

  {type: 'empty'},
  {type: 'video', src: 'video/world_video_1.mp4'},
  {type: 'empty'},
  {type: 'empty'},
  {type: 'video', src: 'video/world_video_2.mp4'},

  {type: 'video', src: 'video/world_video_3.mp4'},
  {type: 'empty'},
  {type: 'video', src: 'video/world_video_4.mp4'},
  {type: 'text', text},
  {type: 'video', src: 'video/world_video_5.mp4'},
]

async function upload(kind, src) {
  const file = path.join(publicDir, src)
  const asset = await client.assets.upload(kind, createReadStream(file), {
    filename: path.basename(file),
  })
  console.log(`uploaded ${src} -> ${asset._id}`)
  return {_type: 'reference', _ref: asset._id}
}

const cells = []
for (const [index, item] of worldData.entries()) {
  const _key = `cell${index + 1}`
  if (item.type === 'photoCrop' || item.type === 'photoFull') {
    cells.push({
      _key,
      _type: item.type === 'photoCrop' ? 'photoCropCell' : 'photoFullCell',
      image: {_type: 'image', asset: await upload('image', item.src), alt: item.alt},
    })
  } else if (item.type === 'video') {
    cells.push({_key, _type: 'videoCell', video: {_type: 'file', asset: await upload('file', item.src)}})
  } else if (item.type === 'text') {
    cells.push({_key, _type: 'textCell', text: item.text})
  } else {
    cells.push({_key, _type: 'emptyCell'})
  }
}

await client.createIfNotExists({_id: 'world', _type: 'world'})
await client.patch('world').set({cells}).commit()
console.log(`world: ${cells.length} cells published`)
