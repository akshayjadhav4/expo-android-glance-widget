import { ConfigPlugin, withPlugins } from "@expo/config-plugins";
import { withSetupGlance } from "./withSetupGlance";
import { GlanceConfig } from "./types";
import { withWidgetProviderInfo } from "./withWidgetProviderInfo";
import { withWidgetCodeSync } from "./withWidgetCodeSync";
import { withWidgetManifest } from "./withWidgetManifest";
import withWidgetAssets from "./withWidgetAssets";

const withGlance: ConfigPlugin<GlanceConfig> = (
  config,
  { glanceVersion, kotlinVersion, widgets }
) => {
  const applyWidgetConfigs = (currentConfig: any) => {
    return widgets?.reduce((acc, widgetConfig) => {
      return withPlugins(acc, [
        [withWidgetProviderInfo, widgetConfig],
        [withWidgetCodeSync, { widgetName: widgetConfig.widgetClassName }],
      ]);
    }, currentConfig);
  };
  return withPlugins(config, [
    [withSetupGlance, { glanceVersion, kotlinVersion }],
    applyWidgetConfigs,
    withWidgetManifest,
    withWidgetAssets,
  ]);
};

export default withGlance;
