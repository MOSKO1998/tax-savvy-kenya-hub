
import React from 'react';

interface CSABrandProps {
  showFullName?: boolean;
}

export const CSABrand = ({ showFullName = false }: CSABrandProps) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">CSA</span>
      </div>
      <span className="font-semibold text-gray-900">
        {showFullName ? "Chandaria Shah & Associates" : "Tax Compliance Hub"}
      </span>
    </div>
  );
};
