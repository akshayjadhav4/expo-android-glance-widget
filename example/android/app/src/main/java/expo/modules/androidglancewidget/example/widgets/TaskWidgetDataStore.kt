package expo.modules.androidglancewidget.example.widgets

import WidgetModelRepository
import android.content.Context
import androidx.datastore.core.DataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class TaskWidgetDataStore(private val context: Context) : DataStore<Map<Int, TaskWidgetState>> {
    override val data: Flow<Map<Int, TaskWidgetState>>
        get() {
            WidgetModelRepository.init(context)

            return flow {
                val widgetIds = WidgetModelRepository.getActiveWidgetIds()
                val widgetStates = widgetIds.associateWith { widgetId ->
                    // Get the widget configuration to know which task it's tracking
                    val widgetModel = WidgetModelRepository.getWidgetModel(widgetId)
                    if (widgetModel != null) {
                        // Fetch the actual task data from MMKV (source of truth)
                        val actualTask = WidgetModelRepository.getTask(widgetModel.taskId)
                        if (actualTask != null) {
                            // Create widget state from the actual MMKV task data
                            TaskWidgetModel.fromTask(widgetId, actualTask)
                        } else {
                            TaskWidgetState.Empty
                        }
                    } else {
                        TaskWidgetState.Empty
                    }
                }
                emit(widgetStates)
            }
        }

    override suspend fun updateData(
        transform: suspend (t: Map<Int, TaskWidgetState>) -> Map<Int, TaskWidgetState>
    ): Map<Int, TaskWidgetState> {
        // Since we are using MMKV as a single source of truth, this method is not needed.
        // The data is always fetched fresh from the repository.
        throw NotImplementedError("This operation is not supported.")
    }
} 