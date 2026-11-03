import {SparklesIcon} from '@sanity/icons/Sparkles'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Singleton: a single document, registered in sanity.config.ts.
// The motion of each image (speed, direction...) stays in the frontend code.
export const floatingPieces = defineType({
  name: 'floatingPieces',
  title: 'Fond animé',
  type: 'document',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'pieces',
      title: 'Œuvres flottantes',
      description:
        "Œuvres qui flottent en fond du site, avec leur image détourée. Au clic, leur fiche s'ouvre.",
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'piece'}]})],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    prepare: () => ({title: 'Fond animé'}),
  },
})
