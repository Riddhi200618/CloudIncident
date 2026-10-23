import React from 'react';

export default function PriorityBadge({ priority, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-0.5 tracking-wider',
    lg: 'text-sm px-3.5 py-1 tracking-wider font-semibold',
  };

  const getStyle = () => {
    switch (priority) {
      case 'Critical':
        return 'bg-[#501B24] text-[#EAC4CF] border border-[#651F2B] font-bold shadow-sm';
      case 'High':
        return 'bg-[#F4DDE2] text-[#651F2B] border border-[#EAC4CF] font-semibold';
      case 'Medium':
        return 'bg-[#FAF5EE] text-[#7A4B1A] border border-[#DCCBBC]';
      case 'Low':
        return 'bg-white text-[#2B5A3C] border border-[#C5D8C9]';
      default:
        return 'bg-white text-[#5A4647] border border-[#DCCBBC]';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium uppercase ${sizeClasses[size] || sizeClasses.md} ${getStyle()}`}
    >
      {priority === 'Critical' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#EAC4CF] animate-ping inline-block mr-0.5" />
      )}
      <span>{priority || 'Medium'}</span>
    </span>
  );
}
