export interface TerraClientConfig {
    /**
     * Blockchain node url where perform terra to.
     */
    readonly nodeURL?: string

    /**
     * Chain ID of the blockchain to connect to.
     */
    readonly chainID?: string

    /**
     * set to true to connect terra-classic chain
     */
    readonly isClassic?: boolean
}
