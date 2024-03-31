import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthContextProvider } from "./contexts/AuthContextProvider.tsx"
import Home from "./pages/home.jsx"
import { ThemeProvider } from "./contexts/ThemeProvider.tsx"
import { Signup } from "./pages/signup.tsx"
import { HeaderLayout } from "./components/HeaderLayout.tsx"

const browserRouter = createBrowserRouter([
  {
    element: <HeaderLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
    ],
  },
])
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <ThemeProvider>
          <RouterProvider router={browserRouter} />
        </ThemeProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
