import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthProvider";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { ProjectList } from "@/pages/projects/ProjectList";
import { NewProject } from "@/pages/projects/NewProject";
import { ProjectDetail } from "@/pages/projects/ProjectDetail";
import { UserList } from "@/pages/users/UserList";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/new" element={<NewProject />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="users" element={<UserList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
