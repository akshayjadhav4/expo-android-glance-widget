import {
  ConfigPlugin,
  withDangerousMod,
  WarningAggregator,
} from "@expo/config-plugins";
import fs from "fs";
import path from "path";

import { toSnakeCase, validateWidgetName, WIDGET_SRC } from "./utils";
import { Widget } from "./types";

/**
 * Expo config plugin to configure Android widget layouts (preview and initial)
 */
export const withWidgetLayouts: ConfigPlugin<Widget> = (
  config,
  { widgetProviderInfo, widgetClassName }
) => {
  // validate widgetClassName
  validateWidgetName(widgetClassName);
  const widgetName = widgetClassName;

  return withDangerousMod(config, [
    "android",
    async (config) => {
      try {
        // Base Path
        const projectRoot = config.modRequest.projectRoot;

        // Path to the widgets/res/layout directory (outside Android)
        const widgetLayoutDir = path.join(
          projectRoot,
          WIDGET_SRC,
          "res",
          "layout"
        );

        // Create the widgets/res/layout directory if it doesn't exist
        if (!fs.existsSync(widgetLayoutDir)) {
          try {
            fs.mkdirSync(widgetLayoutDir, { recursive: true });
            // console.log(
            //   `📁 Created widgets/res/layout directory: ${widgetLayoutDir}`
            // );
          } catch (error) {
            WarningAggregator.addWarningAndroid(
              "withWidgetLayouts",
              `Failed to create widgets/res/layout directory: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        // Default widget preview layout content (2x2 size - simple name and description)
        const previewLayoutContent = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="12dp"
    android:gravity="center"
    android:background="#FFFFFF">

    <!-- Widget Title -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="${widgetName}"
        android:textSize="16sp"
        android:textStyle="bold"
        android:textColor="#333333"
        android:layout_marginBottom="4dp"
        android:gravity="center" />

    <!-- Widget Description -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Widget Preview"
        android:textSize="12sp"
        android:textColor="#666666"
        android:gravity="center" />

</LinearLayout>`;

        // Default widget initial layout content (2x2 size - simple name and description)
        const initialLayoutContent = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="12dp"
    android:gravity="center"
    android:background="#FFFFFF">

    <!-- Widget Title -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="${widgetName}"
        android:textSize="16sp"
        android:textStyle="bold"
        android:textColor="#333333"
        android:layout_marginBottom="4dp"
        android:gravity="center" />

    <!-- Widget Description -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Widget Content"
        android:textSize="12sp"
        android:textColor="#666666"
        android:gravity="center" />

</LinearLayout>`;

        // Write the preview layout file to widgets/res/layout directory
        const previewLayoutPath = path.join(
          widgetLayoutDir,
          `${toSnakeCase(widgetName)}_preview_layout.xml`
        );

        // Write the initial layout file to widgets/res/layout directory
        const initialLayoutPath = path.join(
          widgetLayoutDir,
          `${toSnakeCase(widgetName)}_initial_layout.xml`
        );

        try {
          // Save preview layout
          fs.writeFileSync(previewLayoutPath, previewLayoutContent);
          // console.log(`✅ Created widget preview layout: ${previewLayoutPath}`);

          // Save initial layout
          fs.writeFileSync(initialLayoutPath, initialLayoutContent);
          // console.log(`✅ Created widget initial layout: ${initialLayoutPath}`);
        } catch (error) {
          WarningAggregator.addWarningAndroid(
            "withWidgetLayouts",
            `Failed to write widget layout files: ${error instanceof Error ? error.message : String(error)}`
          );
        }

        return config;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to configure widget layouts: ${errorMessage}`);
      }
    },
  ]);
};
