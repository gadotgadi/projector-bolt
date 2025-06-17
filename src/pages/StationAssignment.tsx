import React from 'react';
import { useParams } from 'react-router-dom';

const StationAssignment = () => {
  const { taskId } = useParams();

  console.log('🔥🔥🔥 STATION ASSIGNMENT PAGE LOADED! TaskId:', taskId);

  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#f0f8ff', 
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        color: '#1e40af', 
        fontSize: '32px',
        marginBottom: '20px'
      }}>
        🎯 STATION ASSIGNMENT PAGE WORKS!
      </h1>
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <p style={{ fontSize: '20px', margin: '10px 0', color: '#333' }}>
          Task ID: <strong style={{ color: '#d63384' }}>{taskId}</strong>
        </p>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
          This is the Station Assignment page! Navigation is working! 🎉
        </p>
        <button 
          onClick={() => {
            console.log('🔙 Going back to dashboard from Station Assignment');
            window.location.href = '/';
          }}
          style={{
            backgroundColor: '#0d6efd',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          🔙 Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default StationAssignment;