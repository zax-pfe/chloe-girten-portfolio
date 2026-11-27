import {SparklesIcon} from '@sanity/icons/Sparkles'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Singleton: a single document, registered in sanity.config.ts.
// The motion of each image (speed, direction...) stays in the frontend code.
export const floatingPieces = defineType({
  name: 'floatingPieces',
  title: 'Animated Background',
  type: 'document',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'pieces',
      title: 'Œuvres flottantes',
      description:
        "Œuvres qui flottent en fond du site, dans cet ordre (glisser-déposer pour le changer). « Add item » pour en créer une. Au clic, leur fiche s'ouvre.",
      type: 'array',
      of: [defineArrayMember({type: 'floatingPiece'})],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Fond animé'}),
  },
})
