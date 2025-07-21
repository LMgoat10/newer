import { useState } from 'react'
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
  message,
  Row,
  Col
} from 'antd'
import { 
  ArrowLeftOutlined,
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
  password: string
  confirmPassword: string
  phone: string
  agreement: boolean
}

function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [avatarFileName, setAvatarFileName] = useState<string>('')
  const navigate = useNavigate()

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

      // 准备注册数据
      const registerData = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        avatarFileName: avatarFileName,
      }

      // 调用注册API
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
      {/* Header */}
      <Card 
        className="rounded-none shadow-sm" 
        style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}
      >
        <div className="flex items-center">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => {
              if (onNavigate) {
                onNavigate('/login')
              } else {
                navigate('/login')
              }
            }}
            size="large"
          />
          <Title level={4} style={{ margin: '0 0 0 12px', color: '#1f2937' }}>
            Create Account
          </Title>
        </div>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card 
          className="w-full max-w-md shadow-lg border-0"
          style={{ borderRadius: '24px', padding: '32px' }}
        >
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <Title level={2} style={{ marginBottom: '8px', color: '#1f2937' }}>
              Join TripApp
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Create your account to start your journey
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
                    Upload
                  </Text>
                </div>
              )}
            </Upload>
            <div className="mt-2">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Optional profile picture
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
                placeholder="Full Name"
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
                placeholder="Email Address"
                style={{ borderRadius: '12px', height: '48px' }}
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
                placeholder="Phone Number"
                style={{ borderRadius: '12px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain uppercase, lowercase and number'
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                style={{ borderRadius: '12px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
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
                placeholder="Confirm Password"
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
                I agree to the{' '}
                <Link onClick={() => message.info('Terms of Service')}>
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link onClick={() => message.info('Privacy Policy')}>
                  Privacy Policy
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
                Create Account
              </Button>
            </Form.Item>
          </Form>

          {/* Social Registration */}
          <div className="mt-6">
            <Divider>
              <Text type="secondary">Or continue with</Text>
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
              Already have an account?{' '}
              <Link 
                onClick={() => onNavigate('/login')}
                style={{ fontWeight: '600' }}
              >
                Sign In
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage
