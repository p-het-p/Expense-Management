import AppNav from "@/components/app-nav"
import WorkflowEditor from "@/components/admin/workflow-editor"
import { UserProvider } from "@/components/auth/user-context"

export default function WorkflowsPage() {
  return (
    <UserProvider>
      <AppNav />
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-xl font-semibold mb-4">Admin · Approval Rules</h1>
        <WorkflowEditor />
      </main>
    </UserProvider>
  )
}
