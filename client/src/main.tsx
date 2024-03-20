import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Blogs from "./components/Blogs/Blogs.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// import { AuthContextProvider } from "./contexts/AuthContextProvider.tsx"

const browserRouter = createBrowserRouter([
  { path: "/", element: <App />,},
  { path: "/signup", element: <SignUp /> },
  { path: "/login", element: <Login /> },
  { path: "/blogs", element: <Blogs /> },
]);
// const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <QueryClientProvider client={queryClient}>
      <AuthContextProvider> */}
    <RouterProvider router={browserRouter} />
    {/* </AuthContextProvider>
    </QueryClientProvider> */}
  </React.StrictMode>
);
