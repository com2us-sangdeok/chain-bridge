export class ChainBridgeError extends Error {
    get name() {
        return this.constructor.name
    }

    constructor(message?: string) {
        super(message)

        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, new.target.prototype)
        } else {
            ;(this as any).__proto__ = new.target.prototype
        }
    }
}
