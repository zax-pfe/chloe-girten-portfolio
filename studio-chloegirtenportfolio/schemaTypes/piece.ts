import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'

export const piece = defineType({
  name: 'piece',
  title: 'Pieces',
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
      name: 'imageNoBg',
      title: 'Image détourée',
      description:
        "Même image sans fond (PNG transparent), aux mêmes dimensions que l'image. Affichée par défaut, le fond apparaît au survol. Aussi utilisée dans le fond animé : importer en haute résolution.",
      type: 'image',
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
