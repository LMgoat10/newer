declare global {
  interface Window {
    baseURL: string;
  }
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App } from 'antd'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import AppComponent from './App.tsx'
window.baseURL = import.meta.env.VITE_API_URL;
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <App>
        <AuthProvider>
          <AppComponent />
        </AuthProvider>
      </App>
    </ConfigProvider>
  </StrictMode>,
)
