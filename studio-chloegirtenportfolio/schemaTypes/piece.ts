import {ImageIcon} from '@sanity/icons/Image'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const piece = defineType({
  name: 'piece',
  title: 'Pieces',
  type: 'document',
  icon: ImageIcon,
  // Order of the pieces on the site, set by drag and drop in the "Pieces" list (see sanity.config.ts).
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({type: 'piece'}),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'Proportion : 3/4',
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
        "Même image sans fond (PNG transparent), aux mêmes dimensions que l'image. Affichée par défaut, le fond apparaît au hover.",
      type: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    // URL of the piece page: /pieces/<slug>.
    defineField({
      name: 'slug',
      title: 'Slug',
      description: "Adresse de la page de la pièce (/pieces/good-boy). Cliquer sur « Generate » pour la créer depuis le titre.",
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
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
    // Optional: the pieces already in the studio don't have them yet.
    defineField({
      name: 'size',
      title: 'Taille',
      type: 'string',
    }),
    defineField({
      name: 'material',
      title: 'Matériau',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    // Shown after the main image on the piece page, in this order.
    defineField({
      name: 'gallery',
      title: 'Autres images',
      description: "Affichées après l'image principale sur la page de la pièce. Glisser-déposer pour changer l'ordre.",
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
      options: {
        layout: 'grid',
      },
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
