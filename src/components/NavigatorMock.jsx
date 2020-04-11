import { warnOnce } from "../utils/warnOnce";
class NavigatorMock {
    constructor() {
        this.warning = () => {
            warnOnce("The Navigator API is only available inside of Framer X. Get it at https://www.framer.com/download");
        };
        this.goBack = () => this.warning();
        this.instant = () => this.warning();
        this.fade = () => this.warning();
        this.push = () => this.warning();
        this.modal = () => this.warning();
        this.overlay = () => this.warning();
        this.flip = () => this.warning();
        this.customTransition = () => this.warning();
    }
}
/**
 * @internal
 */
export const navigatorMock = new NavigatorMock();
