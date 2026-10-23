import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  outline: 'btn--outline',
  ghost: 'btn--ghost',
  danger: 'btn--danger',
};

const sizes = {
  sm: 'btn--sm',
  md: 'btn--md',
  lg: 'btn--lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth ? 'btn--full' : '',
    loading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="btn__spinner" />}
      {!loading && Icon && <Icon size={16} />}
      {children && <span>{children}</span>}
      {!loading && IconRight && <IconRight size={16} />}
    </button>
  );
}
