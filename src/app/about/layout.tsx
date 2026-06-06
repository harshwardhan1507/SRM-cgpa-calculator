import React from 'react';
import Navbar from '@/components/navbar';
import MarketingFooter from '@/components/marketing-footer';

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-[#FAFAFA] flex flex-col">
      <Navbar />
      {children}
      <MarketingFooter />
    </div>
  );
}
