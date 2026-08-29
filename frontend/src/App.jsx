import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import PostsListPage from './pages/PostsListPage'
import PostReadPage from './pages/PostReadPage'
import PostCreatePage from './pages/PostCreatePage'
import PostEditPage from './pages/PostEditPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <main className="app">
          <Routes>
            <Route path="/" element={<PostsListPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/posts/new"
              element={
                <ProtectedRoute>
                  <PostCreatePage />
                </ProtectedRoute>
              }
            />
            <Route path="/posts/:id" element={<PostReadPage />} />
            <Route
              path="/posts/:id/edit"
              element={
                <ProtectedRoute>
                  <PostEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App