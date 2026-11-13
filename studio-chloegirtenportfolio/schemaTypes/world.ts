import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {ImageIcon} from '@sanity/icons/Image'
import {PlayIcon} from '@sanity/icons/Play'
import {SquareIcon} from '@sanity/icons/Square'
import {TextIcon} from '@sanity/icons/Text'
import {defineArrayMember, defineField, defineType} from 'sanity'

const CELLS_PER_ROW = 5

// Shown on the cell types and on their image field, so the size is visible when importing.
// Sizes: a cell is about 1/6 of the screen width, doubled for retina screens.
const CROP_SIZE_INFO = 'Proportion : 4/5. Taille : au moins 500 × 625 px'
const FULL_SIZE_INFO = 'Proportion : 1/1. Taille : au moins 1000 × 1000 px'

const altField = defineField({
  name: 'alt',
  title: 'Texte alternatif',
  type: 'string',
})

// Singleton: a single document, registered in sanity.config.ts.
export const world = defineType({
  name: 'world',
  title: 'World',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'cells',
      title: 'Cases',
      description: `Une entrée par case de la grille, lue ligne par ligne (${CELLS_PER_ROW} cases par ligne).`,
      type: 'array',
      of: [
        defineArrayMember({
          name: 'emptyCell',
          title: 'Case vide',
          type: 'object',
          icon: SquareIcon,
          fields: [
            defineField({
              name: 'note',
              title: 'Note',
              description: 'Optionnel, non affiché sur le site.',
              type: 'string',
            }),
          ],
          preview: {
            prepare: () => ({title: 'Case vide'}),
          },
        }),
        defineArrayMember({
          name: 'photoCropCell',
          title: 'Photo crop',
          description: `Petite image au centre de la case. ${CROP_SIZE_INFO}`,
          type: 'object',
          icon: ImageIcon,
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              description: CROP_SIZE_INFO,
              type: 'image',
              options: {hotspot: true},
              fields: [altField],
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {media: 'image', subtitle: 'image.alt'},
            prepare: ({media, subtitle}) => ({title: 'Photo crop', subtitle, media}),
          },
        }),
        defineArrayMember({
          name: 'photoFullCell',
          title: 'Photo full',
          description: `Image qui remplit toute la case. ${FULL_SIZE_INFO}`,
          type: 'object',
          icon: ImageIcon,
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              description: FULL_SIZE_INFO,
              type: 'image',
              options: {hotspot: true},
              fields: [altField],
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {media: 'image', subtitle: 'image.alt'},
            prepare: ({media, subtitle}) => ({title: 'Photo full', subtitle, media}),
          },
        }),
        defineArrayMember({
          name: 'textCell',
          title: 'Texte',
          type: 'object',
          icon: TextIcon,
          fields: [
            defineField({
              name: 'text',
              title: 'Texte',
              type: 'text',
              rows: 5,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {subtitle: 'text'},
            prepare: ({subtitle}) => ({title: 'Texte', subtitle}),
          },
        }),
        defineArrayMember({
          name: 'videoCell',
          title: 'Vidéo',
          description: 'Courte boucle muette (quelques Mo maximum).',
          type: 'object',
          icon: PlayIcon,
          fields: [
            defineField({
              name: 'video',
              title: 'Vidéo',
              type: 'file',
              options: {accept: 'video/mp4,video/webm'},
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {subtitle: 'video.asset.originalFilename'},
            prepare: ({subtitle}) => ({title: 'Vidéo', subtitle}),
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((cells) =>
          !cells || cells.length % CELLS_PER_ROW === 0
            ? true
            : `Le nombre de cases devrait être un multiple de ${CELLS_PER_ROW} pour remplir la dernière ligne.`,
        ).warning(),
    }),
  ],
  preview: {
    prepare: () => ({title: 'World'}),
  },
})
