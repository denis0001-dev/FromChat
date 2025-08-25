/**
 * @fileoverview Application configuration constants
 * @description Contains all configuration values used throughout the application
 * @author Cursor
 * @version 1.0.0
 */

/**
 * Base API endpoint for all backend requests
 * @constant
 */
export const API_BASE_URL = `${location.host || "https://fromchat.toolbox-io.ru"}/api`;

/**
 * Full API URL including hostname and port for WebSocket connections
 * @constant
 */
export const API_WS_BASE_URL = `${location.host || "fromchat.toolbox-io.ru"}/api`;

/**
 * Application name displayed in UI and document title
 * @constant
 */
export const PRODUCT_NAME = "FromChat";