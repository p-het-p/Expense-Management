import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LogOut, Building2, User, ClipboardCheck, CheckCircle, XCircle } from "lucide-react";
import { projectId } from "../utils/supabase/info";
import { getSupabaseClient } from "../utils/supabase/client";

interface ManagerViewProps {
  accessToken: string;
  onLogout: () => void;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

interface Company {
  id: string;
  name: string;
  country: string;
  currency: string;
}

interface Expense {
  id: string;
  userId: string;
  userName: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: string;
  submittedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
}

export function ManagerView({ accessToken, onLogout }: ManagerViewProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadExpenses();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b40e02f6/profile`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setCompany(data.company);
      } else {
        console.error("Failed to load profile:", data.error);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b40e02f6/expenses`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setExpenses(data.expenses || []);
      } else {
        console.error("Failed to load expenses:", data.error);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  };

  const handleApprove = async (expenseId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b40e02f6/expenses/${expenseId}/approve`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setExpenses(expenses.map(exp => 
          exp.id === expenseId ? data.expense : exp
        ));
      } else {
        console.error("Failed to approve expense:", data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error approving expense:", error);
      alert("Failed to approve expense");
    }
  };

  const handleReject = async (expenseId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b40e02f6/expenses/${expenseId}/reject`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setExpenses(expenses.map(exp => 
          exp.id === expenseId ? data.expense : exp
        ));
      } else {
        console.error("Failed to reject expense:", data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error rejecting expense:", error);
      alert("Failed to reject expense");
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header - Blue Theme for Manager */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6" />
              <h1>ExpenseFlow Manager</h1>
            </div>
            {company && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Building2 className="w-4 h-4" />
                <span>{company.name}</span>
                <span className="text-white/60">•</span>
                <span>{company.currency}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
                <span className="px-2 py-1 bg-blue-500 rounded text-sm">
                  {user.role.toUpperCase()}
                </span>
              </div>
            )}
            <Button variant="outline" onClick={handleSignOut} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Quick Stats for Manager */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 mb-1">Pending Approval</p>
                  <h3 className="text-orange-900">{expenses.filter(e => e.status === 'pending').length}</h3>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 mb-1">Approved Today</p>
                  <h3 className="text-green-900">{expenses.filter(e => e.status === 'approved').length}</h3>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 mb-1">Rejected</p>
                  <h3 className="text-red-900">{expenses.filter(e => e.status === 'rejected').length}</h3>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <ClipboardCheck className="w-5 h-5" />
              Expense Approval Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-blue-200 bg-gradient-to-r from-blue-100 to-cyan-100">
                    <th className="text-left p-4 text-blue-900">
                      Approval subject
                    </th>
                    <th className="text-left p-4 text-blue-900">
                      Requester Name
                    </th>
                    <th className="text-left p-4 text-blue-900">
                      Category
                    </th>
                    <th className="text-left p-4 text-blue-900">
                      Request status
                    </th>
                    <th className="text-left p-4 text-blue-900">
                      Total amount(In company currency)
                    </th>
                    <th className="text-left p-4 text-blue-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No expenses found
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-blue-100 hover:bg-blue-50/50 transition-colors">
                        <td className="p-4">
                          {expense.description || "none"}
                        </td>
                        <td className="p-4">
                          {expense.userName}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                            {expense.type.toLowerCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded ${
                            expense.status === 'approved' 
                              ? 'bg-green-100 text-green-700' 
                              : expense.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {expense.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                            {expense.status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          {expense.amount} {expense.currency}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(expense.id)}
                              disabled={expense.status !== 'pending'}
                              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(expense.id)}
                              disabled={expense.status !== 'pending'}
                              variant="outline"
                              className="border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>


      </main>
    </div>
  );
}
