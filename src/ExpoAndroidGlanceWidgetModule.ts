import { NativeModule, requireNativeModule } from "expo";

import { ExpoAndroidGlanceWidgetModuleEvents } from "./ExpoAndroidGlanceWidget.types";

declare class ExpoAndroidGlanceWidgetModule extends NativeModule<ExpoAndroidGlanceWidgetModuleEvents> {
  setString(key: string, value: string): void;
  setBoolean(key: string, value: boolean): void;
  setInt(key: string, value: number): void;
  setLong(key: string, value: number): void;
  setFloat(key: string, value: number): void;
  setStringSet(key: string, value: string[]): void;
  setObject(key: string, data: Record<string, any>): boolean;
  setArray(key: string, data: Array<any>): boolean;
  get(key: string): any;
  hasKey(key: string): boolean;
  removeKey(key: string): void;
  clearAll(): void;
  getAllKeys(): string[];
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAndroidGlanceWidgetModule>(
  "ExpoAndroidGlanceWidget"
);
