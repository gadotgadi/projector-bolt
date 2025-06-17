import React from 'react';
import { useParams } from 'react-router-dom';

const StationAssignment = () => {
  const { taskId } = useParams();

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
      <h1 style={{ color: 'green', fontSize: '24px' }}>
        🎉 SUCCESS! StationAssignment Page Loaded!
      </h1>
      <p style={{ fontSize: '18px', margin: '10px 0' }}>
        Task ID from URL: <strong>{taskId}</strong>
      </p>
      <p style={{ fontSize: '16px', color: '#666' }}>
        Navigation is working! This is the StationAssignment page.
      </p>
      <button 
        onClick={() => window.location.href = '/'}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default StationAssignment;