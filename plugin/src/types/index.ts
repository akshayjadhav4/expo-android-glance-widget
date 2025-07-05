export interface WidgetProviderInfo {
  updatePeriodMillis: number;
  description?: string;
  minWidth?: string;
  minHeight?: string;
  targetCellWidth?: string;
  targetCellHeight?: string;
  maxResizeWidth?: string;
  maxResizeHeight?: string;
  minResizeWidth?: string;
  minResizeHeight?: string;
  resizeMode?: "horizontal" | "vertical" | "none" | "horizontal|vertical";
  widgetCategory?: "home_screen" | "keyguard";
  previewImageFileName?: string;
  widgetFeatures?:
    | "configuration_optional"
    | "reconfigurable"
    | "hide_from_picker";
}

export interface Widget {
  widgetClassName: string;
  widgetProviderInfo: WidgetProviderInfo;
  configurationActivity?: string;
}

export interface GlanceConfig {
  widgets: Widget[];
  glanceVersion?: string;
  kotlinVersion?: string;
}
