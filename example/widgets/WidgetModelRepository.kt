import android.content.Context
import androidx.glance.appwidget.updateAll
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.tencent.mmkv.MMKV
import expo.modules.androidglancewidget.example.widgets.Task
import expo.modules.androidglancewidget.example.widgets.TaskProgress
import expo.modules.androidglancewidget.example.widgets.TaskWidgetModel

object WidgetModelRepository {

    private var kv: MMKV? = null
    private val gson = Gson()
    private const val WIDGET_PREFIX = "widget_"
    private const val WIDGET_IDS_KEY = "active_widget_ids"

    fun init(context: Context) {
        if (kv == null) {
            MMKV.initialize(context.applicationContext)
            kv = MMKV.mmkvWithID("tasks-glance-widget", MMKV.MULTI_PROCESS_MODE)
        }
    }

    // Save or update widget model
    fun saveWidgetModel(model: TaskWidgetModel) {
        val json = gson.toJson(model)
        kv?.encode("$WIDGET_PREFIX${model.widgetId}", json)

        // Update active widget IDs list
        val activeIds = getActiveWidgetIds().toMutableSet()
        activeIds.add(model.widgetId)
        kv?.encode(WIDGET_IDS_KEY, gson.toJson(activeIds.toList()))
    }

    // Get widget model by ID
    fun getWidgetModel(widgetId: Int): TaskWidgetModel? {
        val json = kv?.decodeString("$WIDGET_PREFIX$widgetId") ?: return null
        return try {
            gson.fromJson(json, TaskWidgetModel::class.java)
        } catch (e: Exception) {
            null
        }
    }

    // Delete widget model
    private fun deleteWidgetModel(widgetId: Int) {
        kv?.removeValueForKey("$WIDGET_PREFIX$widgetId")

        // Remove from active IDs list
        val activeIds = getActiveWidgetIds().toMutableList()
        activeIds.remove(widgetId)
        kv?.encode(WIDGET_IDS_KEY, gson.toJson(activeIds))
    }

    // Get all active widget IDs
    fun getActiveWidgetIds(): List<Int> {
        val json = kv?.decodeString(WIDGET_IDS_KEY) ?: return emptyList()
        return try {
            gson.fromJson(json, Array<Int>::class.java).toList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    // Update all widgets showing specific task
    suspend fun updateWidgetsForTask(context: Context, updatedTask: Task) {
        getActiveWidgetIds().forEach { widgetId ->
            val widget = getWidgetModel(widgetId)
            if (widget?.taskId == updatedTask.id) {
                val updatedWidget = TaskWidgetModel.fromTask(widgetId, updatedTask)
                saveWidgetModel(updatedWidget)
            }
        }
        // Refresh all widgets
        TaskProgress().updateAll(context)
    }


    fun cleanupOrphanedWidgets(context: Context, activeWidgetIds: List<Int>) {
        val storedIds = getActiveWidgetIds()
        val orphanedIds = storedIds - activeWidgetIds.toSet()

        orphanedIds.forEach { widgetId ->
            deleteWidgetModel(widgetId)
        }
    }

    fun getAllTasks(): List<Task> {
        val json = kv?.decodeString("tasks") ?: return emptyList()
        return try {
            val type = object : TypeToken<List<Task>>() {}.type
            gson.fromJson(json, type)
        } catch (e: Exception) {
            emptyList()
        }
    }

    // Get a specific task by ID from MMKV
    fun getTask(taskId: String): Task? {
        return getAllTasks().find { it.id == taskId }
    }

    // Update a specific task in MMKV storage
    fun updateTask(updatedTask: Task) {
        val currentTasks = getAllTasks().toMutableList()
        val index = currentTasks.indexOfFirst { it.id == updatedTask.id }
        
        if (index != -1) {
            currentTasks[index] = updatedTask
            saveAllTasks(currentTasks)
        }
    }

    // Save all tasks back to MMKV
    private fun saveAllTasks(tasks: List<Task>) {
        val json = gson.toJson(tasks)
        kv?.encode("tasks", json)
    }
}