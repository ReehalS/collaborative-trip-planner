'use client';

import { useRouter } from 'next/navigation';
import { LuArrowLeft } from 'react-icons/lu';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  onBack,
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = onBack || (() => router.back());

  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-surface-600 hover:text-primary-600 bg-white border border-surface-200 hover:border-primary-200 rounded-btn shadow-sm transition-all duration-200"
        >
          <LuArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="font-display text-2xl font-bold text-surface-900">
          {title}
        </h1>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
