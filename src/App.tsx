import { BrowserRouter } from 'react-router-dom'
import Router from "./routes/Router"
import { ConfigProvider, App as AntdApp } from 'antd'
import Layout from './components/Layout'
import './App.css'

function App() {
  return (
    <ConfigProvider>
      <AntdApp>
        <BrowserRouter>
          <Layout>
            <Router />
          </Layout>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
