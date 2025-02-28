import { Difference } from '../types';

export function compareJson(obj1: any, obj2: any): Difference[] {
  return findDifferences(obj1, obj2, '');
}

function findDifferences(obj1: any, obj2: any, path: string): Difference[] {
  if (obj1 === obj2) return [];
  
  if (typeof obj1 !== typeof obj2) {
    return [{
      path: path || '/',
      type: 'changed',
      leftValue: obj1,
      rightValue: obj2
    }];
  }
  
  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
    return [{
      path: path || '/',
      type: 'changed',
      leftValue: obj1,
      rightValue: obj2
    }];
  }
  
  const diffs: Difference[] = [];
  
  // Check for arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const maxLength = Math.max(obj1.length, obj2.length);
    
    for (let i = 0; i < maxLength; i++) {
      const currentPath = `${path}[${i}]`;
      
      if (i >= obj1.length) {
        diffs.push({
          path: currentPath,
          type: 'added',
          rightValue: obj2[i]
        });
      } else if (i >= obj2.length) {
        diffs.push({
          path: currentPath,
          type: 'removed',
          leftValue: obj1[i]
        });
      } else {
        diffs.push(...findDifferences(obj1[i], obj2[i], currentPath));
      }
    }
    
    return diffs;
  }
  
  // Handle objects
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  
  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in obj1)) {
      diffs.push({
        path: currentPath,
        type: 'added',
        rightValue: obj2[key]
      });
    } else if (!(key in obj2)) {
      diffs.push({
        path: currentPath,
        type: 'removed',
        leftValue: obj1[key]
      });
    } else {
      diffs.push(...findDifferences(obj1[key], obj2[key], currentPath));
    }
  }
  
  return diffs;
}