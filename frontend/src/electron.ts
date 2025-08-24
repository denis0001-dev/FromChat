import "../electron.d.ts";
import { PRODUCT_NAME } from "./config";

if (window.electronInterface !== undefined) {
    console.log("Running in Electron");
    document.documentElement.classList.add("electron", `platform-${window.electronInterface.platform}`);
    document.getElementById("window-title")!.textContent = PRODUCT_NAME;
} else {
    console.log("Running in normal browser");
}