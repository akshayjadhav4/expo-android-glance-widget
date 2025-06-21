import {
  ConfigPlugin,
  WarningAggregator,
  withDangerousMod,
} from "@expo/config-plugins";
import fs from "fs";
import path from "path";
import { WIDGET_SRC } from "./utils";

const invalidNameRegex = /[^a-z0-9_]|^[0-9]/;

const withWidgetAssets: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;

      const widgetAssetsPath = path.join(projectRoot, WIDGET_SRC, "assets");
      const androidDrawablePath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "drawable",
        "widget_assets"
      );

      // check widgets/assets folder exists
      if (!fs.existsSync(widgetAssetsPath)) {
        try {
          fs.mkdirSync(widgetAssetsPath, { recursive: true });
          const gitkeepPath = path.join(widgetAssetsPath, ".gitkeep");
          fs.writeFileSync(gitkeepPath, "");
        } catch (error) {
          WarningAggregator.addWarningAndroid(
            "withGlance",
            `Failed to create assets directory: ${error instanceof Error ? error.message : String(error)}`
          );
        }
        return config; // nothing else to copy yet
      }

      // check drawable path exists
      if (!fs.existsSync(androidDrawablePath)) {
        try {
          fs.mkdirSync(androidDrawablePath, { recursive: true });
        } catch (error) {
          WarningAggregator.addWarningAndroid(
            "withGlance",
            `Failed to create drawable directory: ${error instanceof Error ? error.message : String(error)}`
          );
          return config;
        }
      }

      let assets: string[];
      try {
        assets = fs.readdirSync(widgetAssetsPath);
      } catch (error) {
        WarningAggregator.addWarningAndroid(
          "withGlance",
          `Failed to read assets directory: ${error instanceof Error ? error.message : String(error)}`
        );
        return config;
      }

      if (assets.length === 0) {
        return config;
      }

      // Track processed base names to detect duplicates
      const seenNames = new Set<string>();
      let copiedCount = 0;

      for (const asset of assets) {
        if (asset === ".gitkeep") continue;

        // Prevent path traversal attacks
        if (
          asset.includes("..") ||
          asset.includes("/") ||
          asset.includes("\\")
        ) {
          WarningAggregator.addWarningAndroid(
            "withGlance",
            `❌ Skipping "${asset}" — invalid characters detected (potential path traversal).`
          );
          continue;
        }

        const ext = path.extname(asset).toLowerCase();
        const nameWithoutExt = path.basename(asset, ext);
        const allowed = [".png", ".jpg", ".jpeg", ".webp", ".xml"];

        if (!allowed.includes(ext)) {
          WarningAggregator.addWarningAndroid(
            "withGlance",
            `⚠️ Skipping "${asset}" — unsupported file type. Supported: ${allowed.join(", ")}`
          );
          continue;
        }

        if (invalidNameRegex.test(nameWithoutExt)) {
          const suggested = nameWithoutExt
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_")
            .replace(/^[0-9]/, "_$&"); // Prefix numbers with underscore
          WarningAggregator.addWarningAndroid(
            "withGlance",
            `❌ Skipping "${asset}" — Android resource names must use only lowercase letters, digits, and underscores, and cannot start with a number.
        Suggested rename: "${suggested}${ext}"`
          );
          continue;
        }

        // Check for duplicate base names (different extensions, same name)
        if (seenNames.has(nameWithoutExt)) {
          WarningAggregator.addWarningAndroid(
            "withGlance",
            `❌ Skipping "${asset}" — duplicate resource name "${nameWithoutExt}" detected. Android resources must have unique names regardless of extension.`
          );
          continue;
        }
        seenNames.add(nameWithoutExt);

        const src = path.join(widgetAssetsPath, asset);
        const dest = path.join(androidDrawablePath, asset);

        // Check if file will be overwritten
        if (fs.existsSync(dest)) {
          WarningAggregator.addWarningAndroid(
            "withGlance",
            `⚠️ Overwriting existing drawable resource: "${asset}"`
          );
        }

        // Copy the file
        try {
          fs.copyFileSync(src, dest);
          copiedCount++;
        } catch (error) {
          WarningAggregator.addWarningAndroid(
            "withGlance",
            `❌ Failed to copy "${asset}": ${error instanceof Error ? error.message : String(error)}`
          );
          continue;
        }
      }

      if (copiedCount > 0) {
        // console.log(
        //   `✅ Successfully copied ${copiedCount} widget asset(s) to Android drawable resources.`
        // );
      }

      return config;
    },
  ]);
};

export default withWidgetAssets;
