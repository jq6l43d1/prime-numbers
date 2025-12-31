import { useMemo } from 'react';
import { calculateAllStatistics } from '../utils/statistics';

export function useStatistics(orders, returns = []) {
  const statistics = useMemo(() => {
    if (!orders || orders.length === 0) {
      return null;
    }

    return calculateAllStatistics(orders, returns);
  }, [orders, returns]);

  return statistics;
}
