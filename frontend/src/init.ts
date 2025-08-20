import { showLogin } from "./auth";
import { PRODUCT_NAME } from "./config";

showLogin();

document.getElementById("productname")!.textContent = PRODUCT_NAME;
document.title = PRODUCT_NAME;