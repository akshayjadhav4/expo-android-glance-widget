package expo.modules.androidglancewidget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.google.gson.Gson
import com.google.gson.JsonParser
import com.google.gson.JsonSyntaxException

class ExpoAndroidGlanceWidgetModule : Module() {

    private val gson = Gson()

    override fun definition() = ModuleDefinition {

        Name("ExpoAndroidGlanceWidget")

        // set function for String
        Function("setString") { key: String, value: String ->
            getPreferences().edit().putString(key, value).commit()
        }

        // set function for Boolean
        Function("setBoolean") { key: String, value: Boolean ->
            getPreferences().edit().putBoolean(key, value).commit()
        }

        // set function for Int
        Function("setInt") { key: String, value: Int ->
            getPreferences().edit().putInt(key, value).commit()
        }

        // set function for Long
        Function("setLong") { key: String, value: Long ->
            getPreferences().edit().putLong(key, value).commit()
        }

        // set function for Float
        Function("setFloat") { key: String, value: Float ->
            getPreferences().edit().putFloat(key, value).commit()
        }

        // set function for StringSet
        Function("setStringSet") { key: String, value: Set<String> ->
            getPreferences().edit().putStringSet(key, value).commit()
        }

        // Set function for Objects
        Function("setObject") { key: String, data: Map<String, Any> ->
            return@Function try {
                val jsonString = gson.toJson(data)
                getPreferences().edit().putString(key, jsonString).commit()
                true
            } catch (e: Exception) {
                false
            }
        }

        // Set function for Arrays of Objects
        Function("setArray") { key: String, data: List<Any> ->
            return@Function try {
                val jsonString = gson.toJson(data)
                getPreferences().edit().putString(key, jsonString).commit()
                true
            } catch (e: Exception) {
                false
            }
        }

        // get function that returns data of any type
        Function("get") { key: String ->
            return@Function getValue(key)
        }

        // Utility functions
        Function("hasKey") { key: String ->
            return@Function getPreferences().contains(key)
        }

        Function("removeKey") { key: String ->
            getPreferences().edit().remove(key).commit()
        }

        Function("clearAll") {
            getPreferences().edit().clear().commit()
        }

        Function("getAllKeys") {
            return@Function getPreferences().all.keys.toList()
        }

        Function("updateWidget") { receiverClassName: String ->

            // Dynamically construct the full widget class name
            val widgetClassName = "${context.packageName}.widgets.$receiverClassName"

            // Create the ComponentName with context package and widget class
            val component = ComponentName(context.packageName, widgetClassName)

            val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE).apply {
                setComponent(component)
            }

            context.sendBroadcast(intent)
        }

    }

    private val context
        get() = requireNotNull(appContext.reactContext)

    private fun getPreferences(): SharedPreferences {
        return context.getSharedPreferences(context.packageName + ".glance_widget", Context.MODE_PRIVATE)
    }

    private fun getValue(key: String): Any? {
        val preferences = getPreferences()
        if (!preferences.contains(key)) {
            return null
        }

        val allValues = preferences.all
        val value = allValues[key]

        if (value is String && isValidJson(value)) {
            return try {
                gson.fromJson(value, Any::class.java)
            } catch (e: JsonSyntaxException) {
                e.printStackTrace()
                value // fallback to raw string
            }
        }

        return value
    }

    // Helper function for JSON validation
    private fun isValidJson(json: String): Boolean {
        return try {
            val element = JsonParser.parseString(json)
            element.isJsonObject || element.isJsonArray
        } catch (e: Exception) {
            false
        }
    }
}
