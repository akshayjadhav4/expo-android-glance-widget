import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoAndroidGlanceWidgetViewProps } from './ExpoAndroidGlanceWidget.types';

const NativeView: React.ComponentType<ExpoAndroidGlanceWidgetViewProps> =
  requireNativeView('ExpoAndroidGlanceWidget');

export default function ExpoAndroidGlanceWidgetView(props: ExpoAndroidGlanceWidgetViewProps) {
  return <NativeView {...props} />;
}
