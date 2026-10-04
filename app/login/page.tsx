import React, { ReactNode } from "react";

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Include your Header or Navbar here if needed */}
      <main className="flex-1">{children}</main>
      {/* Include your Footer here if needed */}
    </div>
  );
}