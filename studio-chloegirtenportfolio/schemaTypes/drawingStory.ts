import {BookIcon} from '@sanity/icons/Book'
import {defineField, defineType} from 'sanity'

// Singleton: a single document, registered in sanity.config.ts.
// Texts of the Story mode of the Drawings page; the drawings and their layout stay in the frontend code.
export const drawingStory = defineType({
  name: 'drawingStory',
  title: 'Drawing Story',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'section1Text',
      title: 'Texte section 1',
      description: 'Texte centré qui reste au milieu de l’écran pendant que les dessins défilent derrière.',
      type: 'text',
      rows: 6,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'section3Text',
      title: 'Texte section 3',
      description: 'Texte en haut à gauche, au-dessus des dessins de la dernière section.',
      type: 'text',
      rows: 6,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({title: 'Drawing Story'}),
  },
})
