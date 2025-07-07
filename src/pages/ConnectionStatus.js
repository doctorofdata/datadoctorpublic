import React, { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';

const ConnectionStatus = ({ 
  apiEndpoint = 'http://127.0.0.1:5000'
}) => {
  const [connectionState, setConnectionState] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  // Auto-check connection every 30 seconds
  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      try {
        const response = await fetch(`${apiEndpoint}/health`, {
          method: 'GET',
          timeout: 5000,
        });
        setConnectionState(response.ok);
      } catch (error) {
        setConnectionState(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkConnection();

    // Set up periodic checking
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [apiEndpoint]);

  const getStatusColor = () => {
    if (isChecking) return '#gold'; // amber from theme
    return connectionState ? '#39FF14' : '#gold'; // green for connected, amber for disconnected
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    return connectionState ? 'Connected' : 'Disconnected';
  };

  return (
    <div
      title={`API Status: ${getStatusText()}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 8px',
        borderRadius: 8,
        background: 'rgba(30,30,42,0.5)',
        width: '100%',
        maxWidth: 180,
        minWidth: 0,
        boxSizing: 'border-box',
      }}
      onMouseEnter={(e) => e.target.style.opacity = '0.8'}
      onMouseLeave={(e) => e.target.style.opacity = '1'}
    >
      <Wifi
        size={18}
        color={getStatusColor()}
        style={{
          filter: `drop-shadow(0 0 4px ${getStatusColor()})`
        }}
      />   <span
        style={{
          fontSize: 13,
          color: '#fff', // Always white text
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {getStatusText()}
      </span>
    </div>
  );
};

export default ConnectionStatus;