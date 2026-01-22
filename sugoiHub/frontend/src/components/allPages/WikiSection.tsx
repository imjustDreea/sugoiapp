import React from 'react';

type WikiItem = {
  label: string;
  value: string | number | React.ReactNode;
  highlight?: boolean;
};

type WikiSectionProps = {
  items: WikiItem[];
};

export default function WikiSection({ items }: WikiSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-dark border border-grid rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
        <span className="text-accentLime">📋</span>
        Información
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex flex-col gap-1"
          >
            <span className="text-xs text-muted font-medium uppercase tracking-wide">{item.label}</span>
            <span className={`text-base ${
              item.highlight ? 'text-accentLime font-semibold' : 'text-white'
            }`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
