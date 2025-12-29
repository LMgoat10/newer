import { 
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Rate,
  Tag
} from 'antd'
import { 
  MapPin,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { spotService } from '../services/spotService'
// import { AuthService } from '../services/authService'
// import { useAuth } from '../hooks/useAuth'
import type { SpotItem } from '../services/spotService'

const { Title, Text } = Typography

interface HomePageProps {
  onNavigate: (route: string, params?: Record<string, unknown>) => void
}

function HomePage({ onNavigate }: HomePageProps) {
  const [hotSpots, setHotSpots] = useState<SpotItem[]>([])
  const [spotsLoading, setSpotsLoading] = useState(true)
  // const [userBalance, setUserBalance] = useState<number>(0)
  // const [userStats, setUserStats] = useState({
  //   totalOrders: 0,
  //   pendingOrders: 0,
  //   cartItems: 0
  // })
  // const { user } = useAuth()

  // 加载热门景点
  useEffect(() => {
    const loadHotSpots = async () => {
      try {
        const spots = await spotService.getPopularSpots(4)
        setHotSpots(spots)
      } catch (error) {
        console.error('加载热门景点失败:', error)
      } finally {
        setSpotsLoading(false)
      }
    }
    
    loadHotSpots()
  }, [])

  // 加载用户相关信息
  // useEffect(() => {
  //   if (user) {
  //     const loadUserInfo = async () => {
  //       try {
  //         // 加载用户余额
  //         const balance = await AuthService.getUserBalance()
  //         setUserBalance(balance)
          
  //         // 这里可以添加加载用户统计信息的逻辑
  //         // 比如订单数量、购物车数量等
  //         setUserStats({
  //           totalOrders: 12, // 模拟数据
  //           pendingOrders: 2,
  //           cartItems: 3
  //         })
  //       } catch (error) {
  //         console.error('加载用户信息失败:', error)
  //       }
  //     }
      
  //     loadUserInfo()
  //   }
  // }, [user])
 
    const handleSpotClick = (spot: SpotItem) => {
      onNavigate('/spot/' + spot.id)
    }

  return (
    <div>
      {/* Main Content */}
      <div className="px-4 py-6">
        
        {/* User Info Section */}
        {/* {user && (
          <Card 
            style={{ 
              borderRadius: '16px', 
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              padding: '20px'
            }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar 
                    size={64} 
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    icon={<User size={32} />}
                    src={`localhost:8080/api/user/avatar/${user.avatarFileName}`}
                  />
                  <div>
                    <Title level={4} style={{ color: 'white', margin: 0 }}>
                      {user.name || '用户'}
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                      欢迎回来！
                    </Text>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={16}>
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <Wallet size={20} style={{ color: 'rgba(255,255,255,0.9)' }} />
                      </div>
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>余额</span>}
                        value={userBalance}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}
                      />
                    </div>
                  </Col>
                  
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <Calendar size={20} style={{ color: 'rgba(255,255,255,0.9)' }} />
                      </div>
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>总订单</span>}
                        value={userStats.totalOrders}
                        valueStyle={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}
                      />
                    </div>
                  </Col>
                  
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <ShoppingCart size={20} style={{ color: 'rgba(255,255,255,0.9)' }} />
                      </div>
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>购物车</span>}
                        value={userStats.cartItems}
                        valueStyle={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}
                      />
                    </div>
                  </Col>
                  
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <Button 
                        type="primary" 
                        ghost
                        size="small"
                        onClick={() => onNavigate('/profile')}
                        style={{ 
                          borderColor: 'rgba(255,255,255,0.5)',
                          color: 'white',
                          fontSize: '12px'
                        }}
                      >
                        个人中心
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        )} */}

        {/* Hot Spots Section */}
        <Card 
          title={
            <div className="flex items-center justify-between">
              <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
                🔥 热门景点
              </Title>
              <Button 
                type="link" 
                size="small"
                onClick={() => onNavigate('/destinations')}
              >
                查看全部 →
              </Button>
            </div>
          }
          style={{ 
            borderRadius: '16px', 
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          bodyStyle={{ padding: '16px' }}
        >
          {spotsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <Text type="secondary">加载热门景点中...</Text>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {hotSpots.map((spot) => (
                <Col xs={24} sm={12} md={12} lg={6} key={spot.id}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                        <img
                          alt={spot.name}
                          src={spot.picList[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: 'rgba(0,0,0,0.6)',
                          borderRadius: '12px',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Rate
                            disabled
                            value={1}
                            count={1}
                            style={{ fontSize: '12px', color: '#ffd700' }}
                          />
                          <Text style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                            {spot.rating}
                          </Text>
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(0,0,0,0.6)',
                          borderRadius: '12px',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <MapPin size={12} color="white" />
                          <Text style={{ color: 'white', fontSize: '10px' }}>
                            {spot.cityName}
                          </Text>
                        </div>
                      </div>
                    }
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      padding: '12px'
                    }}
                    onClick={() => handleSpotClick(spot)}
                  >
                    <div style={{ minHeight: '80px' }}>
                      <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '14px' }} ellipsis>
                        {spot.name}
                      </Title>
                      
                      <div style={{ marginBottom: '8px' }}>
                        <Space wrap size={4}>
                          {spot.tags.slice(0, 2).map((tag, index) => (
                            <Tag 
                              key={index} 
                              color="blue" 
                              style={{ 
                                fontSize: '10px', 
                                padding: '0 4px',
                                margin: '0 2px 2px 0',
                                borderRadius: '8px'
                              }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                            {spot.tickets.length > 0 ? (
                              spot.tickets.some(t => t.price === 0) ? (
                                '免费'
                              ) : (
                                `¥${Math.min(...spot.tickets.map(t => t.price))}`
                              )
                            ) : (
                              '¥0'
                            )}
                          </Text>
                          {spot.tickets.length > 0 && !spot.tickets.some(t => t.price === 0) && (
                            <Text type="secondary" style={{ fontSize: '12px', marginLeft: 2 }}>
                              起
                            </Text>
                          )}
                        </div>
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          {spot.reviewCount} 评论
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </div>
    </div>
  )
}

export default HomePage
