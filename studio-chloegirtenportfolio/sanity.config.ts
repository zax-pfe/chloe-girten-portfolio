import {defineConfig, defineSingleton} from 'sanity'
import {structureTool, type ListItem} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {ImageIcon} from '@sanity/icons/Image'
import {EditIcon} from '@sanity/icons/Edit'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'ChloeGirtenPortfolio',

  projectId: '1ndlu6oy',
  dataset: 'production',

  plugins: [
    structureTool({
      // Default structure, with the pieces and the drawings as drag and drop lists: their order is the
      // one on the site. They keep their place in the menu.
      structure: (S, context) => {
        const orderable: Record<string, ListItem> = {
          piece: orderableDocumentListDeskItem({
            type: 'piece',
            title: 'Pieces',
            icon: ImageIcon,
            S,
            context,
          }),
          drawing: orderableDocumentListDeskItem({
            type: 'drawing',
            title: 'Drawings',
            icon: EditIcon,
            S,
            context,
          }),
        }

        return S.list()
          .id('__root__')
          .title('Content')
          .items(S.documentTypeListItems().map((item) => orderable[item.getId() ?? ''] ?? item))
          .singletons()
      },
    }),
    visionTool(),
  ],

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
