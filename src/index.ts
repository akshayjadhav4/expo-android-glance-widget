class WidgetStorage {
  static set(
    key: string,
    value:
      | string
      | boolean
      | number
      | string[]
      | Record<string, string | number>
      | Array<Record<string, string | number>>
  ): boolean {
    // Dummy implementation for iOS/Web
    return false;
  }

  static get(
    key: string
  ):
    | string
    | boolean
    | number
    | string[]
    | Record<string, string | number>
    | Array<Record<string, string | number>>
    | null {
    // Dummy implementation for iOS/Web
    return null;
  }

  static remove(key: string): void {
    // Dummy implementation for iOS/Web
  }

  static has(key: string): boolean {
    // Dummy implementation for iOS/Web
    return false;
  }

  static clear(): void {
    // Dummy implementation for iOS/Web
  }

  static getAllKeys(): string[] {
    // Dummy implementation for iOS/Web
    return [];
  }

  static updateWidget(receiverClassName: string): void {
    // Dummy implementation for iOS/Web
  }
}

export { WidgetStorage };
