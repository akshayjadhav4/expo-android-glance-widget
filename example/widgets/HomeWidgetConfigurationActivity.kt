package expo.modules.androidglancewidget.example.widgets

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.state.updateAppWidgetState
import kotlinx.coroutines.runBlocking


class HomeWidgetConfigurationActivity: AppCompatActivity() {
    private var appWidgetId: Int = AppWidgetManager.INVALID_APPWIDGET_ID

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Get the App Widget ID from the intent that launched the activity
        appWidgetId = intent?.extras?.getInt(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID
        ) ?: AppWidgetManager.INVALID_APPWIDGET_ID

        setContent {
            MaterialTheme {
                ConfigScreen(
                    onSave = { message ->
                        saveMessageToPreferences(message)
                        runBlocking {
                            returnResultAndFinish(message)
                        }
                    }
                )
            }
        }
    }

    private fun saveMessageToPreferences(message: String) {
        val prefs = getSharedPreferences(
            "$packageName.glance_widget",
            Context.MODE_PRIVATE
        )
        prefs.edit().putString("widgetMessage", message).apply()
    }

    private suspend fun returnResultAndFinish(message: String) {
        val glanceManager = GlanceAppWidgetManager(this)
        val glanceIds = glanceManager.getGlanceIds(Home::class.java)
        val key = stringPreferencesKey("widgetMessage")

        glanceIds.forEach { glanceId ->
            updateAppWidgetState(this, glanceId) {
                it[key] = message
            }
            Home().update(this, glanceId)
        }

        val resultValue = Intent().apply {
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        setResult(RESULT_OK, resultValue)
        finish()
    }
}

@Composable
fun ConfigScreen(onSave: (String) -> Unit) {
    var message by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("Enter a message for your widget", style = MaterialTheme.typography.titleMedium)

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = message,
            onValueChange = { message = it },
            label = { Text("Message") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                if (message.isNotBlank()) {
                    onSave(message)
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Save & Add Widget")
        }
    }
}
