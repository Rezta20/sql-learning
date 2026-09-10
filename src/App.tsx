import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { TodayPage } from './pages/TodayPage'
import { MapPage } from './pages/MapPage'
import { StagePage } from './pages/StagePage'
import { DayPage } from './pages/DayPage'
import { QuizPage } from './pages/QuizPage'
import { ResultPage } from './pages/ResultPage'
import { SetupPage } from './pages/SetupPage'
import { CardsPage } from './pages/CardsPage'
import { JournalPage } from './pages/JournalPage'
import { SyncPage } from './pages/SyncPage'
import { StuckPage } from './pages/StuckPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<TodayPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/sync" element={<SyncPage />} />
            <Route path="/stuck" element={<StuckPage />} />
            <Route path="/day/:id" element={<StagePage />} />
            <Route path="/day/:id/detail" element={<DayPage />} />
            <Route path="/day/:id/quiz" element={<QuizPage />} />
            <Route path="/day/:id/result" element={<ResultPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
