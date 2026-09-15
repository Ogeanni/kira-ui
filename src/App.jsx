import { Routes, Route, Navigate } from 'react-router-dom'
import { Workspace } from './pages/Workspace'
import { Report } from './pages/Report'

export default function App() {
  return (
    <Routes>
      <Route path="/"                           element={<Workspace />} />
      <Route path="/report/:clientId/:runId"    element={<Report />} />
      <Route path="*"                           element={<Navigate to="/" replace />} />
    </Routes>
  )
}
