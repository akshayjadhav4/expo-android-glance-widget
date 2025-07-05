import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
} from "@expo/config-plugins";
import fs from "fs";
import path from "path";
import { toSnakeCase, WIDGET_SRC } from "./utils";
import { GlanceConfig } from "./types";

function getReceiverClassNames(widgetDir: string): string[] {
  // Check if widgets directory exists
  if (!fs.existsSync(widgetDir)) {
    throw new Error(`Widgets directory not found at: ${widgetDir}`);
  }

  let files: string[];
  try {
    files = fs.readdirSync(widgetDir).filter((f) => f.endsWith("Receiver.kt"));
  } catch (error) {
    throw new Error(`Failed to read widgets directory: ${error}`);
  }

  if (files.length === 0) {
    throw new Error(`No *Receiver.kt files found in ${widgetDir}`);
  }

  const receiverRegex =
    /(?:abstract\s+)?class\s+(\w*Receiver)\s*(?:<[^>]*>)?\s*(?::\s*[^{]+)?/;

  return files.map((file) => {
    const filePath = path.join(widgetDir, file);
    let content: string;

    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }

    const match = receiverRegex.exec(content);
    if (!match?.[1]) {
      throw new Error(
        `Could not find receiver class declaration in ${file}. ` +
          `Expected class name ending with 'Receiver'.`
      );
    }

    return match[1];
  });
}

export const withWidgetManifest: ConfigPlugin<GlanceConfig> = (
  config,
  glanceConfig
) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = AndroidConfig.Manifest.getMainApplication(manifest);

    if (!app) {
      throw new Error("Main <application> not found in AndroidManifest.xml");
    }

    const widgetDir = path.join(config.modRequest.projectRoot, WIDGET_SRC);
    const receiverClasses = getReceiverClassNames(widgetDir);

    // Ensure receiver and activity arrays exist
    app.receiver = app.receiver || [];
    app.activity = app.activity || [];

    receiverClasses.forEach((receiverClass) => {
      // Validate that class name ends with 'Receiver'
      if (!receiverClass.endsWith("Receiver")) {
        throw new Error(
          `Invalid receiver class name: ${receiverClass}. Must end with 'Receiver'.`
        );
      }

      // Compute resourcePath dynamically based on receiverClass
      const widgetName = receiverClass.replace(/Receiver$/, "");
      const resourcePath = `@xml/${toSnakeCase(widgetName)}_info`;
      const androidName = `.widgets.${receiverClass}`;

      const alreadyExists = app.receiver!.some(
        (r) => r.$["android:name"] === androidName
      );

      if (!alreadyExists) {
        app.receiver!.push({
          $: {
            "android:name": androidName,
            "android:exported": "true",
          },
          "intent-filter": [
            {
              action: [
                {
                  $: {
                    "android:name": "android.appwidget.action.APPWIDGET_UPDATE",
                  },
                },
              ],
            },
          ],
          "meta-data": [
            {
              $: {
                "android:name": "android.appwidget.provider",
                "android:resource": resourcePath,
              },
            },
          ],
        } as any);
      }
    });

    // Handle configuration activities
    if (glanceConfig?.widgets) {
      glanceConfig.widgets.forEach((widget) => {
        if (widget.configurationActivity) {
          const activityName = `.widgets.${widget.configurationActivity}`;

          // Check if the activity already exists
          const activityExists = app.activity!.some(
            (a) => a.$["android:name"] === activityName
          );

          if (!activityExists) {
            app.activity!.push({
              $: {
                "android:name": activityName,
                "android:exported": "true",
              },
              "intent-filter": [
                {
                  action: [
                    {
                      $: {
                        "android:name":
                          "android.appwidget.action.APPWIDGET_CONFIGURE",
                      },
                    },
                  ],
                },
              ],
            } as any);
          }
        }
      });
    }

    return config;
  });
};
