import { useEffect, useRef } from 'react';

/**
 * A custom hook that runs an effect only once in development (due to React Strict Mode)
 * and once in production. This is useful for effects that should not be run twice on mount,
 * such as fetching data.
 * 
 * @param {Function} effect The effect callback to run.
 * @param {Array} deps The dependency array for the effect.
 */
export const useStrictEffect = (effect, deps) => {
  const effectRan = useRef(false);

  useEffect(() => {
    // Run the effect only on the second run in development, or on the first run in production.
    if (effectRan.current === true || import.meta.env.MODE !== 'development') {
      const cleanup = effect();
      
      // The cleanup function from the effect will be returned and executed by React.
      return cleanup;
    }

    // On the first run in development, set the ref to true and return the cleanup function.
    return () => {
      effectRan.current = true;
    };
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};