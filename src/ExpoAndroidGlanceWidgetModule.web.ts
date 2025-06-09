import { registerWebModule, NativeModule } from 'expo';

import { ExpoAndroidGlanceWidgetModuleEvents } from './ExpoAndroidGlanceWidget.types';

class ExpoAndroidGlanceWidgetModule extends NativeModule<ExpoAndroidGlanceWidgetModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoAndroidGlanceWidgetModule, 'ExpoAndroidGlanceWidgetModule');
