// Utility function to safely check if an element has a closest method
export const safeClosest = (element: any, selector: string): Element | null => {
  if (!element || typeof element.closest !== 'function') {
    return null;
  }
  return element.closest(selector);
};

// Utility function to safely check if an element contains another
export const safeContains = (container: any, element: any): boolean => {
  if (!container || !element || typeof container.contains !== 'function') {
    return false;
  }
  return container.contains(element);
};