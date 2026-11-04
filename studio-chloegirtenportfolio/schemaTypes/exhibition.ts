import {CalendarIcon} from '@sanity/icons/Calendar'
import {defineField, defineType} from 'sanity'

export const exhibition = defineType({
  name: 'exhibition',
  title: 'Exhibitions',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nom',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
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
      rows: 6,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image principale',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'year',
      media: 'image',
    },
  },
})
