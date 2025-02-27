/**
 * Utility functions for rate limiting
 */

/**
 * A simple rate limiter to prevent spam
 */
export class RateLimiter {
  private userTimestamps: Map<string, number>;
  private limitSeconds: number;

  /**
   * Creates a new rate limiter
   * @param limitSeconds The number of seconds to limit requests
   */
  constructor(limitSeconds: number) {
    this.userTimestamps = new Map<string, number>();
    this.limitSeconds = limitSeconds;
  }

  /**
   * Checks if a user is rate limited
   * @param userId The user ID to check
   * @returns True if the user is rate limited, false otherwise
   */
  isRateLimited(userId: string): boolean {
    const now = Date.now();
    const lastMessageTime = this.userTimestamps.get(userId) || 0;
    return now - lastMessageTime < this.limitSeconds * 1000;
  }

  /**
   * Updates the timestamp for a user
   * @param userId The user ID to update
   */
  updateTimestamp(userId: string): void {
    this.userTimestamps.set(userId, Date.now());
  }

  /**
   * Resets the rate limiter for a user
   * @param userId The user ID to reset
   */
  resetUser(userId: string): void {
    this.userTimestamps.delete(userId);
  }

  /**
   * Resets the rate limiter for all users
   */
  resetAll(): void {
    this.userTimestamps.clear();
  }
}
