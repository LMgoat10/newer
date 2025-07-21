import { BrowserRouter } from 'react-router-dom'
import Router from "./routes/Router"
import { ConfigProvider, App as AntdApp } from 'antd'
import './App.css'

function App() {
  return (
    <ConfigProvider>
      <AntdApp>
        <BrowserRouter>
            <Router />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
