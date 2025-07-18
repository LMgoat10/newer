import {
  Card,
  Button,
  Typography,
  Space,
  Rate,
  Row,
  Col,
  Image,
  Input,
  DatePicker,
  Select,
  Badge,
  Tag,
  Spin,
  message
} from 'antd'
import {
  SearchOutlined,
  EnvironmentOutlined,
  StarOutlined,
  HeartOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { popularDestinations, type Destination } from '../data/destinations'
import { spotService, type SpotItem } from '../services/spotService'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

interface TravelHomepageProps {
  onNavigate: (route: string, params?: Record<string, unknown>) => void
}

function TravelHomepage({ onNavigate }: TravelHomepageProps) {
  const [loading, setLoading] = useState(false)
  const [spots, setSpots] = useState<SpotItem[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')

  // 加载热门景点
  useEffect(() => {
    loadPopularSpots()
  }, [])

  const loadPopularSpots = async () => {
    try {
      setLoading(true)
      // 尝试获取一些热门城市的景点
      const popularKeywords = ['北京', '上海', '杭州', '成都']
      const allSpots: SpotItem[] = []
      
      for (const keyword of popularKeywords) {
        try {
          const citySpots = await spotService.searchSpotsByKeyword(keyword, 1)
          allSpots.push(...citySpots.slice(0, 2)) // 每个城市取2个景点
        } catch (error) {
          console.error(`获取${keyword}景点失败:`, error)
        }
      }
      
      if (allSpots.length > 0) {
        setSpots(allSpots.slice(0, 8)) // 最多显示8个景点
      } else {
        // 如果API调用失败，使用默认数据
        console.log('使用默认景点数据')
      }
    } catch (error) {
      console.error('加载景点失败:', error)
      message.error('加载景点信息失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDestinationClick = (destination: Destination) => {
    onNavigate(`/travel/${destination.id}`, { destination })
  }

  const handleSpotClick = (spot: SpotItem) => {
    // 将API景点数据转换为Destination格式
    const destination = spotService.convertSpotToDestination(spot)
    onNavigate(`/destination/${spot.id}`, { destination })
  }

  const handleSearch = async () => {
    if (searchKeyword.trim()) {
      try {
        setLoading(true)
        const searchResults = await spotService.searchSpotsByKeyword(searchKeyword.trim())
        if (searchResults.length > 0) {
          setSpots(searchResults)
          message.success(`找到 ${searchResults.length} 个相关景点`)
        } else {
          message.info('未找到相关景点，请尝试其他关键词')
        }
      } catch (error) {
        console.error('搜索失败:', error)
        message.error('搜索失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    } else {
      // 如果搜索词为空，重新加载热门景点
      loadPopularSpots()
    }
  }

  const handleBookNow = (destination: Destination) => {
    onNavigate('/booking', { destination })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero Section */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 20px',
          color: 'white',
          borderRadius: '0 0 24px 24px'
        }}
      >
        <Title level={2} style={{ color: 'white', textAlign: 'center', marginBottom: 8 }}>
          Travellian
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', display: 'block', textAlign: 'center', marginBottom: 32 }}>
          Discover Your Next Adventure
        </Text>

        {/* Search Form */}
        <Card style={{ borderRadius: 16, marginTop: 20 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ marginBottom: 8, display: 'block' }}>Destination</Text>
              <Input
                placeholder="搜索景点名称，如：泰山、故宫..."
                prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                style={{ borderRadius: 8 }}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={handleSearch}
              />
            </div>
            
            <Row gutter={16}>
              <Col span={12}>
                <Text strong style={{ marginBottom: 8, display: 'block' }}>Person</Text>
                <Select defaultValue="2" style={{ width: '100%', borderRadius: 8 }}>
                  <Option value="1">1 Person</Option>
                  <Option value="2">2 Persons</Option>
                  <Option value="3">3 Persons</Option>
                  <Option value="4">4+ Persons</Option>
                </Select>
              </Col>
              <Col span={12}>
                <Text strong style={{ marginBottom: 8, display: 'block' }}>Date</Text>
                <RangePicker style={{ width: '100%', borderRadius: 8 }} />
              </Col>
            </Row>

            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              style={{
                width: '100%',
                background: '#FF7757',
                borderColor: '#FF7757',
                borderRadius: 12,
                height: 48
              }}
            >
              Search
            </Button>
          </Space>
        </Card>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* API统计信息 */}
        {spots.length > 0 && (
          <Card style={{ marginBottom: 20, borderRadius: 16, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5} style={{ margin: 0, color: '#334155' }}>
                🎯 API数据统计
              </Title>
              <Row gutter={16}>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FF7757', display: 'block' }}>
                      {spots.length}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>景点总数</Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10b981', display: 'block' }}>
                      {new Set(spots.map(s => s.proName)).size}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>覆盖省份</Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#3b82f6', display: 'block' }}>
                      {new Set(spots.map(s => s.cityName)).size}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>覆盖城市</Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#8b5cf6', display: 'block' }}>
                      {spots.filter(s => s.picList.length > 0).length}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>有图片</Text>
                  </div>
                </Col>
              </Row>
            </Space>
          </Card>
        )}

        {/* Popular Destinations Section */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              {searchKeyword ? `"${searchKeyword}" 搜索结果` : '热门景点'}
            </Title>
            <Button 
              type="link" 
              style={{ color: '#FF7757', padding: 0 }}
              onClick={() => {
                setSearchKeyword('')
                loadPopularSpots()
              }}
            >
              {searchKeyword ? '清除搜索' : 'View All'}
            </Button>
          </div>
          
          <Spin spinning={loading}>
            <Row gutter={[16, 16]}>
              {spots.length > 0 ? (
                spots.slice(0, 4).map((spot) => (
                  <Col span={12} key={spot.id}>
                    <Card
                      hoverable
                      style={{ borderRadius: 16, overflow: 'hidden', border: 'none', height: '100%' }}
                      bodyStyle={{ padding: 0 }}
                      onClick={() => handleSpotClick(spot)}
                    >
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          width: '100%',
                          height: 140,
                          background: spot.picList.length > 0 
                            ? `url(${spot.picList[0]}) center/cover` 
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {spot.picList.length === 0 && spot.name}
                        </div>
                        
                        {/* 景点ID标识 */}
                        <div style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 10
                        }}>
                          ID: {spot.id}
                        </div>
                        
                        {/* 收藏按钮 */}
                        <div style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(255,255,255,0.9)',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <HeartOutlined style={{ color: '#ff4757' }} />
                        </div>
                        
                        {/* 地理坐标信息 */}
                        <div style={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          background: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 9
                        }}>
                          {parseFloat(spot.location.lat).toFixed(2)}, {parseFloat(spot.location.lon).toFixed(2)}
                        </div>
                      </div>
                      
                      <div style={{ padding: 12 }}>
                        {/* 景点名称 */}
                        <Title level={5} style={{ margin: 0, marginBottom: 6 }}>
                          {spot.name}
                        </Title>
                        
                        {/* 行政区域信息 */}
                        <Space style={{ marginBottom: 6, flexWrap: 'wrap' }}>
                          <Tag color="blue" style={{ fontSize: 10, margin: '1px' }}>
                            {spot.proName}
                          </Tag>
                          <Tag color="green" style={{ fontSize: 10, margin: '1px' }}>
                            {spot.cityName}
                          </Tag>
                          <Tag color="orange" style={{ fontSize: 10, margin: '1px' }}>
                            {spot.areaName}
                          </Tag>
                        </Space>
                        
                        {/* 详细地址 */}
                        <Space style={{ marginBottom: 8 }}>
                          <EnvironmentOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {spot.address}
                          </Text>
                        </Space>
                        
                        {/* 价格和评分 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div>
                            <Text style={{ color: '#FF7757', fontWeight: 'bold', fontSize: 14 }}>
                              {spot.priceList.length > 0 ? '查看价格' : 'From ¥99'}
                            </Text>
                          </div>
                          <Space>
                            <StarOutlined style={{ color: '#ffa940', fontSize: 12 }} />
                            <Text style={{ fontSize: 12 }}>4.5</Text>
                          </Space>
                        </div>
                        
                        {/* 景点描述 */}
                        {spot.summary && (
                          <Text 
                            type="secondary" 
                            style={{ 
                              fontSize: 11, 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.3,
                              height: '2.6em'
                            }}
                          >
                            {spot.summary}
                          </Text>
                        )}
                        
                        {/* 附加信息 */}
                        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #f0f0f0' }}>
                          <Space style={{ fontSize: 10, color: '#999' }}>
                            <Text type="secondary" style={{ fontSize: 10 }}>
                              区域ID: {spot.areaId}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 10 }}>
                              城市ID: {spot.cityId}
                            </Text>
                          </Space>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))
              ) : (
                // 如果没有API数据，显示默认数据
                popularDestinations.slice(0, 4).map((destination) => (
                  <Col span={12} key={destination.id}>
                    <Card
                      hoverable
                      style={{ borderRadius: 16, overflow: 'hidden', border: 'none' }}
                      bodyStyle={{ padding: 0 }}
                      onClick={() => handleDestinationClick(destination)}
                    >
                      <div style={{ position: 'relative' }}>
                        <Image
                          src={destination.image}
                          alt={destination.name}
                          style={{ width: '100%', height: 120, objectFit: 'cover' }}
                          preview={false}
                        />
                        <div style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(255,255,255,0.9)',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <HeartOutlined style={{ color: '#ff4757' }} />
                        </div>
                        {destination.discount && (
                          <Badge.Ribbon text={destination.discount} color="#FF7757">
                            <div />
                          </Badge.Ribbon>
                        )}
                      </div>
                      
                      <div style={{ padding: 12 }}>
                        <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                          {destination.name}
                        </Title>
                        <Space style={{ marginBottom: 8 }}>
                          <EnvironmentOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {destination.country}
                          </Text>
                        </Space>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text style={{ color: '#FF7757', fontWeight: 'bold' }}>
                              {destination.price}
                            </Text>
                            {destination.originalPrice && (
                              <Text delete type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
                                {destination.originalPrice}
                              </Text>
                            )}
                          </div>
                          <Space>
                            <StarOutlined style={{ color: '#ffa940', fontSize: 12 }} />
                            <Text style={{ fontSize: 12 }}>{destination.rating}</Text>
                          </Space>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          </Spin>
        </div>

        {/* Featured Tours Section */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            {spots.length > 0 ? '详细景点信息 (API数据)' : '精选旅游线路'}
          </Title>
          
          {spots.length > 0 ? (
            // 显示API景点的详细信息
            <Row gutter={[16, 16]}>
              {spots.map((spot) => (
                <Col span={24} key={`detail-${spot.id}`}>
                  <Card
                    hoverable
                    style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
                    onClick={() => handleSpotClick(spot)}
                  >
                    <Row gutter={16}>
                      <Col span={6}>
                        <div style={{
                          width: '100%',
                          height: 100,
                          background: spot.picList.length > 0 
                            ? `url(${spot.picList[0]}) center/cover` 
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {spot.picList.length === 0 && spot.name}
                        </div>
                      </Col>
                      
                      <Col span={18}>
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          {/* 标题和标签 */}
                          <div style={{ marginBottom: 8 }}>
                            <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                              {spot.name}
                            </Title>
                            <Space wrap>
                              <Tag color="volcano">ID: {spot.id}</Tag>
                              <Tag color="blue">{spot.proName}</Tag>
                              <Tag color="green">{spot.cityName}</Tag>
                              <Tag color="orange">{spot.areaName}</Tag>
                            </Space>
                          </div>
                          
                          {/* 地址信息 */}
                          <Space style={{ marginBottom: 6 }}>
                            <EnvironmentOutlined style={{ color: '#64748b' }} />
                            <Text style={{ fontSize: 13, color: '#334155' }}>
                              {spot.address}
                            </Text>
                          </Space>
                          
                          {/* 坐标信息 */}
                          <Space style={{ marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              📍 坐标: {spot.location.lat}, {spot.location.lon}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              🏛️ 区域ID: {spot.areaId}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              🏙️ 城市ID: {spot.cityId}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              🗾 省份ID: {spot.proId}
                            </Text>
                          </Space>
                          
                          {/* 景点描述 */}
                          {spot.summary && (
                            <Text 
                              style={{ 
                                fontSize: 13, 
                                color: '#475569',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.4,
                                flex: 1
                              }}
                            >
                              {spot.summary}
                            </Text>
                          )}
                          
                          {/* 图片和价格信息 */}
                          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                🖼️ 图片: {spot.picList.length}张
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                💰 价格: {spot.priceList.length}项
                              </Text>
                            </Space>
                            <Button 
                              type="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSpotClick(spot)
                              }}
                              style={{
                                background: '#FF7757',
                                borderColor: '#FF7757',
                                borderRadius: 6
                              }}
                            >
                              查看详情
                            </Button>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            // 显示默认的旅游线路
            <Row gutter={[16, 16]}>
              {popularDestinations.slice(0, 3).map((destination) => (
                <Col span={24} key={`tour-${destination.id}`}>
                  <Card
                    hoverable
                    style={{ borderRadius: 16, border: '1px solid #f0f0f0' }}
                    onClick={() => handleDestinationClick(destination)}
                  >
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Image
                        src={destination.image}
                        alt={destination.name}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                        preview={false}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <Tag color="blue" style={{ marginBottom: 4 }}>Guided Tour</Tag>
                            <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                              {destination.name} City Tour
                            </Title>
                            <Space style={{ marginBottom: 4 }}>
                              <Rate disabled value={destination.rating} style={{ fontSize: 12 }} />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                ({destination.reviewCount} reviews)
                              </Text>
                            </Space>
                            <Space>
                              <CalendarOutlined style={{ fontSize: 12, color: '#bfbfbf' }} />
                              <Text type="secondary" style={{ fontSize: 12 }}>5 Days tour</Text>
                              <UserOutlined style={{ fontSize: 12, color: '#bfbfbf' }} />
                              <Text type="secondary" style={{ fontSize: 12 }}>Max 12 people</Text>
                            </Space>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Text style={{ color: '#FF7757', fontSize: 16, fontWeight: 'bold' }}>
                              {destination.price}
                            </Text>
                            <Button 
                              type="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBookNow(destination)
                              }}
                              style={{
                                background: '#FF7757',
                                borderColor: '#FF7757',
                                borderRadius: 6,
                                marginTop: 4,
                                display: 'block'
                              }}
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* API Debug Panel */}
        {spots.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <Title level={4} style={{ marginBottom: 16 }}>🔍 API原始数据调试</Title>
            <Card style={{ borderRadius: 16, background: '#f8fafc' }}>
              <details>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: 16 }}>
                  点击查看完整API响应数据 (共{spots.length}个景点)
                </summary>
                <div style={{ 
                  background: '#1f2937', 
                  color: '#f9fafb', 
                  padding: 16, 
                  borderRadius: 8, 
                  fontSize: 12,
                  fontFamily: 'Monaco, Consolas, monospace',
                  overflow: 'auto',
                  maxHeight: 400
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify({
                      showapi_res_code: 0,
                      showapi_res_error: "",
                      showapi_res_body: {
                        pagebean: {
                          allNum: spots.length,
                          allPages: 1,
                          currentPage: 1,
                          maxResult: 20,
                          contentlist: spots
                        },
                        ret_code: 0
                      }
                    }, null, 2)}
                  </pre>
                </div>
              </details>
            </Card>
          </div>
        )}

        {/* Special Offers */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>Special Offers</Title>
          <Card
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #FF7757 0%, #FF6B47 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: 'white', margin: 0, marginBottom: 8 }}>
                Book Your Next Trip
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: 16 }}>
                And get exclusive deals for your next adventure
              </Text>
              <Button
                type="default"
                size="large"
                style={{
                  borderRadius: 12,
                  background: 'white',
                  color: '#FF7757',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Explore Deals
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TravelHomepage
