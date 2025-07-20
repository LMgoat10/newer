import { BrowserRouter } from 'react-router-dom'
import { App as AntApp } from 'antd'
import Router from "./routes/Router"
import './App.css'

function App() {
  return (
    <AntApp>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </AntApp>
  )
}

export default App
