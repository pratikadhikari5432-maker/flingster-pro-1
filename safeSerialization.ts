
/**
 * Safe JSON Stringify utility to prevent circular reference errors.
 * Replaces circular references with "[Circular]" and strips internal Firebase prototypes.
 */
export const safeJsonStringify = (obj: any, replacer?: (key: string, value: any) => any, space?: string | number): string => {
  const cache = new WeakSet();
  
  const internalReplacer = (key: string, value: any) => {
    // Handle null and non-objects
    if (value === null || typeof value !== 'object') {
      return replacer ? replacer(key, value) : value;
    }

    // Handle Circularity
    if (cache.has(value)) {
      return "[Circular]";
    }
    cache.add(value);

    // Handle Firebase / Firestore / React / DOM / Events
    // Check for internal properties that often lead to circularity or non-serializable data
    if (
      value.$$typeof || // React element
      value.nodeType ||  // DOM node
      value._path ||     // Firestore Reference
      value._database || // Firestore Instance
      value._firestore || // Firestore Reference internal
      value._method ||   // Internal Firebase
      value.constructor?.name?.startsWith('Firebase') ||
      value.constructor?.name === 'GenerativeModel' || // GenAI
      value.constructor?.name === 'GoogleGenAI' ||     // GenAI
      (value.serverTimestamp && typeof value.serverTimestamp === 'function')
    ) {
      return undefined;
    }

    // Special check for Event objects
    if (value.target && value.bubbles !== undefined) {
      return "[Event]";
    }

    return replacer ? replacer(key, value) : value;
  };

  try {
    return JSON.stringify(obj, internalReplacer, space);
  } catch (e) {
    console.error("Critical stringify failure, returning fallback:", e);
    return "{ \"error\": \"serialization_failed\" }";
  }
};

export const safeJsonParse = <T>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return fallback;
  }
};
