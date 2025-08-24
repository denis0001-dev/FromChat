export type Platform = "win32" | "darwin" | "linux"

export interface ElectronInterface {
    desktop: true,
    platform: Platform
}

declare global {
    interface Window {
        electronInterface: ElectronInterface
    }
}