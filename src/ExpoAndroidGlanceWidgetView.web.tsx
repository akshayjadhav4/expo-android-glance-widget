import * as React from 'react';

import { ExpoAndroidGlanceWidgetViewProps } from './ExpoAndroidGlanceWidget.types';

export default function ExpoAndroidGlanceWidgetView(props: ExpoAndroidGlanceWidgetViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
