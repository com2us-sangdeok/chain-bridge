import {ChainBridgeError} from "./ChainBridgeError";

/**
 * Thrown when consumer specifies driver type that does not exist or supported.
 */
export class MissingClientError extends ChainBridgeError {
    constructor(clientType: string, availableClients: string[] = []) {
        super(
            `Wrong client: "${clientType}" given. Supported clients are: ` +
                `${availableClients.map((d) => `"${d}"`).join(", ")}.`,
        )
    }
}
