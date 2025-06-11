import ExpoModulesCore

public class ExpoAndroidGlanceWidgetModule: Module {

    public func definition() -> ModuleDefinition {

        Name("ExpoAndroidGlanceWidget")

        // set function for String
        Function("setString") { (key: String, value: String) -> Void in
            //
        }

        // set function for Boolean
        Function("setBoolean") { (key: String, value: Bool) -> Void in
            //
        }

        // set function for Int
        Function("setInt") { (key: String, value: Int) -> Void in
            //
        }

        // set function for Long
        Function("setLong") { (key: String, value: Int64) -> Void in
            //
        }

        // set function for Float
        Function("setFloat") { (key: String, value: Float) -> Void in
            //
        }

        // set function for StringSet
        Function("setStringSet") { (key: String, value: [String]) -> Void in
            //
        }

        // set function for Objects
        Function("setObject") { (key: String, data: [String: Any]) -> Bool in
            //
        }

        // set function for Arrays of Objects
        Function("setArray") { (key: String, data: [Any]) -> Bool in
            //
        }

        // get function that returns data of any type
        Function("get") { (key: String) -> Any? in
            //
        }

        // Utility functions
        Function("hasKey") { (key: String) -> Bool in
            //
        }

        Function("removeKey") { (key: String) -> Void in
            //
        }

        Function("clearAll") { () -> Void in
            //
        }

        Function("getAllKeys") { () -> [String] in
            //
        }
    }
}
