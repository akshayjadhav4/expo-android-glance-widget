export interface WidgetProviderInfo {
  updatePeriodMillis: number;
  description?: string;
  minWidth?: string;
  minHeight?: string;
  targetCellWidth?: string;
  targetCellHeight?: string;
  maxResizeWidth?: string;
  maxResizeHeight?: string;
  configure?: string;
  resizeMode?: string;
  widgetCategory?: string;
  previewImageFileName?: string;
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
