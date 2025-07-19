package expo.modules.androidglancewidget.example.widgets

import WidgetModelRepository
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.glance.appwidget.updateAll
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class TaskProgressWidgetConfigurationActivity: AppCompatActivity() {
    private var appWidgetId: Int = AppWidgetManager.INVALID_APPWIDGET_ID
    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)

        // Initialize repository
        WidgetModelRepository.init(this)

        // Get the App Widget ID from the intent that launched the activity
        appWidgetId = intent?.extras?.getInt(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID
        ) ?: AppWidgetManager.INVALID_APPWIDGET_ID

        // Set default result (cancelled)
        setResult(RESULT_CANCELED)

        // Exit if invalid widget ID
        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish()
            return
        }

        setContent {
            MaterialTheme {
                Surface(modifier = Modifier
                    .fillMaxSize()
                    .padding(WindowInsets.safeDrawing.asPaddingValues())) {
                    TaskSelectionScreen(
                        tasks = getTasks(),
                        onTaskSelected = { task ->
                            selectTaskForWidget(task)
                        }
                    )
                }
            }
        }
    }

    private fun selectTaskForWidget(task: Task) {
        lifecycleScope.launch {
            // Create and save widget model
            val widgetModel = TaskWidgetModel.fromTask(appWidgetId, task)
            WidgetModelRepository.saveWidgetModel(widgetModel)

            // Update the widget
            TaskProgress().updateAll(this@TaskProgressWidgetConfigurationActivity)

            // Return success result
            val resultValue = Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            setResult(RESULT_OK, resultValue)
            finish()
        }
    }

    private fun getTasks(): List<Task> {
        return WidgetModelRepository.getAllTasks()
    }
}

@Composable
private fun TaskSelectionScreen(
    tasks: List<Task>,
    onTaskSelected: (Task) -> Unit
) {
    Column{
        Text(
            text = "Select a task for your widget",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(16.dp)
        )

        LazyColumn {
            items(tasks) { task ->
                TaskRow(
                    task = task,
                    onClick = { onTaskSelected(task) }
                )
            }
        }
    }
}

@Composable
private fun TaskRow(task: Task, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = task.title,
                style = MaterialTheme.typography.bodyLarge
            )
            Text(
                text = "${task.current} / ${task.target}",
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}