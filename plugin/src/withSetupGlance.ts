import {
  ConfigPlugin,
  WarningAggregator,
  withAppBuildGradle,
} from "expo/config-plugins";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";

export const withSetupGlance: ConfigPlugin<{
  glanceVersion?: string;
  kotlinVersion?: string;
}> = (config, props) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") {
      WarningAggregator.addWarningAndroid(
        "withGlance",
        `Cannot configure app/build.gradle if it's not groovy`
      );
      return config;
    }
    const kotlinVersion = props.kotlinVersion ?? "2.0.0";
    const glanceVersion = props.glanceVersion ?? "1.1.1";

    const composeCompilerPluginLine = `    id("org.jetbrains.kotlin.plugin.compose") version "${kotlinVersion}"`;

    const composeCompilerPluginBlock = `plugins {
    id("org.jetbrains.kotlin.plugin.compose") version "${kotlinVersion}"
}

`;

    const dependencies = `
    implementation "androidx.glance:glance-appwidget:${glanceVersion}"
    implementation "androidx.glance:glance-material3:${glanceVersion}"
    implementation "androidx.glance:glance-appwidget-preview:${glanceVersion}"
    implementation "androidx.glance:glance-preview:${glanceVersion}"
    `;

    const activateComposeCompilerSetup = `
    buildFeatures {
        compose = true
    }
`;

    let newFileContents = config.modResults.contents;

    // Add Compose Compiler Gradle plugin if it doesn't exist
    if (
      !/id\s*\(\s*["']org\.jetbrains\.kotlin\.plugin\.compose["']\s*\)/.test(
        newFileContents
      )
    ) {
      if (/plugins\s*\{/.test(newFileContents)) {
        // If plugins block exists, add the plugin inside it
        newFileContents = mergeContents({
          src: newFileContents,
          newSrc: composeCompilerPluginLine,
          tag: "ComposeCompilerPlugin",
          anchor: /plugins\s*\{/,
          offset: 1,
          comment: "//",
        }).contents;
      } else {
        // If no plugins block exists, add the entire plugins block
        newFileContents = mergeContents({
          src: newFileContents,
          newSrc: composeCompilerPluginBlock,
          tag: "ComposeCompilerPlugin",
          anchor: /^/,
          offset: 0,
          comment: "//",
        }).contents;
      }
    }

    // Add compose compiler setup
    newFileContents = mergeContents({
      src: newFileContents,
      newSrc: activateComposeCompilerSetup,
      tag: "ActivateComposeCompiler",
      anchor: /android\s*\{/,
      offset: 1,
      comment: "//",
    }).contents;

    // Add dependencies after implementation("com.facebook.react:react-android")
    newFileContents = mergeContents({
      src: newFileContents,
      newSrc: dependencies,
      tag: "Dependencies",
      anchor: /implementation\("com.facebook.react:react-android"\)/,
      offset: 1,
      comment: "//",
    }).contents;

    config.modResults.contents = newFileContents;

    return config;
  });
};
