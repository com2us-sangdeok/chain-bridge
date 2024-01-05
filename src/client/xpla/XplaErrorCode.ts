export enum XplaErrorCode {
  // ErrTxDecode is returned if we cannot parse a transaction
  "tx parse error" = 2,

  // ErrInvalidSequence is used the sequence number (nonce) is incorrect
  // for the signature
  "invalid sequence",

  // ErrUnauthorized is used whenever a request without sufficient
  // authorization is handled.
  "unauthorized",

  // ErrInsufficientFunds is used when the account cannot pay requested amount.
  "insufficient funds",

  // ErrUnknownRequest to doc
  "unknown request",

  // ErrInvalidAddress to doc
  "invalid address",

  // ErrInvalidPubKey to doc
  "invalid pubkey",

  // ErrUnknownAddress to doc
  "unknown address",

  // ErrInvalidCoins to doc
  "invalid coins",

  // ErrOutOfGas to doc
  "out of gas",

  // ErrMemoTooLarge to doc
  "memo too large",

  // ErrInsufficientFee to doc
  "insufficient fee",

  // ErrTooManySignatures to doc
  "maximum number of signatures exceeded",

  // ErrNoSignatures to doc
  "no signatures supplied",

  // ErrJSONMarshal defines an ABCI typed JSON marshaling error
  "failed to marshal JSON bytes",

  // ErrJSONUnmarshal defines an ABCI typed JSON unmarshalling error
  "failed to unmarshal JSON bytes",

  // ErrInvalidRequest defines an ABCI typed error where the request contains
  // invalid data.
  "invalid request",

  // ErrTxInMempoolCache defines an ABCI typed error where a tx already exists
  // in the mempool.
  "tx already in mempool",

  // ErrMempoolIsFull defines an ABCI typed error where the mempool is full.
  "mempool is full",

  // ErrTxTooLarge defines an ABCI typed error where tx is too large.
  "tx too large",

  // ErrKeyNotFound defines an error when the key doesn't exist
  "key not found",

  // ErrWrongPassword defines an error when the key password is invalid.
  "invalid account password",

  // ErrorInvalidSigner defines an error when the tx intended signer does not match the given signer.
  "tx intended signer does not match the given signer",

  // ErrorInvalidGasAdjustment defines an error for an invalid gas adjustment
  "invalid gas adjustment",

  // ErrInvalidHeight defines an error for an invalid height
  "invalid height",

  // ErrInvalidVersion defines a general error for an invalid version
  "invalid version",

  // ErrInvalidChainID defines an error when the chain-id is invalid.
  "invalid chain-id",

  // ErrInvalidType defines an error an invalid type.
  "invalid type",

  // ErrTxTimeoutHeight defines an error for when a tx is rejected out due to an
  // explicitly set timeout height.
  "tx timeout height",

  // ErrUnknownExtensionOptions defines an error for unknown extension options.
  "unknown extension options",

  // ErrWrongSequence defines an error where the account sequence defined in
  // the signer info doesn't match the account's actual sequence number.
  "incorrect account sequence",

  // ErrPackAny defines an error when packing a protobuf message to Any fails.
  "failed packing protobuf message to Any",

  // ErrUnpackAny defines an error when unpacking a protobuf message from Any fails.
  "failed unpacking protobuf message from Any",

  // ErrLogic defines an internal logic error, e.g. an invariant or assertion
  // that is violated. It is a programmer error, not a user-facing error.
  "internal logic error",

  // ErrConflict defines a conflict error, e.g. when two goroutines try to access
  // the same resource and one of them fails.
  "conflict",

  // ErrNotSupported is returned when we call a branch of a code which is currently not
  // supported.
  "feature not supported",

  // ErrNotFound defines an error when requested entity doesn't exist in the state.
  "not found",

  // ErrIO should be used to wrap internal errors caused by external operation.
  // Examples: not DB domain error, file writing etc...
  "Internal IO error",

  // ErrAppConfig defines an error occurred if application configuration is
  // misconfigured.
  "error in app.toml",

  // ErrInvalidGasLimit defines an error when an invalid GasWanted value is
  // supplied.
  "invalid gas limit",
}