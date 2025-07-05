# Expo Android Glance Widget

> ⚠️ **Warning**
> 
> This is highly experimental and not part of any official Expo workflow.

An experimental Expo Config Plugin that enables developers to create and manage Android Glance widgets in their React Native Expo applications. This plugin automates the setup process, generates boilerplate code, and provides a convenient API for widget data management.

## Features

- 🚀 **Automatic Setup**: Automatically configures Android Glance dependencies and build settings
- 📱 **Widget Generation**: Generates boilerplate widget code with Kotlin and Glance
- 🔧 **Configuration Management**: Handles widget provider info, manifest entries, and permissions
- 💾 **Data Management**: Provides a simple API for widget data storage and updates
- 🎨 **Asset Handling**: Automatically copies widget assets and layouts
- 📋 **Configuration Activities**: Supports widget configuration screens
- 🔄 **Live Updates**: Update widgets from your React Native app
- 🛠️ **Template Generation**: Creates example widget files based on your configuration

## Installation

```bash
npm install @aj/expo-android-glance-widget
```

## Configuration

### 1. Add the plugin to your `app.json` or `app.config.js`

```json
{
  "expo": {
    "plugins": [
      [
        "@aj/expo-android-glance-widget",
        {
          "glanceVersion": "1.1.1", // Optional, defaults to "1.1.1"
          "kotlinVersion": "2.0.0", // Optional, defaults to "2.0.0"
          "widgets": [
            {
              "widgetClassName": "Home",
              "configurationActivity": "HomeWidgetConfigurationActivity",
              "widgetProviderInfo": {
                "description": "Home Widget",
                "updatePeriodMillis": 1000,
                "minWidth": "100dp",
                "minHeight": "100dp",
                "targetCellWidth": "100",
                "targetCellHeight": "100",
                "maxResizeWidth": "100dp",
                "maxResizeHeight": "100dp",
                "resizeMode": "horizontal",
                "widgetCategory": "home_screen"
              }
            }
          ]
        }
      ]
    ]
  }
}
```

### 2. Widget files

The plugin creates a `widgets` folder in your project root with starter code based on your configuration:

```
widgets/
├── Home.kt
├── HomeReceiver.kt
├── HomeWidgetConfigurationActivity.kt (if configured)
└── res/
    ├── layout/
    │   ├── home_initial_layout.xml
    │   └── home_preview_layout.xml
    └── drawables/
        └── your_assets.png
```

**Note**: These files are generated automatically as starter code that you can customize!

### 3. Run prebuild

```bash
npx expo prebuild --platform android
```

## What the Plugin Does

During prebuild, the plugin automatically:

1. **Adds Dependencies**: Configures Android Glance dependencies in `android/app/build.gradle`
2. **Generates Starter Code**: Creates working widget files in `widgets/` folder for each configured widget if they don't already exist
3. **Copies Widget Code**: Transfers the widget files from `widgets/` to the Android project
4. **Generates Provider Info**: Creates XML widget provider info files
5. **Updates Manifest**: Adds widget receivers and activities to `AndroidManifest.xml`
6. **Copies Assets**: Transfers widget assets and layouts to appropriate Android directories

## Generated Widget Files

For each widget configured in your `app.json`, the plugin creates files in the `widgets/` folder:

### Widget Class (`YourWidget.kt`)
- Basic Glance widget implementation
- Scaffold with "Hello Widget" text
- Preview composable for Android Studio

### Widget Receiver (`YourWidgetReceiver.kt`)
- Extends `GlanceAppWidgetReceiver`
- Links to your widget class

### Configuration Activity (`YourWidgetConfigurationActivity.kt`)
- Optional configuration screen
- Only created if `configurationActivity` is specified

### Layout Files
- `your_widget_preview_layout.xml` - Preview layout
- `your_widget_initial_layout.xml` - Initial layout

These files are working starter code that you can customize directly in the `widgets/` folder.

## Sharing Data between App and Widget

Use the `WidgetStorage` API to communicate with your widgets:

### App

```typescript
import { WidgetStorage } from '@aj/expo-android-glance-widget';

// Set data for widgets
WidgetStorage.set('message', 'Hello World!');
WidgetStorage.set('count', 42);
WidgetStorage.set('isActive', true);
WidgetStorage.set('user', { name: 'John', age: 30 });

// Get data (useful for reading back stored values)
const message = WidgetStorage.get('message') as string;
const count = WidgetStorage.get('count') as number;

```

### Widget

The `WidgetStorage` API stores data in Android SharedPreferences. Access this data in your widget code using:

```kotlin
// In your widget receiver or widget class
val sharedPrefs = context.getSharedPreferences(
    context.packageName + ".glance_widget",
    Context.MODE_PRIVATE
)

val messageFromApp = sharedPrefs.getString("message", "No Message") ?: "No Message"
val countFromApp = sharedPrefs.getInt("count", 0)
val isActiveFromApp = sharedPrefs.getBoolean("isActive", false)

// For objects and arrays, data is stored as JSON strings
val userJson = sharedPrefs.getString("user", "{}")
// You'll need to parse JSON manually in your widget code
// Example: val user = Gson().fromJson(userJson, User::class.java)
```

- **Storage Location**: Android SharedPreferences with name `{packageName}.glance_widget`
- **Data Types**: Supports strings, numbers, booleans, objects (as JSON), and arrays.

## Update Widget

After changing data with `WidgetStorage.set()`, you need to trigger a widget update to reflect the changes. Use the `updateWidget()` method:

```typescript
// Update data
WidgetStorage.set('message', 'Updated message!');
WidgetStorage.set('count', 42);

// Trigger widget update
WidgetStorage.updateWidget('HomeReceiver');
```

### How Widget Updates Work

The update process follows this flow:

1. **JavaScript calls `updateWidget()`**: Pass the receiver class name (e.g., 'HomeReceiver')
2. **Module sends broadcast**: The native module constructs the full class name and sends an Android broadcast intent
3. **Widget receiver responds**: Your widget receiver catches the broadcast and updates the widget

### Widget Receiver Implementation

Your widget receiver should handle the update broadcast like this:

```kotlin
class HomeReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = Home()

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        if (intent.action == AppWidgetManager.ACTION_APPWIDGET_UPDATE) {
            CoroutineScope(Dispatchers.IO).launch {
                val glanceIds = GlanceAppWidgetManager(context).getGlanceIds(Home::class.java)

                // Read updated data from SharedPreferences
                val sharedPrefs = context.getSharedPreferences(
                    context.packageName + ".glance_widget",
                    Context.MODE_PRIVATE
                )
                val messageFromApp = sharedPrefs.getString("message", "No Message") ?: "No Message"
                val countFromApp = sharedPrefs.getInt("count", 0)

                glanceIds.forEach { id ->
                    updateAppWidgetState(
                        context = context,
                        glanceId = id
                    ) {
                        // Update widget state with new data
                        it[stringPreferencesKey("message")] = messageFromApp
                        it[intPreferencesKey("count")] = countFromApp
                    }
                    // Trigger widget UI update
                    glanceAppWidget.update(context, id)
                }
            }
        }
    }
}
```

### Important Notes

- **Receiver class name**: Use just the class name (e.g., 'HomeReceiver'), not the full package name
- **Automatic broadcast**: The module automatically constructs the full class name: `{packageName}.widgets.{receiverClassName}`
- **Async updates**: Widget updates run in a coroutine to avoid blocking the main thread
- **Multiple instances**: The receiver updates all instances of the widget if multiple are placed on the home screen

## API Reference

### WidgetStorage Methods

| Method | Description |
|--------|-------------|
| `set(key: string, value: any)` | Store data (string, number, boolean, object, array) |
| `get(key: string)` | Retrieve stored data |
| `remove(key: string)` | Remove a key |
| `has(key: string)` | Check if key exists |
| `clear()` | Clear all data |
| `getAllKeys()` | Get all keys |
| `updateWidget(receiverClassName: string)` | Trigger widget update |

## Configuration Options

### Plugin Configuration

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `glanceVersion` | `string` | No | `"1.1.1"` | AndroidX Glance library version |
| `kotlinVersion` | `string` | No | `"2.0.0"` | Kotlin compiler version |
| `widgets` | `Widget[]` | Yes | - | Array of widget configurations |

### Widget Configuration

| Option | Type | Description |
|--------|------|-------------|
| `widgetClassName` | `string` | Name of the widget class |
| `configurationActivity` | `string` | Optional configuration activity |
| `widgetProviderInfo` | `WidgetProviderInfo` | Widget provider settings |

### Supported WidgetProviderInfo Options

| Option | Type | Description |
|--------|------|-------------|
| `minWidth` | `string` | Minimum width (e.g., "100dp") (Added in API level 3) |
| `minHeight` | `string` | Minimum height (e.g., "100dp") (Added in API level 3) |
| `updatePeriodMillis` | `number` | Update interval in milliseconds (Added in API level 3) |
| `previewImageFileName` | `string` | Preview image file name (must be present in `widgets/res/drawables/`) (Added in API level 11) |
| `resizeMode` | `"horizontal"` \| `"vertical"` \| `"none"` \| `"horizontal\|vertical"` | Resize mode options (Added in API level 12) |
| `minResizeWidth` | `string` | Minimum resize width (Added in API level 14) |
| `minResizeHeight` | `string` | Minimum resize height (Added in API level 14) |
| `widgetCategory` | `"home_screen"` \| `"keyguard"` | Widget category options (Added in API level 17) |
| `widgetFeatures` | `"configuration_optional"` \| `"reconfigurable"` \| `"hide_from_picker"` | Widget features options (Added in API level 28) |
| `description` | `string` | Widget description (Added in API level 31) |
| `targetCellWidth` | `string` | Target cell width (Added in API level 31) |
| `targetCellHeight` | `string` | Target cell height (Added in API level 31) |
| `maxResizeWidth` | `string` | Maximum resize width (Added in API level 31) |
| `maxResizeHeight` | `string` | Maximum resize height (Added in API level 31) |

**Note**: The plugin automatically creates API-level specific XML files to ensure backward compatibility. For example, if you use `description` (API 31), the plugin will create separate XML files for different Android versions, ensuring your widget works on older devices without newer features.

For more detailed information about these widget provider options, refer to the [Android AppWidgetProviderInfo documentation](https://developer.android.com/develop/ui/views/appwidgets#AppWidgetProviderInfo).

**API Reference**: [AppWidgetProviderInfo](https://developer.android.com/reference/android/appwidget/AppWidgetProviderInfo)

## Acknowledgments

- [@EvanBacon/expo-apple-targets](https://github.com/EvanBacon/expo-apple-targets) for the inspiring approach to native target generation and plugin architecture.