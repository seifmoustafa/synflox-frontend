// ============================================================================
// SYNFLOX Domain Enums
// ============================================================================

/**
 * Admin session policy for company admins.
 */
export enum AdminSessionPolicy {
  /** Only one session allowed at a time */
  SingleSession = 0,
  /** Multiple sessions allowed but user is warned */
  MultipleWithWarning = 1,
  /** Multiple sessions fully allowed */
  MultipleAllowed = 2
}

/**
 * Concurrent access mode for device licensing.
 */
export enum ConcurrentAccessMode {
  /** Only one device at a time */
  SingleDevice = 0,
  /** Limited concurrent devices based on MaxConcurrentDevices */
  LimitedConcurrent = 1,
  /** Unlimited concurrent devices */
  Unlimited = 2,
  /** All users active within time window */
  TimeBasedAll = 3,
  /** Limited users within time window */
  TimeBasedLimited = 4
}

/**
 * Reason for session ending.
 */
export enum SessionEndReason {
  /** User logged out */
  Logout = 0,
  /** Session expired */
  Timeout = 1,
  /** User was inactive too long */
  Inactivity = 2,
  /** Admin terminated the session */
  AdminTerminated = 3,
  /** New session started (single session policy) */
  NewSessionStarted = 4,
  /** Password was changed */
  PasswordChanged = 5,
  /** Account was deactivated */
  AccountDeactivated = 6
}
