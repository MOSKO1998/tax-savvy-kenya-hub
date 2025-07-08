
import React from 'react';

export const TestComponent = () => {
  console.log('TestComponent rendering');
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tax Compliance Hub
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            System is working! Components are rendering correctly.
          </p>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Application is running successfully
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
            <p className="text-gray-600">View system overview and metrics</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Client Management</h3>
            <p className="text-gray-600">Manage client information and records</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Tax Obligations</h3>
            <p className="text-gray-600">Track and manage tax compliance</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Documents</h3>
            <p className="text-gray-600">Upload and manage documents</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Calendar</h3>
            <p className="text-gray-600">View important dates and deadlines</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Reports</h3>
            <p className="text-gray-600">Generate compliance reports</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Continue to Full Application
          </button>
        </div>
      </div>
    </div>
  );
};
