export default function Button({ variant = 'primary', className = '', children, ...props }) {
  const base = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-sage-600 text-white hover:bg-sage-700 active:scale-95 shadow-sm',
    secondary: 'bg-cream-100 text-charcoal-800 hover:bg-cream-200 border border-cream-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    ghost: 'text-charcoal-800/60 hover:text-charcoal-900 hover:bg-cream-100',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}