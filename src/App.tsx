import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { BoardPage } from "./pages/Board";
import { Profile } from "./pages/Profile";
import { AdminPanel } from "./pages/AdminPanel";
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
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
                path="/admin" 
                element={
                  <PrivateRoute>
                    <AdminPanel />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile/:uid" 
                element={
                  <PrivateRoute>
                    <Profile />
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
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
