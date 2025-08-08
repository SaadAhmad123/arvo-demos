export const Md3Typography = {
  display: {
    large: `
      font-montserrat text-5xl md:text-7xl lg:text-8xl
      font-normal tracking-tight
      text-on-surface
    `,
    medium: `
      font-montserrat text-4xl md:text-6xl
      font-normal tracking-tight
      text-on-surface
    `,
    small: `
      font-montserrat text-3xl md:text-5xl
      font-normal tracking-tight
      text-on-surface
    `,
  },

  headline: {
    large: `
      font-montserrat text-2xl md:text-4xl
      font-normal tracking-tight
      text-on-surface
    `,
    medium: `
      font-montserrat text-xl md:text-3xl
      font-normal tracking-tight
      text-on-surface
    `,
    small: `
      font-montserrat text-lg md:text-2xl
      font-normal tracking-tight
      text-on-surface
    `,
  },

  title: {
    large: `
      font-montserrat text-lg md:text-xl
      font-normal tracking-tight
      text-on-surface
    `,
    medium: `
      font-montserrat text-base md:text-lg
      font-medium tracking-[0.015em]
      text-on-surface
    `,
    small: `
      font-montserrat text-sm md:text-base
      font-medium tracking-[0.01em]
      text-on-surface
    `,
  },

  body: {
    large: `
      font-roboto text-base md:text-lg
      font-normal tracking-[0.03em]
      leading-relaxed
      text-on-surface
    `,
    medium: `
      font-roboto text-sm md:text-base
      font-normal tracking-[0.02em]
      leading-relaxed
      text-on-surface
    `,
    small: `
      font-roboto text-xs md:text-sm
      font-normal tracking-[0.03em]
      leading-relaxed
      text-on-surface
    `,
  },

  label: {
    large: `
      font-roboto text-sm md:text-base
      font-medium tracking-[0.01em]
      text-on-surface-variant
    `,
    medium: `
      font-roboto text-xs md:text-sm
      font-medium tracking-wide
      text-on-surface-variant
    `,
    small: `
      font-roboto text-[11px] md:text-xs
      font-medium tracking-wide
      text-on-surface-variant
    `,
  },

  states: {
    disabled: 'text-on-surface/[0.38]',
    muted: 'text-on-surface-variant',
    inverse: 'text-inverse-on-surface',
  },
} as const;
