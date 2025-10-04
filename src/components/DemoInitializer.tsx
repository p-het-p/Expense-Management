import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, Check, Loader2, LogIn } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface DemoInitializerProps {
  onAutoFill?: (email: string, password: string) => void;
}

export function DemoInitializer({ onAutoFill }: DemoInitializerProps) {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");

  const initializeDemo = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b40e02f6/init-demo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize demo");
      }

      console.log("Demo initialized:", data);
      setInitialized(true);
    } catch (err) {
      console.error("Demo initialization error:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize demo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Demo Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!initialized ? (
          <>
            <p className="text-gray-600">
              Click below to create demo accounts with sample data:
            </p>
            <Button 
              onClick={initializeDemo} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Initialize Demo Data
                </>
              )}
            </Button>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span>Demo accounts created successfully!</span>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded">ADMIN</span>
                    <span className="text-xs text-purple-600">Executive Dashboard</span>
                  </div>
                  {onAutoFill && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => onAutoFill("admin@demoexpense.com", "Admin123!")}
                    >
                      <LogIn className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Email:</span> admin@demoexpense.com</p>
                  <p><span className="text-gray-600">Password:</span> Admin123!</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs rounded">MANAGER</span>
                    <span className="text-xs text-blue-600">Approval Interface</span>
                  </div>
                  {onAutoFill && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => onAutoFill("manager@demoexpense.com", "Manager123!")}
                    >
                      <LogIn className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Email:</span> manager@demoexpense.com</p>
                  <p><span className="text-gray-600">Password:</span> Manager123!</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs rounded">EMPLOYEE</span>
                    <span className="text-xs text-green-600">Expense Submission</span>
                  </div>
                  {onAutoFill && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => onAutoFill("employee@demoexpense.com", "Employee123!")}
                    >
                      <LogIn className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Email:</span> employee@demoexpense.com</p>
                  <p><span className="text-gray-600">Password:</span> Employee123!</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 pt-2">
              Use these credentials to sign in and explore the expense management system.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
