import { useState } from 'react'
import '@ant-design/v5-patch-for-react-19';
import { 
  App,
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Divider,
  Checkbox,
  Row,
  Col
} from 'antd'
import { 
  ArrowLeftOutlined,
  MailOutlined,
  LockOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  GoogleOutlined,
  FacebookOutlined,
  TwitterOutlined
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'

const { Title, Text, Link } = Typography

interface LoginPageProps {
  onNavigate?: (route: string) => void
}

interface LoginFormData {
  email: string
  password: string
  remember: boolean
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()

  // 获取重定向路径
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/profile'

  const handleSubmit = async (values: LoginFormData) => {
    try {
      setLoading(true)
      const success = await login(values.email, values.password)
      
      if (success) {
        message.success('登录成功！')
        navigate(from, { replace: true })
      } else {
        message.error('登录失败，请检查邮箱和密码')
      }
    } catch (error) {
      console.error('登录错误:', error)
      message.error('登录时发生错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/home')
    } else {
      navigate('/home')
    }
  }

  const handleRegister = () => {
    if (onNavigate) {
      onNavigate('/register')
    } else {
      navigate('/register')
    }
  }

  const handleSocialLogin = (provider: string) => {
    message.info(`${provider} 登录功能正在开发中...`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        paddingTop: '40px'
      }}>
        {/* 返回按钮 */}
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          style={{ 
            color: 'white', 
            marginBottom: '20px',
            fontSize: '16px' 
          }}
          onClick={handleBack}
        >
          返回
        </Button>

        <Card 
          style={{ 
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}
          variant={'borderless'}
        >
          {/* 页面标题 */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2} style={{ marginBottom: '8px', color: '#1890ff' }}>
              欢迎回来
            </Title>
            <Text type="secondary">
              登录您的账户以继续使用服务
            </Text>
          </div>

          {/* 登录表单 */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve()
                    }
                    // 如果是admin用户名，跳过邮箱验证
                    if (value === 'admin') {
                      return Promise.resolve()
                    }
                    // 其他情况验证邮箱格式
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (emailRegex.test(value)) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('请输入有效的邮箱地址'))
                  }
                }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="邮箱地址"
                style={{ borderRadius: '12px', height: '50px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少需要6位' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="密码"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                style={{ borderRadius: '12px', height: '50px' }}
              />
            </Form.Item>

            <Row justify="space-between" align="middle" style={{ marginBottom: '30px' }}>
              <Col>
                <Form.Item name="remember" valuePropName="checked" style={{ margin: 0 }}>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
              </Col>
              <Col>
                <Link style={{ color: '#1890ff' }}>忘记密码？</Link>
              </Col>
            </Row>

            {/* 管理员提示 */}
            <div style={{
              background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
              border: '1px solid #91d5ff',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                💡 管理员账号：admin / 密码：123456
              </Text>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: '50px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          {/* 社交登录 */}
          <Divider style={{ margin: '30px 0' }}>
            <Text type="secondary">或使用以下方式登录</Text>
          </Divider>

          <Row gutter={[12, 12]} style={{ marginBottom: '30px' }}>
            <Col span={8}>
              <Button
                type="default"
                icon={<GoogleOutlined />}
                block
                style={{
                  height: '45px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => handleSocialLogin('Google')}
              >
                Google
              </Button>
            </Col>
            <Col span={8}>
              <Button
                type="default"
                icon={<FacebookOutlined />}
                block
                style={{
                  height: '45px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => handleSocialLogin('Facebook')}
              >
                Facebook
              </Button>
            </Col>
            <Col span={8}>
              <Button
                type="default"
                icon={<TwitterOutlined />}
                block
                style={{
                  height: '45px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => handleSocialLogin('Twitter')}
              >
                Twitter
              </Button>
            </Col>
          </Row>

          {/* 注册链接 */}
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              还没有账户？{' '}
              <Link onClick={handleRegister} style={{ color: '#1890ff', fontWeight: '500' }}>
                立即注册
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
