import { 
  Card, 
  Avatar, 
  Button, 
  Typography, 
  Space, 
  List, 
  Switch,
  Divider,
  Badge,
  Row,
  Col,
  Tag,
  Form,
  Modal,
  Input,
  message,
  Spin
} from 'antd'
import { 
  ArrowLeftOutlined,
  UserOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  BellOutlined,
  SecurityScanOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  EditOutlined,
  RightOutlined,
  StarFilled,
  GiftOutlined,
  GlobalOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  ShareAltOutlined,
  LockOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AuthService from '../services/authService'

const { Title, Text } = Typography
const { confirm } = Modal

interface ProfilePageProps {
  onNavigate: (route: string) => void
}

interface UpdateValues {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  idCard?: string;
  address?: string;
}

// Mock 菜单项
const mockMenuItems = [
  {
    key: 'personal-info',
    title: '个人信息',
    icon: <UserOutlined />,
    description: '管理您的个人资料',
    showArrow: true
  },
  {
    key: 'payment',
    title: '支付方式',
    icon: <CreditCardOutlined />,
    description: '已保存 2 张卡片',
    showArrow: true
  },
  {
    key: 'booking-history',
    title: '订票记录',
    icon: <HistoryOutlined />,
    description: '查看历史订票',
    showArrow: true,
    badge: '3'
  },
  {
    key: 'favorite-spots',
    title: '收藏景点',
    icon: <StarFilled />,
    description: '我的心愿清单',
    showArrow: true,
    badge: '5'
  },
  {
    key: 'travel-preferences',
    title: '旅行偏好',
    icon: <GlobalOutlined />,
    description: '设置旅行喜好',
    showArrow: true
  },
  {
    key: 'notifications',
    title: '消息通知',
    icon: <BellOutlined />,
    description: '管理通知设置',
    action: <Switch defaultChecked={ true } size="small" />
  },
  {
    key: 'security',
    title: '安全与隐私',
    icon: <SecurityScanOutlined />,
    description: '密码和隐私设置',
    showArrow: true
  },
  {
    key: 'rewards',
    title: '会员权益',
    icon: <GiftOutlined />,
    description: '专属优惠和积分',
    showArrow: true,
    badge: '2'
  },
  {
    key: 'help',
    title: '帮助与支持',
    icon: <QuestionCircleOutlined />,
    description: '24/7 客户服务',
    showArrow: true
  }
]

// 计算下一等级所需积分
// const getNextLevelProgress = (currentLevel: string, points: number) => {
//   const levels = memberLevels as Record<string, { min: number; max: number; color: string; benefits: string[] }>
//   const current = levels[currentLevel]
//   if (!current) return { percent: 100, nextLevel: 'Max Level', pointsNeeded: 0 }
  
//   const percent = Math.min(((points - current.min) / (current.max - current.min)) * 100, 100)
//   const pointsNeeded = Math.max(current.max - points, 0)
//   const nextLevelKey = Object.keys(levels).find(level => levels[level].min > current.min)
//   const nextLevel = nextLevelKey || 'Max Level'
  
//   return { percent, nextLevel, pointsNeeded }
// }

function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  
  // 使用真实用户数据或 fallback 到 mock 数据
  const userProfile = user!
  
  // 加载用户头像
  useEffect(() => {
    const loadUserAvatar = async () => {
      if (userProfile.avatarFileName) {
        setAvatarLoading(true)
        try {
          const avatarBlobUrl = await AuthService.getUserAvatar(userProfile.avatarFileName)
          setAvatarUrl(avatarBlobUrl)
        } catch (error) {
          console.error('加载头像失败:', error)
          // 如果加载失败，设置为 null
          setAvatarUrl(null)
        } finally {
          setAvatarLoading(false)
        }
      }
    }

    loadUserAvatar()
  }, [userProfile.avatarFileName])

  // 清理 blob URL
  useEffect(() => {
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [avatarUrl])
  
  // const { percent, nextLevel, pointsNeeded } = getNextLevelProgress(
  //   userProfile.memberLevel, 
  //   userProfile.memberPoints || 0
  // )

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'personal-info':      
        setOpen(true)         
        break
      case 'payment':
        onNavigate('/wallet')
        break
      case 'booking-history':
        onNavigate('/bookings')
        break
      case 'favorite-spots':
        // 导航到收藏景点页面
        console.log('Navigate to favorite spots')
        break
      case 'travel-preferences':
        // 导航到旅行偏好设置页面
        console.log('Navigate to travel preferences')
        break
      default:
        console.log(`Navigate to ${key}`)
    }
  }

  const handleLogout = () => {
    confirm({
      title: 'Are you sure you want to logout?',
      icon: <ExclamationCircleOutlined />,
      content: 'You will need to login again to access your account.',
      okText: 'Yes, Logout',
      cancelText: 'Cancel',
      onOk() {
        logout()
        if (onNavigate) {
          onNavigate('/home')
        } else {
          navigate('/home')
        }
      }
    })
  }

  const handleShareProfile = () => {
    console.log('Share profile')
    // 这里可以添加分享逻辑
  }

  const onFinishUpdate = async (values: UpdateValues) => {
    try {
      const response = await AuthService.update(values)
      if (response.status === 0) {
        setOpen(false);
        message.success('Profile updated successfully');
      } else {
        message.error(response.message || 'Failed to update profile');
      }
    } catch(error) {
      console.error('An error occurred while updating profile:', error);
      message.error('An error occurred while updating profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Modal
        open={open}
        title="Edit Profile"
        okText="Save"
        cancelText="Cancel"
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="user_profile_update_form"
            initialValues={userProfile}
            clearOnDestroy
            onFinish={(values) => onFinishUpdate(values)}
          >
            {dom}
          </Form>
        )}
      >
        <span style={{paddingLeft: '12px', fontWeight: 'bold' }}>Name</span>
        <Form.Item
          name="name"
          rules={[
            { required: true, message: 'Please enter your full name' },
            { min: 2, message: 'Name must be at least 2 characters' }
          ]}
        >
          <Input
            defaultValue={userProfile.name}
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Full Name"
            style={{ borderRadius: '12px', height: '48px' }}
          />
        </Form.Item>

        <span style={{paddingLeft: '12px', fontWeight: 'bold' }}>Email</span>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input
            defaultValue={userProfile.email}
            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Email Address"
            style={{ borderRadius: '12px', height: '48px' }}
          />
        </Form.Item>

        <span style={{paddingLeft: '12px', fontWeight: 'bold' }}>Phone</span>
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
            defaultValue={userProfile.phone}
            prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Phone Number"
            style={{ borderRadius: '12px', height: '48px' }}
          />
        </Form.Item>

        <span style={{paddingLeft: '12px', fontWeight: 'bold' }}>身份证号</span>
        <Form.Item
          name="idCard"
          rules={[
            { 
              pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
              message: '请输入有效的身份证号码'
            }
          ]}
        >
          <Input
            prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="身份证号码（用于实名认证）"
            style={{ borderRadius: '12px', height: '48px' }}
          />
        </Form.Item>

        <span style={{paddingLeft: '12px', fontWeight: 'bold' }}>常住地址</span>
        <Form.Item
          name="address"
        >
          <Input
            prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="常住地址"
            style={{ borderRadius: '12px', height: '48px' }}
          />
        </Form.Item>

        <span style={{paddingLeft: '12px', fontWeight: 'bold' }}>Password</span>
        <Form.Item
          name="password"
          rules={[
            { required: false, message: '请输入密码' },
            { min: 6, message: '密码至少需要6位' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="New Password"
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            style={{ borderRadius: '12px', height: '50px' }}
          />
        </Form.Item>

        <span style={{paddingLeft: '12px', fontWeight: 'bold' }}>Confirm Password</span>
        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: false, message: 'Please confirm your password' },
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
            placeholder="Confirm New Password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            style={{ borderRadius: '12px', height: '48px' }}
          />
        </Form.Item>
      </Modal>

      {/* Header */}
      <Card 
        className="rounded-none shadow-sm sticky top-0 z-10" 
        style={{ 
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <div className="flex items-center justify-between">
          <Space>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => onNavigate('/home')}
              size="large"
            />
            <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
              个人中心
            </Title>
          </Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleMenuClick('personal-info')}
          />
        </div>
      </Card>

      {/* User Info Card */}
      <div className="px-4 pt-6 pb-4">
        <Card className="rounded-2xl shadow-sm border-0">
          <div className="text-center">
            <Badge 
              dot 
              status="success" 
              offset={[-8, 8]}
            >
              {avatarLoading ? (
                <div 
                  style={{ 
                    width: 80, 
                    height: 80, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    marginBottom: '16px'
                  }}
                >
                  <Spin />
                </div>
              ) : (
                <Avatar 
                  size={80} 
                  src={avatarUrl || undefined}
                  icon={<UserOutlined />}
                  className="mb-4"
                />
              )}
            </Badge>
            
            <div className="mb-2">
              <Space align="center">
                <Title level={3} style={{ margin: 0 }}>
                  {userProfile.name}
                </Title>
                <Badge 
                  count={<StarFilled style={{ color: '#faad14' }} />} 
                  showZero={false}
                />
              </Space>
            </div>
            
            <Tag 
              color="gold" 
              className="mb-3"
              style={{ 
                backgroundColor:'#d4af37',
                color: '#000',
                fontWeight: 'bold'
              }}
            >
              <TrophyOutlined className="mr-1" />
              {userProfile.memberLevel} Member
            </Tag>
            
            <Text type="secondary" className="block mb-4">
              Member since {new Date(userProfile.joinDate || Date.now()).toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </Text>

            {/* Member Progress */}
            {/* {nextLevel !== 'Max Level' && (
              <div className="mb-4 px-4">
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-sm font-medium">
                    Progress to {nextLevel}
                  </Text>
                  <Text className="text-sm text-blue-600 font-medium">
                    {pointsNeeded.toLocaleString()} points needed
                  </Text>
                </div>
                <Progress 
                  percent={percent} 
                  strokeColor="#1890ff"
                  size="small"
                />
              </div>
            )} */}

            {/* Stats */}
            <Row gutter={16} className="mt-4">
              <Col span={6}>
                <div className="text-center">
                  <div className="text-2xl mb-1">🔖</div>
                  <div className="font-semibold text-lg text-gray-800">
                    {userProfile.totalOrders}
                  </div>
                  <Text type="secondary" className="text-xs">
                    订单
                  </Text>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center">
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="font-semibold text-lg text-gray-800">
                    {userProfile.totalOrders}
                  </div>
                  <Text type="secondary" className="text-xs">
                    景点
                  </Text>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="font-semibold text-lg text-gray-800">
                    {(userProfile.memberPoints / 1000).toFixed(1)}K
                  </div>
                  <Text type="secondary" className="text-xs">
                    积分
                  </Text>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="font-semibold text-lg text-gray-800">
                    {userProfile.balance}
                  </div>
                  <Text type="secondary" className="text-xs">
                    余额
                  </Text>
                </div>
              </Col>
            </Row>

            {/* Quick Actions */}
            <Row gutter={8} className="mt-6">
              <Col span={12}>
                <Button 
                  type="primary" 
                  block 
                  icon={<EditOutlined />}
                  style={{ borderRadius: '12px', height: '40px' }}
                  onClick={() => handleMenuClick('personal-info')}
                >
                  编辑资料
                </Button>
              </Col>
              <Col span={12}>
                <Button 
                  block 
                  icon={<ShareAltOutlined />}
                  style={{ borderRadius: '12px', height: '40px' }}
                  onClick={handleShareProfile}
                >
                  分享
                </Button>
              </Col>
            </Row>
          </div>
        </Card>
      </div>

      {/* Member Benefits Card */}
      {/* <div className="px-4 pb-4">
        <Card className="rounded-2xl shadow-sm border-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CrownOutlined style={{ color: memberLevels["Bronze"].color, fontSize: '20px' }} />
              <Title level={5} style={{ margin: 0 }}>
                {userProfile.memberLevel} Benefits
              </Title>
            </div>
            <Button type="text" size="small" style={{ color: '#1890ff' }}>
              View All
            </Button>
          </div>
          
          <Row gutter={[12, 12]}>
            {memberLevels["Bronze"].benefits.slice(0, 4).map((benefit, index) => (
              <Col span={12} key={index}>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <Text className="text-sm font-medium text-blue-700">
                    {benefit}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </div> */}

      {/* Menu Items */}
      <div className="px-4 pb-6">
        <Card className="rounded-2xl shadow-sm border-0">
          <List
            dataSource={mockMenuItems}
            renderItem={(item, index) => (
              <>
                <List.Item
                  className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 px-0 py-4"
                  onClick={() => handleMenuClick(item.key)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {item.title}
                        </div>
                        <Text type="secondary" className="text-sm">
                          {item.description}
                        </Text>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <Badge 
                          count={item.badge} 
                          size="small"
                          style={{ backgroundColor: '#ff4d4f' }}
                        />
                      )}
                      {item.action || (item.showArrow && (
                        <RightOutlined className="text-gray-400 text-xs" />
                      ))}
                    </div>
                  </div>
                </List.Item>
                {index < mockMenuItems.length - 1 && (
                  <Divider style={{ margin: 0 }} />
                )}
              </>
            )}
          />
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="px-4 pb-4">
        <Card className="rounded-2xl shadow-sm border-0">
          <div className="flex items-center justify-between mb-4">
            <Title level={5} style={{ margin: 0 }}>最近活动</Title>
            <Button type="text" size="small" style={{ color: '#1890ff' }}>
              查看全部
            </Button>
          </div>
          
          <Space direction="vertical" size="middle" className="w-full">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Text style={{ fontSize: '14px' }}>🎫</Text>
                </div>
                <div>
                  <Text strong className="text-sm">购买故宫门票</Text>
                  <br />
                  <Text type="secondary" className="text-xs">2024年1月15日</Text>
                </div>
              </div>
              <Text strong style={{ color: '#52c41a' }}>+150 积分</Text>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Text style={{ fontSize: '14px' }}>�️</Text>
                </div>
                <div>
                  <Text strong className="text-sm">预订黄山门票</Text>
                  <br />
                  <Text type="secondary" className="text-xs">2024年1月10日</Text>
                </div>
              </div>
              <Text strong style={{ color: '#52c41a' }}>+280 积分</Text>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Text style={{ fontSize: '14px' }}>⭐</Text>
                </div>
                <div>
                  <Text strong className="text-sm">发表景点评价</Text>
                  <br />
                  <Text type="secondary" className="text-xs">2024年1月8日</Text>
                </div>
              </div>
              <Text strong style={{ color: '#52c41a' }}>+50 积分</Text>
            </div>
          </Space>
        </Card>
      </div>

      {/* Logout Button */}
      <div className="px-4 pb-8">
        <Button 
          type="text" 
          danger
          icon={<LogoutOutlined />}
          size="large"
          className="w-full h-12 rounded-2xl font-medium"
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </div>
    </div>
  )
}

export default ProfilePage
