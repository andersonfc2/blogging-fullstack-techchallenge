import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import PostsListPage from './pages/PostsListPage'
import PostReadPage from './pages/PostReadPage'

function App() {
  return (
    <BrowserRouter>
      <main className="app">
        <Routes>
          <Route path="/" element={<PostsListPage />} />
          <Route path="/posts/:id" element={<PostReadPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App