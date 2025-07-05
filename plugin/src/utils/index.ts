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

/* 
  Attribute to API Level Mapping 
  Docs: https://developer.android.com/reference/android/appwidget/AppWidgetProviderInfo#widgetCategory
*/
export const ATTRIBUTE_API_LEVELS = {
  // API 3
  minWidth: 3,
  minHeight: 3,
  updatePeriodMillis: 3,
  initialLayout: 3,
  configure: 3,
  // API 11
  previewImage: 11,
  // API 12
  resizeMode: 12,
  // API 14
  minResizeWidth: 14,
  minResizeHeight: 14,
  // API 17
  widgetCategory: 17,
  initialKeyguardLayout: 17,
  // API 28
  widgetFeatures: 28,
  // API 31
  previewLayout: 31,
  targetCellWidth: 31,
  targetCellHeight: 31,
  maxResizeWidth: 31,
  maxResizeHeight: 31,
  description: 31,
} as const;

// minimum API level
export const BASE_API_LEVEL = 21;

/**
 * Get the required API levels for a list of attributes
 */
export function getRequiredApiLevels(attributes: string[]): number[] {
  const apiLevels = new Set<number>();

  for (const attribute of attributes) {
    const apiLevel =
      ATTRIBUTE_API_LEVELS[attribute as keyof typeof ATTRIBUTE_API_LEVELS];
    if (apiLevel) {
      apiLevels.add(apiLevel);
    }
  }

  return Array.from(apiLevels).sort((a, b) => a - b);
}

/**
 * Get the API level directories that should be created based on widget attributes
 */
export function getApiLevelDirectories(
  attributes: Record<string, any>
): { directory: string; apiLevel: number }[] {
  const requiredApiLevels = getRequiredApiLevels(Object.keys(attributes));
  const directories: { directory: string; apiLevel: number }[] = [];

  // Always include base directory (contains all attributes up to API 21)
  directories.push({ directory: "xml", apiLevel: BASE_API_LEVEL });

  // Add API-specific directories only for levels > BASE_API_LEVEL that have attributes
  const higherApiLevels = requiredApiLevels.filter(
    (level) => level > BASE_API_LEVEL
  );

  for (const apiLevel of higherApiLevels) {
    directories.push({
      directory: `xml-v${apiLevel}`,
      apiLevel: apiLevel,
    });
  }

  return directories;
}

/**
 * Get attributes that should be included for a specific API level
 * For base directory (API 21): includes all attributes with API level ≤ 21
 * For versioned directories: includes all attributes with API level ≤ target API level
 */
export function getAttributesForApiLevel(
  attributes: Record<string, any>,
  targetApiLevel: number
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [attribute, value] of Object.entries(attributes)) {
    // Skip null, undefined, empty string values and special cases
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      attribute === "previewImageFileName"
    ) {
      continue;
    }

    const requiredApiLevel =
      ATTRIBUTE_API_LEVELS[attribute as keyof typeof ATTRIBUTE_API_LEVELS];
    if (requiredApiLevel && requiredApiLevel <= targetApiLevel) {
      result[attribute] = value;
    }
  }

  return result;
}
