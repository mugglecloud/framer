/**
 * @internal
 */
export function isWithPackage(target) {
    return target && "package" in target;
}
