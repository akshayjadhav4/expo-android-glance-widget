// Dummy implementation for iOS/Web platforms
const ExpoAndroidGlanceWidgetModule = {
  setString(key: string, value: string): void {
    // No-op for iOS/Web
  },
  setBoolean(key: string, value: boolean): void {
    // No-op for iOS/Web
  },
  setInt(key: string, value: number): void {
    // No-op for iOS/Web
  },
  setLong(key: string, value: number): void {
    // No-op for iOS/Web
  },
  setFloat(key: string, value: number): void {
    // No-op for iOS/Web
  },
  setStringSet(key: string, value: string[]): void {
    // No-op for iOS/Web
  },
  setObject(key: string, data: Record<string, any>): boolean {
    // No-op for iOS/Web
    return false;
  },
  setArray(key: string, data: Array<any>): boolean {
    // No-op for iOS/Web
    return false;
  },
  get(key: string): any {
    // No-op for iOS/Web
    return null;
  },
  hasKey(key: string): boolean {
    // No-op for iOS/Web
    return false;
  },
  removeKey(key: string): void {
    // No-op for iOS/Web
  },
  clearAll(): void {
    // No-op for iOS/Web
  },
  getAllKeys(): string[] {
    // No-op for iOS/Web
    return [];
  },
  updateWidget(receiverClassName: string): void {
    // No-op for iOS/Web
  },
};

export default ExpoAndroidGlanceWidgetModule;
