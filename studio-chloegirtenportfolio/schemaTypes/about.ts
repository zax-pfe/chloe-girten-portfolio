import {UserIcon} from '@sanity/icons/User'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Singleton: a single document, registered in sanity.config.ts.
export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      description: 'Proportion : 3/4',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texte alternatif',
          type: 'string',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Texte',
      description: 'Chaque retour à la ligne crée un nouveau paragraphe.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Paragraphe', value: 'normal'}],
          lists: [],
          marks: {decorators: [], annotations: []},
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({title: 'À propos'}),
  },
})
