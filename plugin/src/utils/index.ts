export function toSnakeCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

export function validateWidgetName(widgetName: string): void {
  if (!widgetName) {
    throw new Error("Missing widgetName in plugin props.");
  }

  // Validate widget name format (should be a valid Kotlin class name)
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(widgetName)) {
    throw new Error(
      "Widget name must be a valid Kotlin class name (PascalCase, starting with uppercase letter, alphanumeric only)."
    );
  }
}

export const WIDGET_SRC = "widgets";
