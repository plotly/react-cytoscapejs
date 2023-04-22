export function deepEqual(obj1, obj2) {
  // Check if both arguments are objects
  if(typeof obj1 === 'function' || typeof obj2 === 'function') return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  // Get object keys
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if both objects have the same number of keys
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if keys are the same
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }

    // Recursive call to deepEqual
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  // All checks passed, objects are deeply equal
  return true;
}
