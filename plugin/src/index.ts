import { ConfigPlugin, withPlugins } from "@expo/config-plugins";
import { withSetupGlance } from "./withSetupGlance";
import { GlanceConfig } from "./types";
import { withWidgetProviderInfo } from "./withWidgetProviderInfo";
import { withWidgetStarterTemplate } from "./withWidgetStarterTemplate";
import { withWidgetManifest } from "./withWidgetManifest";
import withWidgetAssets from "./withWidgetAssets";
import { withWidgetLayouts } from "./withWidgetLayouts";
import { withWidgetCodeSync } from "./withWidgetCodeSync";

const withGlance: ConfigPlugin<GlanceConfig> = (
  config,
  { glanceVersion, kotlinVersion, widgets }
) => {
  const applyWidgetConfigs = (currentConfig: any) => {
    return widgets?.reduce((acc, widgetConfig) => {
      return withPlugins(acc, [
        [withWidgetLayouts, widgetConfig],
        [withWidgetProviderInfo, widgetConfig],
        [
          withWidgetStarterTemplate,
          { widgetName: widgetConfig.widgetClassName },
        ],
        withWidgetCodeSync,
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
