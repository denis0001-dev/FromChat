/**
 * @fileoverview Application initialization logic
 * @description Handles initial application setup and state
 * @author FromChat Team
 * @version 1.0.0
 */

import { showLogin } from "./auth";
import { PRODUCT_NAME } from "./config";

showLogin();
document.getElementById("productname")!.textContent = PRODUCT_NAME;
document.title = PRODUCT_NAME;