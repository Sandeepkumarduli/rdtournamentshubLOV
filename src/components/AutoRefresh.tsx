import { useEffect } from 'react';

interface AutoRefreshProps {
  onRefresh: () => void;
  interval?: number;
}

const AutoRefresh = ({ onRefresh, interval = 5000 }: AutoRefreshProps) => {
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      onRefresh();
    }, interval);

    return () => clearInterval(refreshInterval);
  }, [onRefresh, interval]);

  return null;
};

export default AutoRefresh;