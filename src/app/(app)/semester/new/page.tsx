'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function SemesterNewRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `/sgpa?${query}` : '/sgpa');
  }, [router, searchParams]);

  return null;
}

export default function SemesterNewRedirectPage() {
  return (
    <Suspense fallback={null}>
      <SemesterNewRedirect />
    </Suspense>
  );
}
