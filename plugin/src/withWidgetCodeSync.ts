import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins";
import fs from "fs";
import path from "path";
import { WIDGET_SRC } from "./utils";

export const withWidgetCodeSync: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      // Base Path of android project
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      // Base Path of the project
      const projectRoot = config.modRequest.projectRoot;

      // Path to the main Directory
      const mainDir = path.join(platformProjectRoot, "app", "src", "main");
      // Path to the java Directory
      const javaDir = path.join(mainDir, "java");

      const packageName = config?.android?.package;
      if (!packageName) {
        throw new Error(
          "Could not find package name. Please set the package name in your app.json or app.config.js file."
        );
      }

      // Source widgets folder path
      const sourceWidgetsPath = path.join(projectRoot, WIDGET_SRC);

      // Destination widgets package path in Android project
      const destWidgetsPath = path.join(
        javaDir,
        ...packageName.split("."),
        "widgets"
      );

      // Android res directory path
      const androidResPath = path.join(mainDir, "res");

      // Check if source widgets folder exists
      if (!fs.existsSync(sourceWidgetsPath)) {
        // console.log(
        //   `Widgets folder not found at ${sourceWidgetsPath}. Skipping widget sync.`
        // );
        return config;
      }

      // Create destination widgets package if it doesn't exist
      if (!fs.existsSync(destWidgetsPath)) {
        fs.mkdirSync(destWidgetsPath, { recursive: true });
      }

      // Function to copy files recursively, excluding assets folder
      const copyWidgetFiles = (srcPath: string, destPath: string) => {
        const items = fs.readdirSync(srcPath);

        for (const item of items) {
          const srcItemPath = path.join(srcPath, item);
          const destItemPath = path.join(destPath, item);
          const stat = fs.statSync(srcItemPath);

          // Skip res and assets folders
          if (item === "res" || item === "assets") {
            continue;
          }

          if (stat.isDirectory()) {
            // Create directory if it doesn't exist
            if (!fs.existsSync(destItemPath)) {
              fs.mkdirSync(destItemPath, { recursive: true });
            }
            // Recursively copy contents
            copyWidgetFiles(srcItemPath, destItemPath);
          } else if (stat.isFile()) {
            // Only copy Kotlin files (.kt)
            if (item.endsWith(".kt")) {
              try {
                const content = fs.readFileSync(srcItemPath, "utf-8");
                fs.writeFileSync(destItemPath, content);
                // console.log(`Copied: ${item}`);
              } catch (error) {
                console.error(
                  `Failed to copy ${item}: ${(error as Error).message}`
                );
              }
            }
          }
        }
      };

      // Function to copy res folder contents to Android res directory
      const copyResFiles = (srcResPath: string, destResPath: string) => {
        if (!fs.existsSync(srcResPath)) {
          return; // No res folder to copy
        }

        const items = fs.readdirSync(srcResPath);

        for (const item of items) {
          const srcItemPath = path.join(srcResPath, item);
          const destItemPath = path.join(destResPath, item);
          const stat = fs.statSync(srcItemPath);

          if (stat.isDirectory()) {
            // Create directory if it doesn't exist
            if (!fs.existsSync(destItemPath)) {
              fs.mkdirSync(destItemPath, { recursive: true });
            }
            // Recursively copy contents
            copyResFiles(srcItemPath, destItemPath);
          } else if (stat.isFile()) {
            // Copy all files in res folders (layouts, drawables, etc.)
            try {
              const content = fs.readFileSync(srcItemPath, "utf-8");
              fs.writeFileSync(destItemPath, content);
              // console.log(`Copied res: ${item}`);
            } catch (error) {
              console.error(
                `Failed to copy res file ${item}: ${(error as Error).message}`
              );
            }
          }
        }
      };

      // Copy widget Kotlin files
      try {
        copyWidgetFiles(sourceWidgetsPath, destWidgetsPath);
        // console.log(`Widget files synced to ${destWidgetsPath}`);
      } catch (error) {
        throw new Error(
          `Failed to sync widget files: ${(error as Error).message}`
        );
      }

      // Copy res folder contents
      const sourceResPath = path.join(sourceWidgetsPath, "res");
      try {
        copyResFiles(sourceResPath, androidResPath);
        // console.log(`Res files synced to ${androidResPath}`);
      } catch (error) {
        throw new Error(
          `Failed to sync res files: ${(error as Error).message}`
        );
      }

      return config;
    },
  ]);
};
