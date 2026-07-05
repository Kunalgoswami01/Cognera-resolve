import React from 'react';

export default function PageContainer({ children }) {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full h-full flex flex-col gap-6 animate-fade-in">
      {children}
    </div>
  );
}
