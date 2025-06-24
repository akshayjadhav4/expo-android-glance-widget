import {
  ConfigPlugin,
  withDangerousMod,
  withStringsXml,
} from "@expo/config-plugins";
import fs from "fs";
import path from "path";

import { toSnakeCase, validateWidgetName } from "./utils";
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
      const { widgetClassName, widgetProviderInfo } = widget;

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
        // Base Path
        const platformProjectRoot = config.modRequest.platformProjectRoot;

        // Path to the xml Directory
        const xmlDir = path.join(
          platformProjectRoot,
          "app",
          "src",
          "main",
          "res",
          "xml"
        );

        // create the xml directory if it doesn't exist
        if (!fs.existsSync(xmlDir)) {
          fs.mkdirSync(xmlDir, { recursive: true });
          // console.log(`📁 Created XML directory: ${xmlDir}`);
        }

        // Process each widget
        const errors: string[] = [];
        let xmlFilesCreated = 0;

        for (const widget of widgets) {
          try {
            const { widgetClassName, widgetProviderInfo } = widget;

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

            // Generate attributes
            const attributes = Object.entries(widgetProviderInfo)
              .filter(
                ([key, value]) =>
                  value !== null &&
                  value !== undefined &&
                  value !== "" &&
                  key !== "previewImageFileName"
              )
              .map(([key, value]) => {
                if (key === "description") {
                  const descriptionKey = `${generatedKey}${DESCRIPTION_SUFFIX}`;
                  return `android:${key}="@string/${descriptionKey}"`;
                }
                return `android:${key}="${value}"`;
              });

            // Add initial and preview layouts
            const initialLayoutName = `${widgetNameSnakeCase}_initial_layout`;
            const previewLayoutName = `${widgetNameSnakeCase}_preview_layout`;
            attributes.push(
              `android:initialLayout="@layout/${initialLayoutName}"`
            );
            attributes.push(
              `android:previewLayout="@layout/${previewLayoutName}"`
            );

            // Add preview image for Android 11 and lower if previewImageFileName provided
            if (widgetProviderInfo.previewImageFileName) {
              attributes.push(
                `android:previewImage="@drawable/${widgetProviderInfo.previewImageFileName}"`
              );
            }

            const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    ${attributes.join("\n    ")} />`;

            // write the xml file
            const xmlPath = path.join(
              xmlDir,
              `${widgetNameSnakeCase}_info.xml`
            );
            fs.writeFileSync(xmlPath, xmlContent);
            xmlFilesCreated++;
            // console.log(`✅ Created widget XML: ${xmlPath}`);
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
