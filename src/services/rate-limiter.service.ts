/**
 * Rate limiter service
 */

import { RateLimiter } from '../utils/rate-limiter.utils';
import { RATE_LIMIT_SECONDS } from '../config/constants';

/**
 * Service for managing rate limiting
 */
export class RateLimiterService {
  private rateLimiter: RateLimiter;
  private static instance: RateLimiterService;

  /**
   * Creates a new rate limiter service
   */
  private constructor() {
    this.rateLimiter = new RateLimiter(RATE_LIMIT_SECONDS);
  }

  /**
   * Gets the rate limiter service instance (singleton)
   * @returns The rate limiter service instance
   */
  public static getInstance(): RateLimiterService {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService();
    }
    return RateLimiterService.instance;
  }

  /**
   * Gets the rate limiter
   * @returns The rate limiter
   */
  public getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }
}
