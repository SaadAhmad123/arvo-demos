export const Md3Cards = {
  hoverable_filled: `
    rounded-3xl
    bg-surface-container-high
    hover:bg-surface-container-highest
    border
    border-surface-container-highest
    hover:border-outline
    text-on-surface
    transition-all duration-200
  `,

  elevated: `
    rounded-3xl
    bg-surface-container-high
    hover:bg-surface-container-highest
    border
    border-surface-container-highest
    hover:border-outline
    text-on-surface
    shadow-sm
    hover:shadow-md
    transition-all duration-200
  `,

  filled: `
    rounded-3xl
    bg-surface-container
    text-on-surface
    shadow-none
  `,

  outlined: `
    rounded-3xl
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
      p-[32px] sm:p-[56px]
    `,
  },
} as const;
