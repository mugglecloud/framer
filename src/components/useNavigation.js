import { useContext } from "react";
import { NavigationContext } from "./Navigation";
/**
 * @returns NavigationInterface {@link NavigationInterface}
 * @beta
 */
export function useNavigation() {
    return useContext(NavigationContext);
}
