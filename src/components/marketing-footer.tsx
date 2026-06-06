'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/footer';
import DeveloperSpotlight from '@/components/developer-spotlight';

export default function MarketingFooter() {
  const pathname = usePathname();
  const showDeveloperSpotlight = pathname === '/about';
  const showCta = pathname === '/about';

  return (
    <>
      {showDeveloperSpotlight && <DeveloperSpotlight />}
      <Footer showCta={showCta} />
    </>
  );
}
