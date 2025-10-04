import { useState, useEffect } from "react";
import { SignUp } from "./components/SignUp";
import { SignIn } from "./components/SignIn";
import { Dashboard } from "./components/Dashboard";
import { ManagerView } from "./components/ManagerView";
import { AdminView } from "./components/AdminView";
import { getSupabaseClient } from "./utils/supabase/client";
import { projectId } from "./utils/supabase/info";

type AuthState = "signup" | "signin" | "authenticated";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>("signin");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const supabase = getSupabaseClient();

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        setAccessToken(session.access_token);
        
        // Fetch user profile to get role
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b40e02f6/profile`,
          {
            headers: {
              "Authorization": `Bearer ${session.access_token}`,
            },
          }
        );
        
        const data = await response.json();
        if (response.ok && data.user) {
          setUserRole(data.user.role);
        }
        
        setAuthState("authenticated");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSuccess = () => {
    setAuthState("signin");
  };

  const handleSignInSuccess = async (token: string) => {
    setAccessToken(token);
    
    // Fetch user profile to get role
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b40e02f6/profile`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      if (response.ok && data.user) {
        setUserRole(data.user.role);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
    
    setAuthState("authenticated");
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUserRole(null);
    setAuthState("signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (authState === "authenticated" && accessToken) {
    // Route users based on their role
    if (userRole === "admin") {
      return <AdminView accessToken={accessToken} onLogout={handleLogout} />;
    }
    if (userRole === "manager") {
      return <ManagerView accessToken={accessToken} onLogout={handleLogout} />;
    }
    // Default to employee dashboard
    return <Dashboard accessToken={accessToken} onLogout={handleLogout} />;
  }

  if (authState === "signup") {
    return (
      <SignUp
        onSuccess={handleSignUpSuccess}
        onSwitchToSignIn={() => setAuthState("signin")}
      />
    );
  }

  return (
    <SignIn
      onSuccess={handleSignInSuccess}
      onSwitchToSignUp={() => setAuthState("signup")}
    />
  );
}
