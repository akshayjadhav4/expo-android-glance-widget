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

/**
 * Expo config plugin to configure Android widget provider information
 */
export const withWidgetProviderInfo: ConfigPlugin<Widget> = (
  config,
  { widgetProviderInfo, widgetClassName }
) => {
  // validate widgetClassName
  validateWidgetName(widgetClassName);
  const widgetName = widgetClassName;
  const widgetNameSnakeCase = toSnakeCase(widgetName);

  if (!widgetProviderInfo || typeof widgetProviderInfo !== "object") {
    throw new Error("Widget provider info is required");
  }

  const rawDescription = widgetProviderInfo.description?.trim();
  const generatedKey =
    rawDescription && rawDescription.length > 0
      ? rawDescription.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "")
      : widgetNameSnakeCase;

  withStringsXml(config, (config) => {
    // Create key from description only
    const finalKey = `${generatedKey}${DESCRIPTION_SUFFIX}`;

    if (generatedKey) {
      const value = rawDescription ?? DEFAULT_DESCRIPTION;

      // Ensure resources.string exists
      config.modResults.resources.string ??= [];
      const strings = config.modResults.resources.string;

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

        // Generate attributes
        const attributes = Object.entries(widgetProviderInfo)
          .filter(
            ([_, value]) =>
              value !== null && value !== undefined && value !== ""
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
        attributes.push(`android:initialLayout="@layout/${initialLayoutName}"`);
        attributes.push(`android:previewLayout="@layout/${previewLayoutName}"`);
        // TODO: Add preview image for Android 11 and lower
        // attributes.push(
        //   `android:previewImage="@drawable/widget_preview_${widgetNameSnakeCase}"`
        // );

        const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    ${attributes.join("\n    ")} />`;

        // write the xml file
        const xmlPath = path.join(xmlDir, `${widgetNameSnakeCase}_info.xml`);
        fs.writeFileSync(xmlPath, xmlContent);
        // console.log(`✅ Created widget XML: ${xmlPath}`);

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
