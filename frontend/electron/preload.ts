import { contextBridge } from "electron";
import type { ElectronInterface, Platform } from "../electron";

const electronInterface: ElectronInterface = {
    desktop: true,
    platform: process.platform as Platform
}

contextBridge.exposeInMainWorld("electronInterface", electronInterface);