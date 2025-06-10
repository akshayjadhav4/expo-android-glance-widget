import ExpoAndroidGlanceWidgetModule from "./ExpoAndroidGlanceWidgetModule";

class WidgetStorage {
  static set(key: string, value: string | boolean | number | string[]): void {
    if (typeof value === "string") {
      ExpoAndroidGlanceWidgetModule.setString(key, value);
    } else if (typeof value === "boolean") {
      ExpoAndroidGlanceWidgetModule.setBoolean(key, value);
    } else if (typeof value === "number") {
      // Check if it's an integer or float
      if (Number.isInteger(value)) {
        // Use setLong for large integers, setInt for smaller ones
        if (
          value > Number.MAX_SAFE_INTEGER ||
          value < Number.MIN_SAFE_INTEGER
        ) {
          ExpoAndroidGlanceWidgetModule.setLong(key, value);
        } else {
          ExpoAndroidGlanceWidgetModule.setInt(key, value);
        }
      } else {
        ExpoAndroidGlanceWidgetModule.setFloat(key, value);
      }
    } else if (Array.isArray(value)) {
      ExpoAndroidGlanceWidgetModule.setStringSet(key, value);
    }
  }

  static get(key: string): string | boolean | number | string[] | null {
    return ExpoAndroidGlanceWidgetModule.get(key);
  }

  static remove(key: string): void {
    ExpoAndroidGlanceWidgetModule.removeKey(key);
  }

  static has(key: string): boolean {
    return ExpoAndroidGlanceWidgetModule.hasKey(key);
  }

  static clear(): void {
    ExpoAndroidGlanceWidgetModule.clearAll();
  }

  static getAllKeys(): string[] {
    return ExpoAndroidGlanceWidgetModule.getAllKeys();
  }
}

export { WidgetStorage };
