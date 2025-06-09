import { NativeModule, requireNativeModule } from 'expo';

import { ExpoAndroidGlanceWidgetModuleEvents } from './ExpoAndroidGlanceWidget.types';

declare class ExpoAndroidGlanceWidgetModule extends NativeModule<ExpoAndroidGlanceWidgetModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAndroidGlanceWidgetModule>('ExpoAndroidGlanceWidget');
