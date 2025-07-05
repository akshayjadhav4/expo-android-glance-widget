import { ConfigPlugin, withPlugins } from "@expo/config-plugins";
import { withSetupGlance } from "./withSetupGlance";
import { GlanceConfig } from "./types";
import { withWidgetProviderInfo } from "./withWidgetProviderInfo";
import { withWidgetManifest } from "./withWidgetManifest";
import withWidgetAssets from "./withWidgetAssets";
import { withWidgetCodeAndLayouts } from "./withWidgetCodeAndLayouts";

const withGlance: ConfigPlugin<GlanceConfig> = (
  config,
  { glanceVersion, kotlinVersion, widgets }
) => {
  return withPlugins(config, [
    [withSetupGlance, { glanceVersion, kotlinVersion }],
    [withWidgetCodeAndLayouts, { widgets }],
    [withWidgetProviderInfo, { widgets }],
    [withWidgetManifest, { widgets }],
    withWidgetAssets,
  ]);
};

export default withGlance;
