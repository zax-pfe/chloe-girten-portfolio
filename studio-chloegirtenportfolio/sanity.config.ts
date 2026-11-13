import {defineConfig, defineSingleton} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'ChloeGirtenPortfolio',

  projectId: '1ndlu6oy',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  document: {
    // One document each, with a fixed id.
    singletons: [
      defineSingleton({documentId: 'about', schemaType: 'about'}),
      defineSingleton({documentId: 'world', schemaType: 'world'}),
      defineSingleton({documentId: 'floatingPieces', schemaType: 'floatingPieces'}),
      defineSingleton({documentId: 'drawingStory', schemaType: 'drawingStory'}),
    ],
  },
})
