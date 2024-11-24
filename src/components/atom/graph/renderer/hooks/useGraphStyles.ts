import { useCallback } from 'react';
import { AtomType } from '../../../../../lib/types';

export const useGraphStyles = () => {
  const getNodeColor = useCallback((type: AtomType) => {
    switch (type) {
      case 'ConceptNode':
        return '#ff7f0e';
      case 'PredicateNode':
        return '#2ca02c';
      case 'ListLink':
        return '#d62728';
      case 'EvaluationLink':
        return '#9467bd';
      default:
        return '#1f77b4';
    }
  }, []);

  const getLinkStyle = useCallback((type: string) => {
    return {
      stroke: '#999',
      strokeOpacity: 0.6,
      strokeWidth: type === 'EvaluationLink' ? 2 : 1
    };
  }, []);

  return {
    getNodeColor,
    getLinkStyle
  };
};