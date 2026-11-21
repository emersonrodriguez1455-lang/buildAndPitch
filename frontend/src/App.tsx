import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}
