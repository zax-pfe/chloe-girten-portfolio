import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'

export const piece = defineType({
  name: 'piece',
  title: 'Œuvre',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Année',
      type: 'string',
      validation: (rule) =>
        rule.required().regex(/^\d{4}$/, {
          name: 'year',
          invert: false,
        }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'date',
      media: 'image',
    },
  },
})
