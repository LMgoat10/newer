import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/', { replace: true })
  }

  const handleGoLogin = () => {
    navigate('/login', { 
      replace: true, 
      state: { isAdmin: true } 
    })
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。只有管理员才能访问管理后台。"
        extra={[
          <Button type="primary" key="login" onClick={handleGoLogin}>
            管理员登录
          </Button>,
          <Button key="home" onClick={handleGoHome}>
            返回首页
          </Button>
        ]}
      />
    </div>
  )
}

export default UnauthorizedPage
