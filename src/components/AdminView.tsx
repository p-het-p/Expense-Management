import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LogOut, Building2, User, Shield, DollarSign, TrendingUp, UserPlus, UserMinus } from "lucide-react";
import { projectId } from "../utils/supabase/info";
import { getSupabaseClient } from "../utils/supabase/client";

interface AdminViewProps {
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

export function AdminView({ accessToken, onLogout }: AdminViewProps) {
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
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    onLogout();
  };

  // Calculate analytics
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const approvedExpenses = expenses.filter(e => e.status === 'approved');
  const rejectedExpenses = expenses.filter(e => e.status === 'rejected');
  const pendingAmount = pendingExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const approvedAmount = approvedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group expenses by type
  const expensesByType = expenses.reduce((acc, exp) => {
    acc[exp.type] = (acc[exp.type] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header - Purple/Indigo Theme for Admin */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              <h1>ExpenseFlow Admin</h1>
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
                <span className="px-2 py-1 bg-purple-500 rounded text-sm">
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
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 mb-1">Total Expenses</p>
                  <h3 className="text-purple-900">{expenses.length}</h3>
                  <p className="text-xs text-purple-500 mt-1">
                    {company?.currency} {totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 mb-1">Pending</p>
                  <h3 className="text-orange-900">{pendingExpenses.length}</h3>
                  <p className="text-xs text-orange-500 mt-1">
                    {company?.currency} {pendingAmount.toFixed(2)}
                  </p>
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
                  <p className="text-xs text-green-500 mt-1">
                    {company?.currency} {approvedAmount.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-green-600" />
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
                  <p className="text-xs text-red-500 mt-1">System Protected</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <UserMinus className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white border border-purple-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              All Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Distribution by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(expensesByType).map(([type, amount]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{type}</span>
                          <span className="text-purple-600">
                            {company?.currency} {amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${(amount / totalExpenses) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="text-sm">{expense.userName}</p>
                          <p className="text-xs text-gray-500">{expense.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{expense.amount} {expense.currency}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            expense.status === 'approved' 
                              ? 'bg-green-100 text-green-700' 
                              : expense.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {expense.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company-Wide Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Average Expense</p>
                    <h2 className="text-purple-600">
                      {company?.currency} {(totalExpenses / expenses.length || 0).toFixed(2)}
                    </h2>
                  </div>
                  <div className="text-center p-6 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Approval Rate</p>
                    <h2 className="text-indigo-600">
                      {((approvedExpenses.length / (expenses.length || 1)) * 100).toFixed(1)}%
                    </h2>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Pending Review</p>
                    <h2 className="text-blue-600">{pendingExpenses.length}</h2>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Company Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-200 bg-purple-50">
                        <th className="text-left p-3">Employee</th>
                        <th className="text-left p-3">Description</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Approved By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-b border-gray-100 hover:bg-purple-50/50">
                          <td className="p-3">{expense.userName}</td>
                          <td className="p-3">{expense.description}</td>
                          <td className="p-3">{expense.type}</td>
                          <td className="p-3">{expense.amount} {expense.currency}</td>
                          <td className="p-3">{new Date(expense.date).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              expense.status === 'approved' 
                                ? 'bg-green-100 text-green-700' 
                                : expense.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {expense.status}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {expense.approvedBy || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
