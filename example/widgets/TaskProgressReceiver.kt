package expo.modules.androidglancewidget.example.widgets

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class TaskProgressReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = TaskProgress()

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        if (intent.action == AppWidgetManager.ACTION_APPWIDGET_UPDATE) {
            CoroutineScope(Dispatchers.IO).launch {
                val glanceIds = GlanceAppWidgetManager(context).getGlanceIds(TaskProgress::class.java)
                glanceIds.forEach { id ->
                    glanceAppWidget.update(context, id)
                }
            }
        }
    }
}
