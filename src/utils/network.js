/**
 * @alpha
 */
export function loadJSON(url) {
    return fetch(url, { mode: "cors" }).then(res => res.json());
}
