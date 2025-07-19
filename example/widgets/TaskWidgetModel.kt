package expo.modules.androidglancewidget.example.widgets


sealed interface TaskWidgetState {
    data object Empty : TaskWidgetState
    data object Loading : TaskWidgetState
}

data class Task(
    val id: String,
    val title: String,
    val current: Int,
    val target: Int
)


data class TaskWidgetModel(
    val widgetId: Int,
    val taskId: String,
    val title: String,
    val current: Int,
    val target: Int
) : TaskWidgetState {

    // Display helpers
    val progressText: String get() = "$current / $target"
    val progressPercentage: Float get() = if (target > 0) current.toFloat() / target else 0f
    val isCompleted: Boolean get() = current >= target

    companion object {
        fun fromTask(widgetId: Int, task: Task): TaskWidgetModel {
            return TaskWidgetModel(
                widgetId = widgetId,
                taskId = task.id,
                title = task.title,
                current = task.current,
                target = task.target
            )
        }
    }
}