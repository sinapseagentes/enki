import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { BoardPage } from "./pages/Board";
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/board/:id" 
              element={
                <PrivateRoute>
                  <BoardPage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
