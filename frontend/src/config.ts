/**
 * @fileoverview Application configuration constants
 * @description Contains all configuration values used throughout the application
 * @author Cursor
 * @version 1.0.0
 */

/**
 * Base API endpoint for all backend requests
 * @type {string}
 * @constant
 */
export const API_BASE_URL: string = '/api';

/**
 * Full API URL including hostname and port for WebSocket connections
 * @type {string}
 * @constant
 */
export const API_FULL_BASE_URL: string = `${location.host}/api`;

/**
 * Application name displayed in UI and document title
 * @type {string}
 * @constant
 */
export const PRODUCT_NAME: string = "FromChat";