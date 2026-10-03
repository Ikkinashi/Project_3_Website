import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Packages from './pages/Packages'
import Billing from './pages/Billing'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/packages" element={<Packages />} />
        <Route path="/billing" element={<Billing />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App