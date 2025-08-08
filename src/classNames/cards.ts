export const Md3Cards = {
  elevated: `
    rounded-xl
    bg-surface-container-high
    text-surface-container
    shadow-sm
    hover:shadow-md
    transition-shadow duration-200
  `,

  filled: `
    rounded-xl
    bg-surface-container
    text-on-surface-container
    shadow-none
  `,

  outlined: `
    rounded-xl
    bg-surface
    text-on-surface
    border border-outline
    shadow-none
    hover:shadow-sm
    transition-shadow duration-200
  `,

  state: {
    selected: `
      border border-primary
      shadow-md
    `,

    disabled: `
      bg-on-surface/[0.12]
      text-on-surface/[0.38]
      shadow-none
      pointer-events-none
    `,
  },

  inner: {
    content: `
      p-4 space-y-2
    `,

    media: `
      w-full overflow-hidden rounded-t-xl
      aspect-video object-cover
    `,

    actions: `
      flex items-center justify-end
      px-4 pb-4 pt-2
      gap-2
    `,
  },
} as const;
