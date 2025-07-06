import {
  ConfigPlugin,
  withDangerousMod,
  withStringsXml,
} from "@expo/config-plugins";
import fs from "fs";
import path from "path";

import {
  toSnakeCase,
  validateWidgetName,
  getApiLevelDirectories,
  getAttributesForApiLevel,
} from "./utils";
import { Widget } from "./types";

const DESCRIPTION_SUFFIX = "_description";
const DEFAULT_DESCRIPTION = "Widget";

interface GlanceConfig {
  widgets: Widget[];
}

/**
 * Expo config plugin to configure Android widget provider information for all widgets
 */
export const withWidgetProviderInfo: ConfigPlugin<GlanceConfig> = (
  config,
  { widgets }
) => {
  // Validate input
  if (!widgets || !Array.isArray(widgets) || widgets.length === 0) {
    throw new Error(
      "GlanceConfig.widgets is required and must be a non-empty array"
    );
  }

  // Process string resources for all widgets
  withStringsXml(config, (config) => {
    // Ensure resources.string exists
    config.modResults.resources.string ??= [];
    const strings = config.modResults.resources.string;

    // Process each widget
    for (const widget of widgets) {
      const { widgetClassName, widgetProviderInfo, configurationActivity } =
        widget;

      // Validate widget name
      validateWidgetName(widgetClassName);
      const widgetName = widgetClassName;
      const widgetNameSnakeCase = toSnakeCase(widgetName);

      if (!widgetProviderInfo || typeof widgetProviderInfo !== "object") {
        throw new Error(
          `Widget provider info is required for widget: ${widgetName}`
        );
      }

      const rawDescription = widgetProviderInfo.description?.trim();
      const generatedKey =
        rawDescription && rawDescription.length > 0
          ? rawDescription
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[^\w]/g, "")
          : widgetNameSnakeCase;

      // Create key from description only
      const finalKey = `${generatedKey}${DESCRIPTION_SUFFIX}`;

      if (generatedKey) {
        const value = rawDescription ?? DEFAULT_DESCRIPTION;

        const existing = strings.find((s) => s.$.name === finalKey);
        if (existing) {
          // console.log(`🔁 Updating existing string: ${finalKey}`);
          existing._ = value;
        } else {
          // console.log(`🆕 Adding new string: ${finalKey}`);
          strings.push({
            $: { name: finalKey },
            _: value,
          });
        }
      }
    }

    return config;
  });

  return withDangerousMod(config, [
    "android",
    async (config) => {
      try {
        // Get package name
        const packageName = config?.android?.package;
        if (!packageName) {
          throw new Error(
            "Could not find package name. Please set the package name in your app.json or app.config.js file."
          );
        }

        // Base Path
        const platformProjectRoot = config.modRequest.platformProjectRoot;
        const resDir = path.join(
          platformProjectRoot,
          "app",
          "src",
          "main",
          "res"
        );

        // Process each widget
        const errors: string[] = [];
        let xmlFilesCreated = 0;

        for (const widget of widgets) {
          try {
            const {
              widgetClassName,
              widgetProviderInfo,
              configurationActivity,
            } = widget;

            // Validate widget name
            validateWidgetName(widgetClassName);
            const widgetName = widgetClassName;
            const widgetNameSnakeCase = toSnakeCase(widgetName);

            if (!widgetProviderInfo || typeof widgetProviderInfo !== "object") {
              throw new Error(
                `Widget provider info is required for widget: ${widgetName}`
              );
            }

            const rawDescription = widgetProviderInfo.description?.trim();
            const generatedKey =
              rawDescription && rawDescription.length > 0
                ? rawDescription
                    .toLowerCase()
                    .replace(/\s+/g, "_")
                    .replace(/[^\w]/g, "")
                : widgetNameSnakeCase;

            // Get API level directories needed for this widget
            const apiLevelDirectories =
              getApiLevelDirectories(widgetProviderInfo);

            // Create XML files for each required API level
            for (const { directory, apiLevel } of apiLevelDirectories) {
              const xmlDirPath = path.join(resDir, directory);

              // Create the xml directory if it doesn't exist
              if (!fs.existsSync(xmlDirPath)) {
                fs.mkdirSync(xmlDirPath, { recursive: true });
                // console.log(`📁 Created XML directory: ${xmlDirPath}`);
              }

              // Get attributes for this API level
              const apiLevelAttributes = getAttributesForApiLevel(
                widgetProviderInfo,
                apiLevel
              );

              // Generate XML attributes
              const attributes = Object.entries(apiLevelAttributes).map(
                ([key, value]) => {
                  if (key === "description") {
                    const descriptionKey = `${generatedKey}${DESCRIPTION_SUFFIX}`;
                    return `android:${key}="@string/${descriptionKey}"`;
                  }
                  return `android:${key}="${value}"`;
                }
              );

              // Add configuration activity if provided
              if (
                configurationActivity &&
                configurationActivity.trim() !== ""
              ) {
                const fullConfigurationActivity = `${packageName}.widgets.${configurationActivity}`;
                attributes.push(
                  `android:configure="${fullConfigurationActivity}"`
                );
              }

              // Always add initialLayout for API 3+ (all directories)
              if (apiLevel >= 3) {
                const initialLayoutName = `${widgetNameSnakeCase}_initial_layout`;
                attributes.push(
                  `android:initialLayout="@layout/${initialLayoutName}"`
                );
              }

              // Always add previewLayout for API 31+ (xml-v31 directories)
              if (apiLevel >= 31) {
                const previewLayoutName = `${widgetNameSnakeCase}_preview_layout`;
                attributes.push(
                  `android:previewLayout="@layout/${previewLayoutName}"`
                );
              }

              // Add previewImage only if previewImageFileName is provided and API 11+
              if (widgetProviderInfo.previewImageFileName && apiLevel >= 11) {
                attributes.push(
                  `android:previewImage="@drawable/${widgetProviderInfo.previewImageFileName}"`
                );
              }

              const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    ${attributes.join("\n    ")} />`;

              // Write the XML file
              const xmlPath = path.join(
                xmlDirPath,
                `${widgetNameSnakeCase}_info.xml`
              );
              fs.writeFileSync(xmlPath, xmlContent);
              xmlFilesCreated++;
              // console.log(`✅ Created widget XML (${directory}): ${xmlPath}`);
            }
          } catch (error) {
            errors.push(
              `Failed to process widget ${widget.widgetClassName}: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        // Report results
        if (errors.length > 0) {
          for (const error of errors) {
            console.error(error);
          }
        }

        // console.log(`📊 Created ${xmlFilesCreated} XML files across API levels`);

        return config;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed to configure widget provider info: ${errorMessage}`
        );
      }
    },
  ]);
};
