export function isRectProviding(c) {
    return "rect" in c && c.rect instanceof Function;
}
export function rectFromReactNode(node) {
    if (!node ||
        node === true ||
        typeof node === "number" ||
        typeof node === "string" ||
        typeof node["type"] === "string") {
        return null;
    }
    const type = node["type"];
    const props = node["props"];
    if (type && props && isRectProviding(type)) {
        return type.rect(props);
    }
    else {
        return null;
    }
}
