import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, DollarSign, User, CheckCircle, XCircle, Clock } from "lucide-react";

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

interface ExpenseCardProps {
  expense: Expense;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3>{expense.type}</h3>
              <Badge className={getStatusColor(expense.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(expense.status)}
                  {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                </span>
              </Badge>
            </div>
            <p className="text-gray-600">{expense.description}</p>
          </div>
          <div className="text-right">
            <div className="text-blue-600">{formatAmount(expense.amount, expense.currency)}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{expense.userName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(expense.date)}</span>
          </div>
          {expense.approvedBy && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>By {expense.approvedBy}</span>
            </div>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-400">
          Submitted {formatDate(expense.submittedAt)}
        </div>
      </CardContent>
    </Card>
  );
}
