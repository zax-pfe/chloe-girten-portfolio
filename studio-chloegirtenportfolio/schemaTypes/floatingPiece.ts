import {SparkleIcon} from '@sanity/icons/Sparkle'
import {defineArrayMember, defineField, defineType} from 'sanity'

// A piece floating in the background of the home page, created right in "Animated Background"
// (floatingPieces), apart from the pieces of the grid.
// Clicked, it opens a panel (title, year, "Learn more"); "Learn more" opens its page: its other
// views, then its details.
// Its motion (speed, size, rotation...) stays in the frontend code.
export const floatingPiece = defineType({
  name: 'floatingPiece',
  title: 'Œuvre flottante',
  type: 'object',
  icon: SparkleIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image détourée',
      description: 'PNG transparent. Celle qui flotte en fond du site.',
      type: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    // URL of its "Learn more" page.
    defineField({
      name: 'slug',
      title: 'Slug',
      description:
        "Adresse de sa page « Learn more ». Cliquer sur « Generate » pour la créer depuis le titre.",
      type: 'slug',
      options: {
        // The title of this piece (the field next to it), not of the document.
        source: (_document, {parent}) => (parent as {title?: string} | undefined)?.title ?? '',
        maxLength: 96,
        // Unique among the floating pieces (the slugs are all in this one document): no other
        // piece of the list (other key than this one, from the path) has it.
        isUnique: (slug, {document, path}) => {
          const key = (path?.find((segment) => typeof segment === 'object' && '_key' in segment) as
            | {_key: string}
            | undefined)?._key
          const pieces = (document?.pieces ?? []) as {_key?: string; slug?: {current?: string}}[]
          return !pieces.some((item) => item._key !== key && item.slug?.current === slug)
        },
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
    // The photos of its page, in this order.
    defineField({
      name: 'gallery',
      title: 'Autres vues',
      description:
        "Photos de la pièce sous d'autres angles, affichées sur sa page « Learn more ». Glisser-déposer pour changer l'ordre.",
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
