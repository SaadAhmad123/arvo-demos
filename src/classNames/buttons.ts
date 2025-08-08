// Material Design 3 Button Classes for Tailwind CSS

// 1. ELEVATED BUTTON
const elevatedButton = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-10 min-w-[64px] px-6 
  rounded-full 
  bg-surface-container-low 
  text-primary 
  text-sm font-medium tracking-[0.1px] 
  shadow-sm 
  hover:shadow-md hover:bg-primary/[0.08] 
  active:shadow-sm active:bg-primary/[0.12] 
  focus:shadow-sm focus:bg-primary/[0.12] focus:outline-none 
  disabled:shadow-none disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
`;

// With icon variant
const elevatedButtonWithIcon = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-10 min-w-[64px] pl-4 pr-6 
  rounded-full 
  bg-surface-container-low 
  text-primary 
  text-sm font-medium tracking-[0.1px] 
  shadow-sm 
  hover:shadow-md hover:bg-primary/[0.08] 
  active:shadow-sm active:bg-primary/[0.12] 
  focus:shadow-sm focus:bg-primary/[0.12] focus:outline-none 
  disabled:shadow-none disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
  [&>svg]:w-[18px] [&>svg]:h-[18px]
`;

// 2. FILLED BUTTON
const filledButton = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-10 min-w-[64px] px-6 
  rounded-full 
  bg-primary 
  text-on-primary 
  text-sm font-medium tracking-[0.1px] 
  hover:shadow-sm hover:bg-primary hover:brightness-110
  active:bg-primary active:brightness-90
  focus:bg-primary focus:brightness-90 focus:outline-none 
  disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
`;

// With icon variant
const filledButtonWithIcon = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-10 min-w-[64px] pl-4 pr-6 
  rounded-full 
  bg-primary 
  text-on-primary 
  text-sm font-medium tracking-[0.1px] 
  hover:shadow-sm hover:bg-primary hover:brightness-110
  active:bg-primary active:brightness-90
  focus:bg-primary focus:brightness-90 focus:outline-none 
  disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
  [&>svg]:w-[18px] [&>svg]:h-[18px]
`;

// 3. FILLED TONAL BUTTON
const filledTonalButton = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-10 min-w-[64px] px-6 
  rounded-full 
  bg-secondary-container 
  text-on-secondary-container 
  text-sm font-medium tracking-[0.1px] 
  hover:shadow-sm hover:bg-secondary-container hover:brightness-95
  active:bg-secondary-container active:brightness-90
  focus:bg-secondary-container focus:brightness-90 focus:outline-none 
  disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
`;

// With icon variant
const filledTonalButtonWithIcon = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-10 min-w-[64px] pl-4 pr-6 
  rounded-full 
  bg-secondary-container 
  text-on-secondary-container 
  text-sm font-medium tracking-[0.1px] 
  hover:shadow-sm hover:bg-secondary-container hover:brightness-95
  active:bg-secondary-container active:brightness-90
  focus:bg-secondary-container focus:brightness-90 focus:outline-none 
  disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
  [&>svg]:w-[18px] [&>svg]:h-[18px]
`;

// 4. OUTLINED BUTTON
const outlinedButton = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-10 min-w-[64px] px-6 
  rounded-full 
  bg-transparent 
  text-primary 
  text-sm font-medium tracking-[0.1px] 
  border border-outline 
  hover:bg-primary/[0.08] 
  active:bg-primary/[0.12] 
  focus:bg-primary/[0.12] focus:border-outline-variant focus:outline-none 
  disabled:border-on-surface/[0.12] disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
`;

// With icon variant
const outlinedButtonWithIcon = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-10 min-w-[64px] pl-4 pr-6 
  rounded-full 
  bg-transparent 
  text-primary 
  text-sm font-medium tracking-[0.1px] 
  border border-outline 
  hover:bg-primary/[0.08] 
  active:bg-primary/[0.12] 
  focus:bg-primary/[0.12] focus:border-outline-variant focus:outline-none 
  disabled:border-on-surface/[0.12] disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
  [&>svg]:w-[18px] [&>svg]:h-[18px]
`;

// 5. TEXT BUTTON
const textButton = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-10 min-w-[48px] px-3 
  rounded-full 
  bg-transparent 
  text-primary 
  text-sm font-medium tracking-[0.1px] 
  hover:bg-primary/[0.08] 
  active:bg-primary/[0.12] 
  focus:bg-primary/[0.12] focus:outline-none 
  disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
`;

// With icon variant
const textButtonWithIcon = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-10 min-w-[48px] pl-3 pr-4 
  rounded-full 
  bg-transparent 
  text-primary 
  text-sm font-medium tracking-[0.1px] 
  hover:bg-primary/[0.08] 
  active:bg-primary/[0.12] 
  focus:bg-primary/[0.12] focus:outline-none 
  disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
  [&>svg]:w-[18px] [&>svg]:h-[18px]
`;

// 6. ICON BUTTON (Standard)
const iconButton = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  w-10 h-10 
  rounded-full 
  bg-transparent 
  text-on-surface-variant 
  hover:bg-on-surface-variant/[0.08] 
  active:bg-on-surface-variant/[0.12] 
  focus:bg-on-surface-variant/[0.12] focus:outline-none 
  disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center
  [&>svg]:w-6 [&>svg]:h-6
`;

// Icon button sizes
const iconButtonSmall = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  w-8 h-8 
  rounded-full 
  bg-transparent 
  text-on-surface-variant 
  hover:bg-on-surface-variant/[0.08] 
  active:bg-on-surface-variant/[0.12] 
  focus:bg-on-surface-variant/[0.12] focus:outline-none 
  disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center
  [&>svg]:w-5 [&>svg]:h-5
`;

const iconButtonLarge = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  w-12 h-12 
  rounded-full 
  bg-transparent 
  text-on-surface-variant 
  hover:bg-on-surface-variant/[0.08] 
  active:bg-on-surface-variant/[0.12] 
  focus:bg-on-surface-variant/[0.12] focus:outline-none 
  disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center
  [&>svg]:w-7 [&>svg]:h-7
`;

// 7. FILLED ICON BUTTON
const filledIconButton = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  w-10 h-10 
  rounded-full 
  bg-primary 
  text-on-primary 
  hover:shadow-sm hover:bg-primary hover:brightness-110
  active:bg-primary active:brightness-90
  focus:bg-primary focus:brightness-90 focus:outline-none 
  disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center
  [&>svg]:w-6 [&>svg]:h-6
`;

// 8. FILLED TONAL ICON BUTTON
const filledTonalIconButton = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  w-10 h-10 
  rounded-full 
  bg-secondary-container 
  text-on-secondary-container 
  hover:shadow-sm hover:bg-secondary-container hover:brightness-95
  active:bg-secondary-container active:brightness-90
  focus:bg-secondary-container focus:brightness-90 focus:outline-none 
  disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center
  [&>svg]:w-6 [&>svg]:h-6
`;

// 9. OUTLINED ICON BUTTON
const outlinedIconButton = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  w-10 h-10 
  rounded-full 
  bg-transparent 
  text-on-surface-variant 
  border border-outline 
  hover:bg-on-surface-variant/[0.08] 
  active:bg-on-surface-variant/[0.12] 
  focus:bg-on-surface-variant/[0.12] focus:outline-none 
  disabled:border-on-surface/[0.12] disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center
  [&>svg]:w-6 [&>svg]:h-6
`;

// 10. FAB (Floating Action Button)
const fab = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  w-14 h-14 
  rounded-2xl 
  bg-primary-container 
  text-on-primary-container 
  shadow-lg 
  hover:shadow-xl hover:bg-primary-container hover:brightness-95
  active:shadow-lg active:bg-primary-container active:brightness-90
  focus:shadow-lg focus:bg-primary-container focus:brightness-90 focus:outline-none 
  transition-all duration-200
  inline-flex items-center justify-center
  [&>svg]:w-6 [&>svg]:h-6
`;

// FAB sizes
const fabSmall = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  w-10 h-10 
  rounded-xl 
  bg-primary-container 
  text-on-primary-container 
  shadow-lg 
  hover:shadow-xl hover:bg-primary-container hover:brightness-95
  active:shadow-lg active:bg-primary-container active:brightness-90
  focus:shadow-lg focus:bg-primary-container focus:brightness-90 focus:outline-none 
  transition-all duration-200
  inline-flex items-center justify-center
  [&>svg]:w-6 [&>svg]:h-6
`;

const fabLarge = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  w-24 h-24 
  rounded-[28px] 
  bg-primary-container 
  text-on-primary-container 
  shadow-lg 
  hover:shadow-xl hover:bg-primary-container hover:brightness-95
  active:shadow-lg active:bg-primary-container active:brightness-90
  focus:shadow-lg focus:bg-primary-container focus:brightness-90 focus:outline-none 
  transition-all duration-200
  inline-flex items-center justify-center
  [&>svg]:w-9 [&>svg]:h-9
`;

// 11. EXTENDED FAB
const extendedFab = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-14 min-w-[80px] px-4 
  rounded-2xl 
  bg-primary-container 
  text-on-primary-container 
  text-sm font-medium tracking-[0.1px] 
  shadow-lg 
  hover:shadow-xl hover:bg-primary-container hover:brightness-95
  active:shadow-lg active:bg-primary-container active:brightness-90
  focus:shadow-lg focus:bg-primary-container focus:brightness-90 focus:outline-none 
  transition-all duration-200
  inline-flex items-center justify-center gap-3
  [&>svg]:w-6 [&>svg]:h-6
`;

// With icon variant
const extendedFabWithIcon = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  h-14 min-w-[80px] pl-4 pr-5 
  rounded-2xl 
  bg-primary-container 
  text-on-primary-container 
  text-sm font-medium tracking-[0.1px] 
  shadow-lg 
  hover:shadow-xl hover:bg-primary-container hover:brightness-95
  active:shadow-lg active:bg-primary-container active:brightness-90
  focus:shadow-lg focus:bg-primary-container focus:brightness-90 focus:outline-none 
  transition-all duration-200
  inline-flex items-center justify-center gap-3
  [&>svg]:w-6 [&>svg]:h-6
`;

// 12. SEGMENTED BUTTON
const segmentedButtonGroup = `
  inline-flex 
  h-10 
  rounded-full 
  border border-outline 
  overflow-hidden
`;

const segmentedButtonSegment = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  min-w-[48px] px-3 
  bg-transparent 
  text-on-surface 
  text-sm font-medium tracking-[0.1px] 
  border-r border-outline last:border-r-0 
  hover:bg-on-surface/[0.08] 
  active:bg-on-surface/[0.12] 
  focus:bg-on-surface/[0.12] focus:outline-none 
  disabled:text-on-surface/[0.38] 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
  [&>svg]:w-[18px] [&>svg]:h-[18px]
`;

const segmentedButtonSegmentSelected = `
  font-roboto
  cursor-pointer
  disabled:cursor-not-allowed
  min-w-[48px] px-3 
  bg-secondary-container 
  text-on-secondary-container 
  text-sm font-medium tracking-[0.1px] 
  border-r border-outline last:border-r-0 
  hover:bg-secondary-container hover:brightness-95
  active:bg-secondary-container active:brightness-90
  focus:bg-secondary-container focus:brightness-90 focus:outline-none 
  transition-all duration-200
  inline-flex items-center justify-center gap-2
  [&>svg]:w-[18px] [&>svg]:h-[18px]
`;

// Export for easy use
export const Md3Buttons = {
  elevated: elevatedButton,
  elevatedWithIcon: elevatedButtonWithIcon,
  filled: filledButton,
  filledWithIcon: filledButtonWithIcon,
  filledTonal: filledTonalButton,
  filledTonalWithIcon: filledTonalButtonWithIcon,
  outlined: outlinedButton,
  outlinedWithIcon: outlinedButtonWithIcon,
  text: textButton,
  textWithIcon: textButtonWithIcon,
  icon: iconButton,
  iconSmall: iconButtonSmall,
  iconLarge: iconButtonLarge,
  filledIcon: filledIconButton,
  filledTonalIcon: filledTonalIconButton,
  outlinedIcon: outlinedIconButton,
  fab: fab,
  fabSmall: fabSmall,
  fabLarge: fabLarge,
  extendedFab: extendedFab,
  extendedFabWithIcon: extendedFabWithIcon,
  segmentedGroup: segmentedButtonGroup,
  segmentedButton: segmentedButtonSegment,
  segmentedButtonSelected: segmentedButtonSegmentSelected,
} as const;
