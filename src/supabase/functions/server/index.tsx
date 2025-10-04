import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Country to currency mapping
const COUNTRY_CURRENCIES: Record<string, string> = {
  "USA": "USD",
  "United Kingdom": "GBP",
  "Canada": "CAD",
  "Australia": "AUD",
  "Germany": "EUR",
  "France": "EUR",
  "Spain": "EUR",
  "Italy": "EUR",
  "Japan": "JPY",
  "China": "CNY",
  "India": "INR",
  "Brazil": "BRL",
  "Mexico": "MXN",
  "Singapore": "SGD",
};

// Health check endpoint
app.get("/make-server-b40e02f6/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize demo data - creates demo company with admin, manager, and employee
app.post("/make-server-b40e02f6/init-demo", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const companyId = "demo-company-123";
    const currency = "USD";

    // Check if demo company already exists
    const existingCompany = await kv.get(`companies:${companyId}`);
    if (existingCompany) {
      return c.json({ 
        message: "Demo data already exists",
        credentials: {
          admin: { email: "admin@demoexpense.com", password: "Admin123!" },
          manager: { email: "manager@demoexpense.com", password: "Manager123!" },
          employee: { email: "employee@demoexpense.com", password: "Employee123!" }
        }
      });
    }

    // Create demo company
    const company = {
      id: companyId,
      name: "Demo Expense Corp",
      country: "USA",
      currency,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`companies:${companyId}`, company);

    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: "admin@demoexpense.com",
      password: "Admin123!",
      user_metadata: { name: "Alex Administrator" },
      email_confirm: true
    });

    if (adminError) {
      console.log('Demo init error - Failed to create admin:', adminError);
      return c.json({ error: "Failed to create admin user" }, 400);
    }

    const adminProfile = {
      id: adminData.user.id,
      email: "admin@demoexpense.com",
      name: "Alex Administrator",
      role: "admin",
      companyId,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`users:${adminData.user.id}`, adminProfile);
    await kv.set(`company_users:${companyId}:${adminData.user.id}`, adminData.user.id);

    // Create manager user
    const { data: managerData, error: managerError } = await supabase.auth.admin.createUser({
      email: "manager@demoexpense.com",
      password: "Manager123!",
      user_metadata: { name: "Maria Manager" },
      email_confirm: true
    });

    if (managerError) {
      console.log('Demo init error - Failed to create manager:', managerError);
      return c.json({ error: "Failed to create manager user" }, 400);
    }

    const managerProfile = {
      id: managerData.user.id,
      email: "manager@demoexpense.com",
      name: "Maria Manager",
      role: "manager",
      companyId,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`users:${managerData.user.id}`, managerProfile);
    await kv.set(`company_users:${companyId}:${managerData.user.id}`, managerData.user.id);

    // Create employee user
    const { data: employeeData, error: employeeError } = await supabase.auth.admin.createUser({
      email: "employee@demoexpense.com",
      password: "Employee123!",
      user_metadata: { name: "John Employee" },
      email_confirm: true
    });

    if (employeeError) {
      console.log('Demo init error - Failed to create employee:', employeeError);
      return c.json({ error: "Failed to create employee user" }, 400);
    }

    const employeeProfile = {
      id: employeeData.user.id,
      email: "employee@demoexpense.com",
      name: "John Employee",
      role: "employee",
      companyId,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`users:${employeeData.user.id}`, employeeProfile);
    await kv.set(`company_users:${companyId}:${employeeData.user.id}`, employeeData.user.id);

    // Create some sample expenses
    const sampleExpenses = [
      {
        id: crypto.randomUUID(),
        userId: employeeData.user.id,
        userName: "John Employee",
        companyId,
        type: "Travel",
        amount: 450.00,
        currency,
        description: "Flight to client meeting in Boston",
        date: "2025-10-01",
        status: "pending",
        submittedAt: new Date("2025-10-02").toISOString(),
        approvedAt: null,
        approvedBy: null,
      },
      {
        id: crypto.randomUUID(),
        userId: employeeData.user.id,
        userName: "John Employee",
        companyId,
        type: "Meals",
        amount: 85.50,
        currency,
        description: "Team lunch with clients",
        date: "2025-09-28",
        status: "approved",
        submittedAt: new Date("2025-09-29").toISOString(),
        approvedAt: new Date("2025-09-30").toISOString(),
        approvedBy: "Maria Manager",
      },
      {
        id: crypto.randomUUID(),
        userId: employeeData.user.id,
        userName: "John Employee",
        companyId,
        type: "Software",
        amount: 299.00,
        currency,
        description: "Annual subscription to productivity tools",
        date: "2025-09-25",
        status: "rejected",
        submittedAt: new Date("2025-09-26").toISOString(),
        approvedAt: new Date("2025-09-27").toISOString(),
        approvedBy: "Maria Manager",
      },
    ];

    for (const expense of sampleExpenses) {
      await kv.set(`expenses:${expense.id}`, expense);
      await kv.set(`company_expenses:${companyId}:${expense.id}`, expense.id);
      await kv.set(`user_expenses:${employeeData.user.id}:${expense.id}`, expense.id);
    }

    return c.json({ 
      success: true,
      message: "Demo data initialized successfully",
      credentials: {
        admin: { 
          email: "admin@demoexpense.com", 
          password: "Admin123!",
          name: "Alex Administrator",
          role: "admin"
        },
        manager: { 
          email: "manager@demoexpense.com", 
          password: "Manager123!",
          name: "Maria Manager",
          role: "manager"
        },
        employee: { 
          email: "employee@demoexpense.com", 
          password: "Employee123!",
          name: "John Employee",
          role: "employee"
        }
      },
      company: company.name,
      sampleExpensesCreated: sampleExpenses.length
    });
  } catch (error) {
    console.log('Demo init error - Unexpected error:', error);
    return c.json({ error: "Failed to initialize demo data" }, 500);
  }
});

// Sign up - creates company and admin user
app.post("/make-server-b40e02f6/signup", async (c) => {
  try {
    const { email, password, name, companyName, country } = await c.req.json();

    if (!email || !password || !name || !companyName || !country) {
      return c.json({ error: "All fields are required" }, 400);
    }

    // Create user with Supabase Auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log('Sign up error - Supabase auth error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    const userId = authData.user.id;
    const companyId = crypto.randomUUID();
    const currency = COUNTRY_CURRENCIES[country] || "USD";

    // Create company
    const company = {
      id: companyId,
      name: companyName,
      country,
      currency,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`companies:${companyId}`, company);

    // Create user profile
    const userProfile = {
      id: userId,
      email,
      name,
      role: "admin", // First user is admin
      companyId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`users:${userId}`, userProfile);
    await kv.set(`company_users:${companyId}:${userId}`, userId);

    return c.json({ 
      success: true, 
      user: userProfile, 
      company,
      message: "Account created successfully" 
    });
  } catch (error) {
    console.log('Sign up error - Unexpected error during signup:', error);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Get user profile
app.get("/make-server-b40e02f6/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log('Profile error - Authentication failed:', error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`users:${user.id}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    const company = await kv.get(`companies:${userProfile.companyId}`);

    return c.json({ user: userProfile, company });
  } catch (error) {
    console.log('Profile error - Unexpected error fetching profile:', error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Submit expense
app.post("/make-server-b40e02f6/expenses", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log('Expense submission error - Authentication failed:', error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`users:${user.id}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    const { type, amount, description, date } = await c.req.json();

    if (!type || !amount || !description || !date) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const company = await kv.get(`companies:${userProfile.companyId}`);
    const expenseId = crypto.randomUUID();

    const expense = {
      id: expenseId,
      userId: user.id,
      userName: userProfile.name,
      companyId: userProfile.companyId,
      type,
      amount: parseFloat(amount),
      currency: company.currency,
      description,
      date,
      status: "pending",
      submittedAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
    };

    await kv.set(`expenses:${expenseId}`, expense);
    await kv.set(`company_expenses:${userProfile.companyId}:${expenseId}`, expenseId);
    await kv.set(`user_expenses:${user.id}:${expenseId}`, expenseId);

    return c.json({ success: true, expense });
  } catch (error) {
    console.log('Expense submission error - Failed to create expense:', error);
    return c.json({ error: "Failed to create expense" }, 500);
  }
});

// Get all expenses (filtered by user role)
app.get("/make-server-b40e02f6/expenses", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log('Get expenses error - Authentication failed:', error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`users:${user.id}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    // If admin, get all company expenses, otherwise get only user's expenses
    const prefix = userProfile.role === "admin" 
      ? `company_expenses:${userProfile.companyId}:`
      : `user_expenses:${user.id}:`;

    const expenseIds = await kv.getByPrefix(prefix);
    const expenses = await Promise.all(
      expenseIds.map((id: string) => kv.get(`expenses:${id}`))
    );

    return c.json({ expenses: expenses.filter(Boolean) });
  } catch (error) {
    console.log('Get expenses error - Failed to fetch expenses:', error);
    return c.json({ error: "Failed to fetch expenses" }, 500);
  }
});

// Approve expense
app.post("/make-server-b40e02f6/expenses/:id/approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log('Approve expense error - Authentication failed:', error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`users:${user.id}`);
    if (!userProfile || userProfile.role !== "admin") {
      return c.json({ error: "Only admins can approve expenses" }, 403);
    }

    const expenseId = c.req.param('id');
    const expense = await kv.get(`expenses:${expenseId}`);

    if (!expense) {
      return c.json({ error: "Expense not found" }, 404);
    }

    if (expense.companyId !== userProfile.companyId) {
      return c.json({ error: "Cannot approve expenses from other companies" }, 403);
    }

    expense.status = "approved";
    expense.approvedAt = new Date().toISOString();
    expense.approvedBy = userProfile.name;

    await kv.set(`expenses:${expenseId}`, expense);

    return c.json({ success: true, expense });
  } catch (error) {
    console.log('Approve expense error - Failed to approve expense:', error);
    return c.json({ error: "Failed to approve expense" }, 500);
  }
});

// Reject expense
app.post("/make-server-b40e02f6/expenses/:id/reject", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log('Reject expense error - Authentication failed:', error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`users:${user.id}`);
    if (!userProfile || userProfile.role !== "admin") {
      return c.json({ error: "Only admins can reject expenses" }, 403);
    }

    const expenseId = c.req.param('id');
    const expense = await kv.get(`expenses:${expenseId}`);

    if (!expense) {
      return c.json({ error: "Expense not found" }, 404);
    }

    if (expense.companyId !== userProfile.companyId) {
      return c.json({ error: "Cannot reject expenses from other companies" }, 403);
    }

    expense.status = "rejected";
    expense.approvedAt = new Date().toISOString();
    expense.approvedBy = userProfile.name;

    await kv.set(`expenses:${expenseId}`, expense);

    return c.json({ success: true, expense });
  } catch (error) {
    console.log('Reject expense error - Failed to reject expense:', error);
    return c.json({ error: "Failed to reject expense" }, 500);
  }
});

Deno.serve(app.fetch);
