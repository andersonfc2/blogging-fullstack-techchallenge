import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import PostsListPage from './pages/PostsListPage'
import PostReadPage from './pages/PostReadPage'
import PostCreatePage from './pages/PostCreatePage'
import PostEditPage from './pages/PostEditPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <main className="app">
        <Routes>
          <Route path="/" element={<PostsListPage />} />
          <Route path="/posts/new" element={<PostCreatePage />} />
          <Route path="/posts/:id" element={<PostReadPage />} />
          <Route path="/posts/:id/edit" element={<PostEditPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App