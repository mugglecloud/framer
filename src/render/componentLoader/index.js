import { localPackageFallbackIdentifier } from "./package";
export * from "./definition";
// TODO: Don't store state globally.
/**
 * @internal
 */
export const componentLoader = {
    componentForIdentifier: (identifier) => {
        return null;
    },
    componentsForPackage: (packageIdentifier) => {
        return [];
    },
    componentIdentifiers: () => {
        return [];
    },
    errorForIdentifier: (identifier) => {
        return null;
    },
    forEachComponent: (cb) => { },
    forEachDesignComponents: (cb) => { },
    localPackageIdentifier: () => {
        return localPackageFallbackIdentifier;
    },
    packageDisplayName: (packageIdentifier) => {
        return undefined;
    },
    packageIdentifiers: () => {
        return [];
    },
    tokensForPackage: (packageIdentifier) => {
        return {};
    },
    packageFileNames: (packageIdentifier) => {
        return [];
    },
};
