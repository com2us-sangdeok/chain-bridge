export interface TerraClientConfig {
    /**
     * Connection node url where perform connection to.
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
