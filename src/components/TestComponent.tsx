
import React from 'react';

export const TestComponent = () => {
  console.log('TestComponent rendering');
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Tax Compliance Hub
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          System is loading...
        </p>
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};
