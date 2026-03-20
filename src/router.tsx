import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./ui/AppShell";
import { AuthGate } from "./ui/AuthGate";
import { DashboardPage } from "./ui/DashboardPage";
import { JobDetailPage } from "./ui/JobDetailPage";
import { LoginPage } from "./ui/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <AuthGate>
        <AppShell />
      </AuthGate>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "job/:id",
        element: <JobDetailPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
