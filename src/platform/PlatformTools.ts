import path from "path";

/**
 * Platform-specific tools.
 */
export class PlatformTools {
  /**
   * Type of the currently running platform.
   */
  static type: "browser" | "node" = "node"

  /**
   * Loads ("require"-s) given file or package.
   * This operation only supports on node platform
   */
  static load(name: string): any {
    try {
      // switch case to explicit require statements for webpack compatibility.
      switch (name) {
        case "ethereum":
        case "polygon":
          return require("web3")
        case "xpla":
          return require("@xpla/xpla.js")
      }
    } catch (err) {
      return require(path.resolve(
        process.cwd() + "/node_modules/" + name,
      ))
    }

    throw new TypeError(`Invalid Package for PlatformTools.load: ${name}`)
  }
}
