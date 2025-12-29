import { useState, useEffect } from 'react'
import '@ant-design/v5-patch-for-react-19';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Divider,
  Upload,
  Avatar,
  Checkbox,
  Row,
  Col,
  App
} from 'antd'
import { 
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  CameraOutlined,
  GoogleOutlined,
  FacebookOutlined,
  TwitterOutlined
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { AuthService } from '../services/authService'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Link } = Typography

interface RegisterPageProps {
  onNavigate: (route: string) => void
}

interface RegisterFormData {
  name: string
  email: string
  verificationCode: string
  password: string
  confirmPassword: string
  phone: string
  agreement: boolean
}

function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [avatarFileName, setAvatarFileName] = useState<string>('')
  const [codeSending, setCodeSending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [codeVerified, setCodeVerified] = useState(false)
  const [codeInputVisible, setCodeInputVisible] = useState(false)
  const navigate = useNavigate()
  const { message } = App.useApp()

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const email = form.getFieldValue('email')
      if (!email) {
        message.error('请先输入邮箱地址')
        return
      }
      
      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        message.error('请输入正确的邮箱格式')
        return
      }

      setCodeSending(true)
      
      // 调用发送验证码API - 使用URL编码格式
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mail/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}`
      })

      const result = await response.json()
      
      if (result.success || result.status === 0) {
        message.success('验证码已发送，请查看您的邮箱')
        setCountdown(60) // 60秒倒计时
        setCodeInputVisible(true) // 显示验证码输入框
      } else {
        message.error(result.message || '发送验证码失败')
      }
    } catch (error) {
      console.error('发送验证码错误:', error)
      message.error('网络错误，请重试')
    } finally {
      setCodeSending(false)
    }
  }

  // 验证邮箱验证码
  const handleVerifyCode = async (email: string, code: string) => {
    if (!email || !code || code.length !== 6) {
      return false
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mail/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
      })

      const result = await response.json()
      
      if (result.success) {
        setCodeVerified(true)
        return true
      } else {
        setCodeVerified(false)
        message.error(result.message || '验证码验证失败')
        return false
      }
    } catch (error) {
      console.error('验证码验证错误:', error)
      setCodeVerified(false)
      return false
    }
  }

  // 处理头像上传
  const handleAvatarChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'done') {
      setAvatarFileName(info.file.response.fileName)
    }
  }

  // 处理注册表单提交
  const handleRegister = async (values: RegisterFormData) => {
    try {
      setLoading(true)

      // 1. 确保验证码已验证
      if (!codeVerified) {
        message.error('请先验证邮箱验证码')
        return
      }
      
      if (!codeVerified) {
        message.error('请先验证邮箱验证码')
        return
      }

      // 2. 准备注册数据
      const registerData = {
        name: values.name,
        email: values.email,
        verificationCode: values.verificationCode,
        password: values.password,
        phone: values.phone,
        avatarFileName: avatarFileName,
      }

      // 3. 调用注册API
      const response = await AuthService.register(registerData)

      if (response.status === 0) {
        message.success('注册成功! 请登录您的账户')
        // 注册成功后跳转到登录页面
        if (onNavigate) {
          onNavigate('/login')
        } else {
          navigate('/login')
        }
      } else {
        message.error(response.message || '注册失败，请重试')
      }
    } catch (error) {
      console.error('注册错误:', error)
      message.error('网络错误，请检查您的连接')
    } finally {
      setLoading(false)
    }
  }

  // 社交媒体注册（占位符功能）
  const handleSocialRegister = (provider: string) => {
    message.info(`${provider} 注册功能开发中...`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card 
          className="w-full max-w-md shadow-lg border-0"
          style={{ borderRadius: '24px', padding: '32px' }}
        >
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <Title level={2} style={{ marginBottom: '8px', color: '#1890ff'  }}>
              加入旅游订票系统
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              创建您的账户以开始旅程
            </Text>
          </div>

          {/* Avatar Upload */}
          <div className="text-center mb-6">
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action={`${window.baseURL}/api/upload/avatar`}
              onChange={handleAvatarChange}
            >
              {avatarFileName ? (
                <Avatar size={80} src={`${window.baseURL}/api/user/avatar/${avatarFileName}`} />
              ) : (
                <div className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-full hover:border-blue-500 transition-colors">
                  <CameraOutlined style={{ fontSize: '24px', color: '#666' }} />
                  <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                    上传头像
                  </Text>
                </div>
              )}
            </Upload>
            <div className="mt-2">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                可选的个人头像
              </Text>
            </div>
          </div>

          {/* Registration Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleRegister}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Please enter your full name' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="用户名"
                style={{ borderRadius: '12px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="邮箱"
                style={{ borderRadius: '12px', height: '48px' }}
                onChange={() => {
                  // 邮箱变化时重置验证状态
                  setCodeVerified(false)
                  setCountdown(0)
                  setCodeInputVisible(false) // 隐藏验证码输入框
                }}
                suffix={
                  <Button
                    type="link"
                    size="small"
                    loading={codeSending}
                    disabled={countdown > 0}
                    onClick={handleSendCode}
                    style={{ 
                      padding: '0 8px',
                      fontSize: '12px',
                      height: 'auto'
                    }}
                  >
                    {countdown > 0 ? `${countdown}s` : '发送验证码'}
                  </Button>
                }
              />
            </Form.Item>

              <Form.Item
                name="verificationCode"
                rules={[
                  { required: true, message: 'Please enter verification code' },
                  { len: 6, message: 'Verification code must be 6 digits' }
                ]}
                style={{ display: codeInputVisible ? 'block' : 'none' }}
              >
                <Input
                  placeholder="验证码"
                  style={{ borderRadius: '12px', height: '48px' }}
                  maxLength={6}
                  onChange={async (e) => {
                    const code = e.target.value
                    const email = form.getFieldValue('email')
                    
                    // 当输入6位验证码时自动验证
                    if (code.length === 6 && email) {
                      await handleVerifyCode(email, code)
                    } else {
                      setCodeVerified(false)
                    }
                  }}
                  suffix={
                    codeVerified ? (
                      <span style={{ color: '#52c41a', fontSize: '14px' }}>✓</span>
                    ) : null
                  }
                />
              </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: 'Please enter your phone number' },
                { 
                  pattern: /^(\+\d{1,8}[- ]?)?\d{11}$/,
                  message: 'Please enter a valid phone number'
                }
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="电话号码"
                style={{ borderRadius: '12px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码必须至少6个字符' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: '密码必须包含大写字母、小写字母和数字'
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="密码"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                style={{ borderRadius: '12px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="密码"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                style={{ borderRadius: '12px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                { 
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Please accept the terms'))
                }
              ]}
            >
              <Checkbox>
                我同意{' '}
                <Link onClick={() => message.info('服务条款')}>
                  服务条款
                </Link>
                {' '}和{' '}
                <Link onClick={() => message.info('隐私政策')}>
                  隐私政策
                </Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          {/* Social Registration */}
          <div className="mt-6">
            <Divider>
              <Text type="secondary">或使用以下方式注册</Text>
            </Divider>
            
            <Row gutter={12}>
              <Col span={8}>
                <Button
                  block
                  icon={<GoogleOutlined />}
                  onClick={() => handleSocialRegister('Google')}
                  style={{
                    height: '44px',
                    borderRadius: '12px',
                    borderColor: '#db4437',
                    color: '#db4437'
                  }}
                />
              </Col>
              <Col span={8}>
                <Button
                  block
                  icon={<FacebookOutlined />}
                  onClick={() => handleSocialRegister('Facebook')}
                  style={{
                    height: '44px',
                    borderRadius: '12px',
                    borderColor: '#4267B2',
                    color: '#4267B2'
                  }}
                />
              </Col>
              <Col span={8}>
                <Button
                  block
                  icon={<TwitterOutlined />}
                  onClick={() => handleSocialRegister('Twitter')}
                  style={{
                    height: '44px',
                    borderRadius: '12px',
                    borderColor: '#1DA1F2',
                    color: '#1DA1F2'
                  }}
                />
              </Col>
            </Row>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <Text type="secondary">
              已经有账户了？{' '}
              <Link 
                onClick={() => onNavigate('/login')}
                style={{ fontWeight: '600' }}
              >
                登录
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage
