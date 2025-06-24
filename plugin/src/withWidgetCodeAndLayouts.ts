import {
  ConfigPlugin,
  withDangerousMod,
  WarningAggregator,
} from "@expo/config-plugins";
import fs from "fs";
import path from "path";

import { toSnakeCase, validateWidgetName, WIDGET_SRC } from "./utils";
import { Widget } from "./types";

interface GlanceConfig {
  widgets: Widget[];
}

interface WidgetFile {
  name: string;
  content: string;
  type: "kotlin" | "layout";
}

const getKotlinFiles = (
  widgetName: string,
  packageName: string
): WidgetFile[] => [
  {
    name: `${widgetName}.kt`,
    type: "kotlin",
    content: `package ${packageName}.${WIDGET_SRC}

import android.content.Context
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.components.Scaffold
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.padding
import androidx.glance.text.Text
import androidx.glance.text.TextStyle

class ${widgetName} : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {

        // In this method, load data needed to render the AppWidget.
        // Use withContext to switch to another thread for long running
        // operations.

        provideContent {
            GlanceTheme {
                Scaffold(backgroundColor = GlanceTheme.colors.widgetBackground, modifier = GlanceModifier.padding(16.dp)){
                    Text("Hello Widget", style = TextStyle(color = GlanceTheme.colors.onSurface))
                }
            }
        }
    }
}
`,
  },
  {
    name: `${widgetName}Receiver.kt`,
    type: "kotlin",
    content: `package ${packageName}.${WIDGET_SRC}

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

class ${widgetName}Receiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = ${widgetName}()
}
`,
  },
];

const getLayoutFiles = (widgetName: string): WidgetFile[] => {
  const widgetNameSnakeCase = toSnakeCase(widgetName);

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

  return [
    {
      name: `${widgetNameSnakeCase}_preview_layout.xml`,
      type: "layout",
      content: previewLayoutContent,
    },
    {
      name: `${widgetNameSnakeCase}_initial_layout.xml`,
      type: "layout",
      content: initialLayoutContent,
    },
  ];
};

/**
 * Helper function to get Android project paths
 */
const getAndroidProjectPaths = (config: any, packageName: string) => {
  const platformProjectRoot = config.modRequest.platformProjectRoot;
  return {
    widgetPkgPath: path.join(
      platformProjectRoot,
      "app",
      "src",
      "main",
      "java",
      ...packageName.split("."),
      WIDGET_SRC
    ),
    androidLayoutDir: path.join(
      platformProjectRoot,
      "app",
      "src",
      "main",
      "res",
      "layout"
    ),
  };
};

/**
 * Expo config plugin to generate Kotlin code and XML layouts for all Android Glance widgets
 * and sync them to the Android project
 */
export const withWidgetCodeAndLayouts: ConfigPlugin<GlanceConfig> = (
  config,
  { widgets }
) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      try {
        // Validate input
        if (!widgets || !Array.isArray(widgets) || widgets.length === 0) {
          throw new Error(
            "GlanceConfig.widgets is required and must be a non-empty array"
          );
        }

        // Get package name
        const packageName = config?.android?.package;
        if (!packageName) {
          throw new Error(
            "Could not find package name. Please set the package name in your app.json or app.config.js file."
          );
        }

        // Base paths
        const projectRoot = config.modRequest.projectRoot;
        const widgetSrcPath = path.join(projectRoot, WIDGET_SRC);
        const widgetLayoutDir = path.join(widgetSrcPath, "res", "layout");

        // Android project paths
        const { widgetPkgPath, androidLayoutDir } = getAndroidProjectPaths(
          config,
          packageName
        );

        // Create root directory structure for widgets
        if (!fs.existsSync(widgetSrcPath)) {
          try {
            fs.mkdirSync(widgetSrcPath, { recursive: true });
          } catch (error) {
            throw new Error(
              `Failed to create widgets directory: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        if (!fs.existsSync(widgetLayoutDir)) {
          try {
            fs.mkdirSync(widgetLayoutDir, { recursive: true });
          } catch (error) {
            throw new Error(
              `Failed to create widgets/res/layout directory: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        // Create Android project directories
        if (!fs.existsSync(widgetPkgPath)) {
          try {
            fs.mkdirSync(widgetPkgPath, { recursive: true });
          } catch (error) {
            throw new Error(
              `Failed to create Android widgets package directory: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        if (!fs.existsSync(androidLayoutDir)) {
          try {
            fs.mkdirSync(androidLayoutDir, { recursive: true });
          } catch (error) {
            throw new Error(
              `Failed to create Android layout directory: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        // Process each widget
        const errors: string[] = [];
        const copyErrors: string[] = [];
        let filesCreated = 0;
        let filesSkipped = 0;
        let filesCopied = 0;

        for (const widget of widgets) {
          try {
            const { widgetClassName } = widget;

            // Validate widget name
            validateWidgetName(widgetClassName);
            const widgetName = widgetClassName;

            // Get all files for this widget
            const kotlinFiles = getKotlinFiles(widgetName, packageName);
            const layoutFiles = getLayoutFiles(widgetName);
            const allFiles = [...kotlinFiles, ...layoutFiles];

            // Create files for this widget in widgets/ directory
            for (const file of allFiles) {
              const filePath =
                file.type === "kotlin"
                  ? path.join(widgetSrcPath, file.name)
                  : path.join(widgetLayoutDir, file.name);

              if (!fs.existsSync(filePath)) {
                try {
                  fs.writeFileSync(filePath, file.content);
                  filesCreated++;
                } catch (error) {
                  errors.push(
                    `Failed to create ${file.type} file ${file.name} for widget ${widgetName}: ${error instanceof Error ? error.message : String(error)}`
                  );
                }
              } else {
                filesSkipped++;
              }
            }

            // Copy layout files to Android project (always overwrite)
            for (const file of allFiles) {
              if (file.type === "layout") {
                try {
                  const srcPath = path.join(widgetLayoutDir, file.name);
                  const destPath = path.join(androidLayoutDir, file.name);

                  // Copy file if source exists
                  if (fs.existsSync(srcPath)) {
                    const content = fs.readFileSync(srcPath, "utf-8");
                    fs.writeFileSync(destPath, content);
                    filesCopied++;
                  }
                } catch (error) {
                  copyErrors.push(
                    `Failed to copy layout file ${file.name} for widget ${widgetName}: ${error instanceof Error ? error.message : String(error)}`
                  );
                }
              }
            }
          } catch (error) {
            errors.push(
              `Failed to process widget ${widget.widgetClassName}: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        // Copy ALL Kotlin files from widgets/ folder to Android project
        try {
          if (fs.existsSync(widgetSrcPath)) {
            const kotlinFiles = fs
              .readdirSync(widgetSrcPath)
              .filter((file) => file.endsWith(".kt"));

            for (const kotlinFile of kotlinFiles) {
              try {
                const srcPath = path.join(widgetSrcPath, kotlinFile);
                const destPath = path.join(widgetPkgPath, kotlinFile);

                // Always overwrite Kotlin files
                const content = fs.readFileSync(srcPath, "utf-8");
                fs.writeFileSync(destPath, content);
                filesCopied++;
              } catch (error) {
                copyErrors.push(
                  `Failed to copy Kotlin file ${kotlinFile}: ${error instanceof Error ? error.message : String(error)}`
                );
              }
            }
          }
        } catch (error) {
          copyErrors.push(
            `Failed to scan widgets directory for Kotlin files: ${error instanceof Error ? error.message : String(error)}`
          );
        }

        // Report results
        if (errors.length > 0) {
          for (const error of errors) {
            console.error(`[Creation Error] ${error}`);
          }
        }

        if (copyErrors.length > 0) {
          for (const error of copyErrors) {
            console.error(`[Copy Error] ${error}`);
          }
        }

        return config;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed to generate widget code and layouts: ${errorMessage}`
        );
      }
    },
  ]);
};
