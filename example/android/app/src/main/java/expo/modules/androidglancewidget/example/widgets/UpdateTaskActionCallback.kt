package expo.modules.androidglancewidget.example.widgets

import WidgetModelRepository
import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.action.ActionParameters
import androidx.glance.appwidget.action.ActionCallback

class UpdateTaskActionCallback : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        val widgetId = parameters[KEY_WIDGET_ID] ?: return
        val taskId = parameters[KEY_TASK_ID] ?: return

        WidgetModelRepository.init(context)
        
        val currentTask = WidgetModelRepository.getTask(taskId)
        if (currentTask != null) {
            val updatedTask = currentTask.copy(current = currentTask.current + 1)
            WidgetModelRepository.updateTask(updatedTask)
            
            val updatedWidgetModel = TaskWidgetModel.fromTask(widgetId, updatedTask)
            WidgetModelRepository.saveWidgetModel(updatedWidgetModel)
            
            TaskProgress().update(context, glanceId)
        }
    }

    companion object {
        val KEY_WIDGET_ID = ActionParameters.Key<Int>("widgetId")
        val KEY_TASK_ID = ActionParameters.Key<String>("taskId")
    }
} 