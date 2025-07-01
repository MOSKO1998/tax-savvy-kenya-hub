
import { useState } from 'react';

export const useSearch = <T extends Record<string, any>>(
  data: T[],
  searchFields: (keyof T)[]
) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item => {
    if (!searchTerm.trim()) return true;
    
    return searchFields.some(field => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      
      return String(value)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  });

  return {
    searchTerm,
    setSearchTerm,
    filteredData
  };
};
