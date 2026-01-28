'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { AiOutlineArrowLeft } from 'react-icons/ai';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, onBack, actions }: PageHeaderProps) {
  const router = useRouter();

  const handleBack = onBack || (() => router.back());

  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleBack}
          startIcon={<AiOutlineArrowLeft />}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Back
        </Button>
        <h1 className="font-display text-2xl font-bold text-surface-900">
          {title}
        </h1>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
