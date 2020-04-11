const cache = new Set();
let styleElement;
/**
 * Add CSS to the document.
 *
 * @param css - CSS to add to the document
 */
export function add(css) {
  if (cache.has(css) || typeof document === "undefined") return;
  cache.add(css);
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.type = "text/css";
    document.head && document.head.appendChild(styleElement);
  }
  styleElement.appendChild(document.createTextNode(css));
}
