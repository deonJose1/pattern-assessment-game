// Reusable button for the admin design system.
//
// Props:
//   variant   'primary' | 'danger' | 'secondary' (default 'primary')
//   size      'sm' | 'md' (default 'md')
//   isLoading boolean — shows a spinner and disables the button
//   ...rest   standard button attributes (onClick, disabled, type, etc.)

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60'

const SIZES = {
  sm: 'rounded-lg px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
}

const VARIANTS = {
  primary:
    'border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400',
  danger:
    'border border-red-200 text-red-600 hover:bg-red-50 focus:ring-red-300',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300',
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  )
}

function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const classes = `${BASE} ${SIZES[size] ?? SIZES.md} ${
    VARIANTS[variant] ?? VARIANTS.primary
  } ${className}`.trim()

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={classes}
      {...rest}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  )
}

export default Button
