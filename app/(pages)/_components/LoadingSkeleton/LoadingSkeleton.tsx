interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'form' | 'page';
  count?: number;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-surface-200 rounded-btn ${className || ''}`}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-card shadow-card p-5 space-y-3">
      <SkeletonBlock className="h-5 w-3/4" />
      <SkeletonBlock className="h-4 w-1/2" />
      <SkeletonBlock className="h-4 w-2/3" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white rounded-card shadow-card divide-y divide-surface-100">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 flex items-center gap-3">
          <SkeletonBlock className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-1/3" />
            <SkeletonBlock className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-card shadow-card p-8 w-full max-w-md space-y-4">
        <SkeletonBlock className="h-7 w-1/2 mx-auto" />
        <SkeletonBlock className="h-4 w-1/3 mx-auto" />
        <div className="space-y-4 mt-6">
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-9 w-20" />
        <SkeletonBlock className="h-7 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function LoadingSkeleton({
  variant = 'page',
  count = 1,
}: LoadingSkeletonProps) {
  const components = {
    card: CardSkeleton,
    list: ListSkeleton,
    form: FormSkeleton,
    page: PageSkeleton,
  };

  const Component = components[variant];

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </>
  );
}
