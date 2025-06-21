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
}

export interface Widget {
  widgetClassName: string;
  widgetProviderInfo: WidgetProviderInfo;
}

export interface GlanceConfig {
  glanceVersion: string;
  kotlinVersion: string;
  widgets: Widget[];
}
