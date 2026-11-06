import {EditIcon} from '@sanity/icons/Edit'
import {defineField, defineType} from 'sanity'

export const drawing = defineType({
  name: 'drawing',
  title: 'Drawings',
  type: 'document',
  icon: EditIcon,
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
      name: 'imageHover',
      title: 'Image au survol',
      description: 'Optionnelle. Affichée à la place du dessin quand la souris passe dessus.',
      type: 'image',
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
