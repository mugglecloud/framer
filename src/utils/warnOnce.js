const warningMessages = new Set();
export function warnOnce(message) {
    if (warningMessages.has(message)) {
        return;
    }
    warningMessages.add(message);
    // tslint:disable-next-line:no-console
    console.warn(message);
}
