import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Card,
  Button,
  Typography,
  Row,
  Col,
  Tag,
  Space,
  InputNumber,
  Divider,
  Spin,
  Empty,
  Breadcrumb,
  Badge,
  Carousel,
  Descriptions,
  message,
  Affix
} from 'antd'
import { 
  ArrowLeftOutlined,
  HeartOutlined,
  ShareAltOutlined,
  ShoppingCartOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  StarOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons'
import { spotService } from '../services/spotService'
import type { SpotItem, SpotTicket } from '../services/spotService'
import { cartService } from '../services/cartService'

const { Title, Text, Paragraph } = Typography

const SpotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [spot, setSpot] = useState<SpotItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SpotTicket | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const fetchSpot = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        const spotData = await spotService.getSpotById(id)
        if (spotData) {
          setSpot(spotData)
          if (spotData.tickets.length > 0) {
            setSelectedTicket(spotData.tickets[0])
          }
        }
      } catch (error) {
        console.error('获取景点详情失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSpot()
  }, [id])

  const handleAddToCart = async () => {
    if (!spot || !selectedTicket) return

    try {
      const success = await cartService.addToCart(spot, selectedTicket, quantity)
      if (success) {
        setAddedToCart(true)
        message.success('门票已添加到购物车')
        setTimeout(() => setAddedToCart(false), 2000)
      } else {
        message.error('添加失败，请重试')
      }
    } catch (error) {
      console.error('添加到购物车失败:', error)
      message.error('添加失败，请重试')
    }
  }

  const handleBuyNow = async () => {
    if (!spot || !selectedTicket) return

    try {
      const success = await cartService.addToCart(spot, selectedTicket, quantity)
      if (success) {
        navigate('/cart')
      } else {
        message.error('添加失败，请重试')
      }
    } catch (error) {
      console.error('添加到购物车失败:', error)
      message.error('添加失败，请重试')
    }
  }

  const handleQuantityChange = (value: number | null) => {
    if (value && value > 0) {
      setQuantity(value)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: spot?.name,
          text: spot?.summary,
          url: window.location.href
        })
      } catch (error) {
        console.log('分享失败:', error)
      }
    } else {
      // 降级方案：复制链接
      navigator.clipboard.writeText(window.location.href)
      message.success('链接已复制到剪贴板')
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!spot) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Empty
          description="景点未找到"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/destinations')}>
            返回景点列表
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* 头部导航 */}
      <div style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              返回
            </Button>
            
            <Space>
              <Button
                type="text"
                icon={<HeartOutlined />}
                onClick={() => setIsLiked(!isLiked)}
                style={{ color: isLiked ? '#ff4d4f' : '#666' }}
              />
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={handleShare}
              />
            </Space>
          </div>
        </div>
      </div>

      {/* 面包屑导航 */}
      <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <span
                style={{ cursor: 'pointer', color: '#1890ff' }}
                onClick={() => navigate('/home')}
              >
                首页
              </span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span
                style={{ cursor: 'pointer', color: '#1890ff' }}
                onClick={() => navigate('/spots')}
              >
                景点列表
              </span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{spot.name}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      {/* 景点主图 */}
      <div style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
        {spot.picList.length > 1 ? (
          <Carousel autoplay>
            {spot.picList.map((pic, index) => (
              <div key={index}>
                <div style={{
                  height: '400px',
                  background: `url(${pic}) center/cover`,
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4))'
                  }} />
                </div>
              </div>
            ))}
          </Carousel>
        ) : (
          <div style={{
            height: '400px',
            background: spot.picList[0] ? `url(${spot.picList[0]}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4))'
            }} />
          </div>
        )}
        
        {/* 景点基本信息覆盖层 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          color: 'white',
          padding: '40px 24px 24px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={1} style={{ color: 'white', margin: '0 0 16px 0', fontSize: '2.5rem' }}>
              {spot.name}
            </Title>
            <Space size="large" style={{ marginBottom: '16px' }}>
              <Space>
                <EnvironmentOutlined style={{ color: 'rgba(255,255,255,0.9)' }} />
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {spot.cityName}, {spot.proName}
                </Text>
              </Space>
              <Space>
                <StarOutlined style={{ color: '#ffd700' }} />
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {spot.rating}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  ({spot.reviewCount}条评论)
                </Text>
              </Space>
              <Space>
                <EyeOutlined style={{ color: 'rgba(255,255,255,0.9)' }} />
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {Math.floor(Math.random() * 1000) + 500} 人浏览
                </Text>
              </Space>
            </Space>
            <Space wrap>
              {spot.tags.map((tag, index) => (
                <Tag key={index} color="blue" style={{ borderRadius: '12px' }}>
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <Row gutter={[32, 32]}>
          {/* 左侧内容 */}
          <Col xs={24} lg={16}>
            {/* 景点介绍 */}
            <Card style={{ marginBottom: '24px', borderRadius: '16px' }}>
              <Title level={3} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                景点介绍
              </Title>
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', color: '#4a5568' }}>
                {spot.summary}
              </Paragraph>
              
              <Divider />
              
              <Title level={4} style={{ marginBottom: '16px' }}>详细信息</Title>
              <Descriptions column={1} size="middle">
                <Descriptions.Item 
                  label={<Space><EnvironmentOutlined />详细地址</Space>}
                >
                  {spot.address}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<Space><ClockCircleOutlined />开放时间</Space>}
                >
                  {spot.openTime}
                </Descriptions.Item>
                {spot.phone && (
                  <Descriptions.Item 
                    label={<Space><PhoneOutlined />联系电话</Space>}
                  >
                    {spot.phone}
                  </Descriptions.Item>
                )}
                {spot.website && (
                  <Descriptions.Item 
                    label={<Space><GlobalOutlined />官方网站</Space>}
                  >
                    <Button type="link" href={spot.website} target="_blank" style={{ padding: 0 }}>
                      访问官网
                    </Button>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* 门票信息 */}
            <Card style={{ borderRadius: '16px' }}>
              <Title level={3} style={{ marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
                <SafetyCertificateOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                门票信息
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {spot.tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    hoverable
                    style={{
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: selectedTicket?.id === ticket.id ? '2px solid #1890ff' : '1px solid #f0f0f0',
                      background: selectedTicket?.id === ticket.id ? '#f6ffed' : 'white'
                    }}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <Row justify="space-between" align="middle">
                      <Col flex="1">
                        <Space direction="vertical" size="small">
                          <Title level={5} style={{ margin: 0 }}>
                            {ticket.name}
                          </Title>
                          <Text type="secondary" style={{ fontSize: '14px' }}>
                            {ticket.description}
                          </Text>
                          <Space>
                            <Tag icon={<CalendarOutlined />} color="blue">
                              有效期: {ticket.validDays}天
                            </Tag>
                            <Tag icon={<UserOutlined />} color="green">
                              库存: {ticket.stock}张
                            </Tag>
                          </Space>
                        </Space>
                      </Col>
                      <Col>
                        <Space direction="vertical" align="end">
                          <Space align="baseline">
                            <Title level={2} style={{ margin: 0, color: '#ff4d4f' }}>
                              {ticket.price === 0 ? '免费' : `¥${ticket.price}`}
                            </Title>
                            {ticket.originalPrice && ticket.originalPrice > ticket.price && (
                              <Text delete type="secondary">
                                ¥{ticket.originalPrice}
                              </Text>
                            )}
                          </Space>
                          {ticket.originalPrice && ticket.originalPrice > ticket.price && (
                            <Badge 
                              count={`省¥${ticket.originalPrice - ticket.price}`} 
                              style={{ backgroundColor: '#f50' }}
                            />
                          )}
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            </Card>
          </Col>

          {/* 右侧购买区域 */}
          <Col xs={24} lg={8}>
            <Affix offsetTop={80}>
              <Card style={{ borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <Title level={3} style={{ marginBottom: '24px', textAlign: 'center' }}>
                  购买门票
                </Title>
                
                {selectedTicket && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Card 
                      size="small" 
                      style={{ 
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <Title level={5} style={{ margin: '0 0 8px 0' }}>
                        {selectedTicket.name}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '12px' }}>
                        {selectedTicket.description}
                      </Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Title level={2} style={{ margin: 0, color: '#ff4d4f' }}>
                          {selectedTicket.price === 0 ? '免费' : `¥${selectedTicket.price}`}
                        </Title>
                        {selectedTicket.originalPrice && selectedTicket.originalPrice > selectedTicket.price && (
                          <Text delete type="secondary">
                            ¥{selectedTicket.originalPrice}
                          </Text>
                        )}
                      </div>
                    </Card>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>购买数量:</Text>
                      <InputNumber
                        min={1}
                        max={selectedTicket.stock}
                        value={quantity}
                        onChange={handleQuantityChange}
                        style={{ width: '120px' }}
                      />
                    </div>

                    <Divider />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={4} style={{ margin: 0 }}>总计:</Title>
                      <Title level={2} style={{ margin: 0, color: '#ff4d4f' }}>
                        ¥{selectedTicket.price * quantity}
                      </Title>
                    </div>

                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button
                        type="default"
                        size="large"
                        block
                        icon={addedToCart ? <CheckOutlined /> : <ShoppingCartOutlined />}
                        onClick={handleAddToCart}
                        style={{
                          height: '48px',
                          borderRadius: '12px',
                          border: '1px solid #d9d9d9',
                          background: addedToCart ? '#f6ffed' : 'white',
                          color: addedToCart ? '#52c41a' : '#666'
                        }}
                      >
                        {addedToCart ? '已添加到购物车' : '加入购物车'}
                      </Button>
                      
                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={handleBuyNow}
                        style={{
                          height: '48px',
                          borderRadius: '12px',
                          background: '#ff4d4f',
                          borderColor: '#ff4d4f',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                      >
                        立即购买
                      </Button>
                    </Space>

                    <Card size="small" style={{ background: '#f8fafc', borderRadius: '8px' }}>
                      <Space direction="vertical" size="small">
                        <Text style={{ fontSize: '12px', color: '#666' }}>
                          • 下单后请在24小时内完成支付
                        </Text>
                        <Text style={{ fontSize: '12px', color: '#666' }}>
                          • 门票一经售出，不可退换
                        </Text>
                        <Text style={{ fontSize: '12px', color: '#666' }}>
                          • 请凭购票凭证入园
                        </Text>
                      </Space>
                    </Card>
                  </div>
                )}
              </Card>
            </Affix>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default SpotDetail
