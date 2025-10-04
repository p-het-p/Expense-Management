import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseCard } from "./ExpenseCard";
import { ApprovalQueue } from "./ApprovalQueue";
import { Plus, LogOut, Building2, User, Receipt, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { projectId } from "../utils/supabase/info";
import { getSupabaseClient } from "../utils/supabase/client";

interface DashboardProps {
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

export function Dashboard({ accessToken, onLogout }: DashboardProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

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

  const handleExpenseSubmit = async (expenseData: any) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b40e02f6/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(expenseData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setExpenses([data.expense, ...expenses]);
        setShowExpenseForm(false);
      } else {
        console.error("Failed to submit expense:", data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
      alert("Failed to submit expense");
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

  const pendingExpenses = expenses.filter(e => e.status === "pending");
  const approvedExpenses = expenses.filter(e => e.status === "approved");
  const rejectedExpenses = expenses.filter(e => e.status === "rejected");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header - Green/Teal Theme for Employee */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              <h1>ExpenseFlow</h1>
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
                <span className="px-2 py-1 bg-green-500 rounded text-sm">
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
        {showExpenseForm ? (
          <div className="max-w-2xl mx-auto">
            <ExpenseForm
              onSubmit={handleExpenseSubmit}
              onCancel={() => setShowExpenseForm(false)}
              currency={company?.currency || "USD"}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-green-900">My Expenses</h2>
              <Button onClick={() => setShowExpenseForm(true)} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                New Expense
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 mb-1">Pending</p>
                      <h3 className="text-orange-900">{pendingExpenses.length}</h3>
                      <p className="text-xs text-orange-500 mt-1">Awaiting approval</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 mb-1">Approved</p>
                      <h3 className="text-green-900">{approvedExpenses.length}</h3>
                      <p className="text-xs text-green-500 mt-1">Reimbursed</p>
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
                      <h3 className="text-red-900">{rejectedExpenses.length}</h3>
                      <p className="text-xs text-red-500 mt-1">Need revision</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Approval Queue */}
            {user?.role === "admin" && pendingExpenses.length > 0 && (
              <div className="mb-6">
                <ApprovalQueue
                  expenses={pendingExpenses}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            )}

            {/* Expense Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white border border-green-200">
                <TabsTrigger value="all" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">All Expenses</TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Pending</TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Approved</TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {expenses.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No expenses found. Click "New Expense" to get started.
                    </CardContent>
                  </Card>
                ) : (
                  expenses.map(expense => (
                    <ExpenseCard key={expense.id} expense={expense} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 mt-6">
                {pendingExpenses.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No pending expenses
                    </CardContent>
                  </Card>
                ) : (
                  pendingExpenses.map(expense => (
                    <ExpenseCard key={expense.id} expense={expense} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4 mt-6">
                {approvedExpenses.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No approved expenses
                    </CardContent>
                  </Card>
                ) : (
                  approvedExpenses.map(expense => (
                    <ExpenseCard key={expense.id} expense={expense} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-6">
                {rejectedExpenses.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No rejected expenses
                    </CardContent>
                  </Card>
                ) : (
                  rejectedExpenses.map(expense => (
                    <ExpenseCard key={expense.id} expense={expense} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
