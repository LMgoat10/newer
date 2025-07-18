import { 
  Card,
  Button,
  Avatar,
  Space,
  Typography,
  Row,
  Col,
  Rate,
  Tag
} from 'antd'
import { 
  Plane, 
  Train, 
  Hotel, 
  Bus,
  MapPin
} from 'lucide-react'
import { popularDestinations, recentSearches } from '../data/destinations'
import type { Destination } from '../data/destinations'
import SearchForm from '../components/SearchForm'
import type { Dayjs } from 'dayjs'
import { useState, useEffect } from 'react'
import { spotService } from '../services/spotService'
import type { SpotItem } from '../services/spotService'

const { Title, Text } = Typography

interface HomePageProps {
  onNavigate: (route: string, params?: Record<string, unknown>) => void
}

function HomePage({ onNavigate }: HomePageProps) {
  const [hotSpots, setHotSpots] = useState<SpotItem[]>([])
  const [spotsLoading, setSpotsLoading] = useState(true)

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

  // 处理搜索
  const handleSearch = (searchData: {
    from: string;
    to: string;
    departureDate: Dayjs | null;
    returnDate?: Dayjs | null;
    passengers: number;
    tripType: string;
  }) => {
    console.log('Search data:', searchData);
    // 导航到搜索结果页
    onNavigate('/search-results', searchData);
  };

  // 处理景点点击
  const handleSpotClick = (spot: SpotItem) => {
    onNavigate('/spot/' + spot.id)
  }

  // 获取服务类型图标
  const getServiceIcon = (type: string) => {
    const iconProps = { size: 20, style: { color: '#fff' } }
    switch (type) {
      case 'flight': return <Plane {...iconProps} />
      case 'train': return <Train {...iconProps} />
      case 'hotel': return <Hotel {...iconProps} />
      case 'bus': return <Bus {...iconProps} />
      default: return <Plane {...iconProps} />
    }
  }

  // 获取服务类型颜色
  const getServiceColor = (type: string) => {
    switch (type) {
      case 'flight': return '#1890ff'
      case 'train': return '#52c41a'
      case 'hotel': return '#722ed1'
      case 'bus': return '#fa8c16'
      default: return '#1890ff'
    }
  }

  // 处理服务类型点击
  const handleServiceClick = (serviceType: string) => {
    onNavigate('/search', { serviceType });
  }

  // 处理热门目的地点击
  const handleDestinationClick = (destination: Destination) => {
    onNavigate('/destination-detail', { destination });
  }

  return (
    <div>
      {/* Main Content */}
      <div className="px-4 py-6">
        {/* <SearchForm onSearch={handleSearch} /> */}

        {/* Service Categories */}
        {/* <Row gutter={[16, 16]} className="mb-6">
          <Col span={6}>
            <Card 
              hoverable
              style={{ borderRadius: '16px', textAlign: 'center' }}
              bodyStyle={{ padding: '16px' }}
              onClick={() => handleServiceClick('flight')}
            >
              <Avatar 
                size={48}
                style={{ backgroundColor: '#e6f7ff', marginBottom: 8 }}
                icon={<Plane size={24} style={{ color: '#1890ff' }} />}
              />
              <div>
                <Text strong className="text-sm">Flights</Text>
              </div>
            </Card>
          </Col>
          
          <Col span={6}>
            <Card 
              hoverable
              style={{ borderRadius: '16px', textAlign: 'center' }}
              bodyStyle={{ padding: '16px' }}
              onClick={() => handleServiceClick('train')}
            >
              <Avatar 
                size={48}
                style={{ backgroundColor: '#f6ffed', marginBottom: 8 }}
                icon={<Train size={24} style={{ color: '#52c41a' }} />}
              />
              <div>
                <Text strong className="text-sm">Trains</Text>
              </div>
            </Card>
          </Col>
          
          <Col span={6}>
            <Card 
              hoverable
              style={{ borderRadius: '16px', textAlign: 'center' }}
              bodyStyle={{ padding: '16px' }}
              onClick={() => handleServiceClick('hotel')}
            >
              <Avatar 
                size={48}
                style={{ backgroundColor: '#f9f0ff', marginBottom: 8 }}
                icon={<Hotel size={24} style={{ color: '#722ed1' }} />}
              />
              <div>
                <Text strong className="text-sm">Hotels</Text>
              </div>
            </Card>
          </Col>
          
          <Col span={6}>
            <Card 
              hoverable
              style={{ borderRadius: '16px', textAlign: 'center' }}
              bodyStyle={{ padding: '16px' }}
              onClick={() => handleServiceClick('bus')}
            >
              <Avatar 
                size={48}
                style={{ backgroundColor: '#fff7e6', marginBottom: 8 }}
                icon={<Bus size={24} style={{ color: '#fa8c16' }} />}
              />
              <div>
                <Text strong className="text-sm">Buses</Text>
              </div>
            </Card>
          </Col>
        </Row> */}

        {/* Recent Searches */}
        {/* <Card className="mt-6" style={{ marginTop: '16px', borderRadius: '16px' }}>
          <Title level={5} style={{ marginBottom: 16 }}>Recent Searches</Title>
          <Space direction="vertical" size="middle" className="w-full">
            {recentSearches.slice(0, 2).map((search) => (
              <Card 
                key={search.id}
                size="small" 
                hoverable
                style={{ backgroundColor: '#f8fafc', border: 'none', borderRadius: '12px' }}
                onClick={() => onNavigate('/search-results', search as unknown as Record<string, unknown>)}
              >
                <div className="flex items-center justify-between">
                  <Space>
                    <Avatar 
                      size={40}
                      style={{ backgroundColor: getServiceColor(search.type) }}
                      icon={getServiceIcon(search.type)}
                    />
                    <div>
                      <Text strong>{search.from} → {search.to}</Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        {search.date} • {search.passengers}
                        {search.duration && ` • ${search.duration}`}
                      </Text>
                    </div>
                  </Space>
                  <div className="text-right">
                    <Text strong style={{ fontSize: '16px' }}>{search.price}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">{search.tripType.replace('-', ' ')}</Text>
                  </div>
                </div>
              </Card>
            ))}
          </Space>
        </Card> */}

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

        {/* Popular Destinations */}
        <Card style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between mb-4">
            <Title level={5} style={{ margin: 0 }}>Popular Destinations</Title>
            <Button 
              type="text" 
              size="small" 
              style={{ color: '#1890ff' }}
              onClick={() => onNavigate('/destinations')}
            >
              See All
            </Button>
          </div>
          <Row gutter={[12, 12]}>
            {popularDestinations.slice(0, 4).map((dest) => (
              <Col span={12} key={dest.id}>
                <Card 
                  hoverable
                  style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: dest.gradient,
                    border: 'none',
                    height: '120px',
                    backgroundImage: `url(${dest.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                  bodyStyle={{ padding: '12px', height: '100%' }}
                  onClick={() => handleDestinationClick(dest)}
                >
                  <div 
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)',
                      zIndex: 1
                    }}
                  />
                  <div 
                    style={{ 
                      position: 'relative',
                      zIndex: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <Space>
                        <Rate disabled value={dest.rating} style={{ fontSize: '12px' }} />
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>
                          ({dest.reviewCount})
                        </Text>
                      </Space>
                      {dest.discount && (
                        <Tag color="red" style={{ fontSize: '10px', padding: '0 4px' }}>
                          {dest.discount}
                        </Tag>
                      )}
                    </div>
                    <div>
                      <Text strong style={{ color: 'white', fontSize: '16px', display: 'block' }}>
                        {dest.name}
                      </Text>
                      <div className="flex items-center justify-between">
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                          {dest.price}
                        </Text>
                        {dest.originalPrice && (
                          <Text 
                            delete 
                            style={{ 
                              color: 'rgba(255,255,255,0.6)', 
                              fontSize: '12px',
                              marginLeft: 8 
                            }}
                          >
                            {dest.originalPrice}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </div>
  )
}

export default HomePage
