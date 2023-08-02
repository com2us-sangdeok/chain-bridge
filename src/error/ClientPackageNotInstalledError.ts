import { ChainBridgeError } from "./ChainBridgeError";

/**
 * Thrown when required client's package is not installed.
 */
export class ClientPackageNotInstalledError extends ChainBridgeError {
  constructor(driverName: string, packageName: string) {
    super(
      `${driverName} package has not been found installed. ` +
      `Try to install it: npm install ${packageName} --save`,
    )
  }
}
