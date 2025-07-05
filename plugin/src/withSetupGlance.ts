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

    const composeCompilerPlugin = `plugins {
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

    // Add Compose Compiler Gradle plugin
    config.modResults.contents =
      composeCompilerPlugin + config.modResults.contents;

    let newFileContents = config.modResults.contents;

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
