package expo.modules.androidglancewidget.example.widgets

import WidgetModelRepository
import android.appwidget.AppWidgetManager
import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.Button
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.action.ActionParameters
import androidx.glance.action.actionParametersOf
import androidx.glance.action.actionStartActivity
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.LinearProgressIndicator
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.components.Scaffold
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.currentState
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.preview.ExperimentalGlancePreviewApi
import androidx.glance.preview.Preview
import androidx.glance.state.GlanceStateDefinition
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle
import java.io.File

private val TINY_BOX = DpSize(140.dp, 110.dp)
private val SMALL_HORIZONTAL = DpSize(220.dp, 110.dp)  
private val BIG_HORIZONTAL = DpSize(280.dp, 140.dp)

class TaskProgress : GlanceAppWidget() {
    override val stateDefinition: GlanceStateDefinition<Map<Int, TaskWidgetState>>
        get() = object : GlanceStateDefinition<Map<Int, TaskWidgetState>> {
            override suspend fun getDataStore(
                context: Context,
                fileKey: String
            ): androidx.datastore.core.DataStore<Map<Int, TaskWidgetState>> {
                return TaskWidgetDataStore(context)
            }

            override fun getLocation(context: Context, fileKey: String): File {
                throw NotImplementedError()
            }
        }

    override val sizeMode = SizeMode.Responsive(
        setOf(TINY_BOX, SMALL_HORIZONTAL, BIG_HORIZONTAL)
    )

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        // Initialize repository
        WidgetModelRepository.init(context)

        // Convert GlanceId to widget ID
        val widgetManager = GlanceAppWidgetManager(context)
        val widgetId = widgetManager.getAppWidgetId(id)

        provideContent {
            GlanceTheme {
                val allWidgetStates = currentState<Map<Int, TaskWidgetState>>()
                val state = allWidgetStates[widgetId] ?: TaskWidgetState.Empty
                TaskProgressContent(state, widgetId)
            }
        }
    }
}

@Composable
private fun TaskProgressContent(
    state: TaskWidgetState,
    widgetId: Int
) {
    Scaffold(
        backgroundColor = GlanceTheme.colors.surface
    ) {
        when (state) {
            is TaskWidgetState.Empty -> {
                EmptyStateContent(widgetId)
            }
            is TaskWidgetState.Loading -> {
                LoadingStateContent()
            }
            is TaskWidgetModel -> {
                TaskContent(state, widgetId)
            }
        }
    }
}

@Composable
fun EmptyStateContent(widgetId: Int) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(
            text = "Select",
            onClick = actionStartActivity<TaskProgressWidgetConfigurationActivity>(
                parameters = actionParametersOf(
                    ActionParameters.Key<Int>(AppWidgetManager.EXTRA_APPWIDGET_ID) to widgetId
                )
            ),
            modifier = GlanceModifier.fillMaxWidth()
        )
    }
}

@Composable
fun LoadingStateContent() {
    Box(
        modifier = GlanceModifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            LinearProgressIndicator(
                color = GlanceTheme.colors.primary,
                backgroundColor = GlanceTheme.colors.surfaceVariant
            )
            Spacer(modifier = GlanceModifier.height(8.dp))
            Text(
                text = "Loading...",
                style = TextStyle(
                    fontSize = 14.sp,
                    color = GlanceTheme.colors.onSurface
                )
            )
        }
    }
}

@Composable
fun TaskContent(state: TaskWidgetModel, widgetId: Int) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .padding(12.dp),
        verticalAlignment = Alignment.Top
    ) {
        // Task Title
        Text(
            text = state.title,
            style = TextStyle(
                fontWeight = FontWeight.Medium,
                fontSize = 14.sp,
                color = GlanceTheme.colors.onSurface
            ),
            maxLines = 1
        )
        
        Spacer(modifier = GlanceModifier.height(8.dp))
        
        // Progress Bar
        LinearProgressIndicator(
            progress = state.progressPercentage,
            modifier = GlanceModifier.fillMaxWidth().height(4.dp),
            color = GlanceTheme.colors.primary,
            backgroundColor = GlanceTheme.colors.surfaceVariant
        )
        
        Spacer(modifier = GlanceModifier.height(8.dp))
        
        // Bottom Row: Progress Text + Button
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            horizontalAlignment = Alignment.Horizontal.Start,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Progress Text
            Text(
                text = state.progressText,
                style = TextStyle(
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = GlanceTheme.colors.onSurface
                ),
                modifier = GlanceModifier.defaultWeight()
            )
            
            // Increment Button (if not completed)
            if (!state.isCompleted) {
                Button(
                    text = "+",
                    onClick = actionRunCallback<UpdateTaskActionCallback>(
                        parameters = actionParametersOf(
                            UpdateTaskActionCallback.KEY_WIDGET_ID to widgetId,
                            UpdateTaskActionCallback.KEY_TASK_ID to state.taskId
                        )
                    )
                )
            }
        }
    }
}

@OptIn(ExperimentalGlancePreviewApi::class)
@Preview(widthDp = 220, heightDp = 110)
@Composable
fun TaskProgressWidgetContentPreview() {
    TaskProgressContent(
        state = TaskWidgetModel(1, "task1", "Learn New Words", 15, 50),
        widgetId = 1
    )
}
