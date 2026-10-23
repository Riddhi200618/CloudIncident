import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 tracking-wider font-semibold',
  };

  const getStyle = () => {
    switch (status) {
      case 'Open':
        return 'bg-[#F4DDE2] text-[#501B24] border border-[#EAC4CF]';
      case 'Assigned':
        return 'bg-[#FAF5EE] text-[#651F2B] border border-[#DCCBBC]';
      case 'In Progress':
        return 'bg-[#EAC4CF] text-[#501B24] border border-[#501B24]/30 font-semibold';
      case 'Resolved':
        return 'bg-[#501B24] text-[#F7EFE6] border border-[#651F2B] shadow-sm';
      case 'Closed':
        return 'bg-[#EFE3D5] text-[#5A4647] border border-[#DCCBBC]';
      default:
        return 'bg-white text-[#24191A] border border-[#DCCBBC]';
    }
  };

  const getDotStyle = () => {
    switch (status) {
      case 'Open':
        return 'bg-[#C2415E]';
      case 'Assigned':
        return 'bg-[#D97706]';
      case 'In Progress':
        return 'bg-[#501B24] animate-pulse';
      case 'Resolved':
        return 'bg-[#EAC4CF]';
      case 'Closed':
        return 'bg-[#857172]';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium uppercase transition-colors ${sizeClasses[size] || sizeClasses.md} ${getStyle()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle()}`} />
      <span>{status || 'Unknown'}</span>
    </span>
  );
}
