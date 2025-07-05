package expo.modules.androidglancewidget.example.widgets

import android.content.Context
//import android.util.Log
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.Image
import androidx.glance.ImageProvider

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.components.Scaffold
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.padding
import androidx.glance.layout.Spacer
import androidx.glance.layout.height
import androidx.glance.preview.ExperimentalGlancePreviewApi
import androidx.glance.preview.Preview
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import expo.modules.androidglancewidget.example.R
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.glance.currentState
import androidx.glance.state.GlanceStateDefinition
import androidx.glance.state.PreferencesGlanceStateDefinition

class Home : GlanceAppWidget() {

    override val stateDefinition: GlanceStateDefinition<*> = PreferencesGlanceStateDefinition

    override suspend fun provideGlance(context: Context, id: GlanceId) {

        provideContent {

            val preferences = currentState<Preferences>()
            val message = preferences[stringPreferencesKey("widgetMessage")] ?: "Default No Message"
//            Log.d("Home","message $message, GlanceId: $id")
            GlanceTheme {
                HomeContent(message)
            }
        }
    }
}

@Composable
private fun HomeContent(
    message: String
) {
    Scaffold(
        backgroundColor = GlanceTheme.colors.widgetBackground, 
        modifier = GlanceModifier.fillMaxSize().padding(16.dp)
    ) {
        Column(
            modifier = GlanceModifier.fillMaxSize(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                message,
                style = TextStyle(color = GlanceTheme.colors.onSurface)
            )
            Spacer(modifier = GlanceModifier.height(8.dp))
            Image(
                provider = ImageProvider(R.drawable.react_logo),
                contentDescription = "React Logo",
                modifier = GlanceModifier
            )
        }
    }
}

@OptIn(ExperimentalGlancePreviewApi::class)
@Preview(widthDp = 180, heightDp = 304)
@Composable
fun HomeWidgetContentPreview() {
    HomeContent("Preview Message")
}