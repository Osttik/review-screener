import { IpcRenderer } from "electron";

export const IPCRenderer: IpcRenderer = (window as any).electron.ipcRenderer;