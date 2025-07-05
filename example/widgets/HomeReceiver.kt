package expo.modules.androidglancewidget.example.widgets

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
//import android.util.Log
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.state.updateAppWidgetState
import androidx.datastore.preferences.core.stringPreferencesKey

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class HomeReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = Home()

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        if (intent.action == AppWidgetManager.ACTION_APPWIDGET_UPDATE) {
            CoroutineScope(Dispatchers.IO).launch {
                val glanceIds = GlanceAppWidgetManager(context).getGlanceIds(Home::class.java)

                // Read from SharedPreferences (updated by your app)
                val sharedPrefs = context.getSharedPreferences(
                    context.packageName + ".glance_widget",
                    Context.MODE_PRIVATE
                )
                val messageFromApp =
                    sharedPrefs.getString("widgetMessage", "No Message") ?: "No Message"
//                Log.d("HomeReceiver", messageFromApp)
                glanceIds.forEach { id ->
//                    Log.d("HomeReceiver", "ID: $id")
                    updateAppWidgetState(
                        context = context,
                        glanceId = id
                    ) {
                        it[stringPreferencesKey("widgetMessage")] = messageFromApp
                    }
                    // Update widget to reflect the new state
                    glanceAppWidget.update(context, id)
                }
            }
        }
    }
}
