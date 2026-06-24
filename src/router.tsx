import { createBrowserRouter } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import Home from "@/pages/Home";
import ToolPage from "@/pages/ToolPage";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      { path: "tools/:toolId", element: <ToolPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
