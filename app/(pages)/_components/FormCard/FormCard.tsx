interface FormCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function FormCard({
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
}: FormCardProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div
        className={`bg-white rounded-card shadow-card p-8 w-full ${maxWidth} animate-scale-in`}
      >
        <h1 className="font-display text-2xl font-bold text-surface-900 text-center mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-surface-500 text-center mb-6">
            {subtitle}
          </p>
        )}
        {!subtitle && <div className="mb-6" />}
        {children}
      </div>
    </div>
  );
}
