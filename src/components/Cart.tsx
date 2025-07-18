import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Card,
  Button,
  Typography,
  Row,
  Col,
  Checkbox,
  InputNumber,
  Space,
  Divider,
  Empty,
  Badge,
  Tag,
  message,
  Modal,
  List,
  Avatar,
  Breadcrumb,
  Descriptions,
  Statistic,
  Alert
} from 'antd'
import { 
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  ExclamationCircleOutlined,
  GiftOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import { cartService } from '../services/cartService'
import type { CartItem, CartSummary } from '../services/cartService'

const { Title, Text } = Typography
const { confirm } = Modal

const Cart: React.FC = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    totalItems: 0,
    totalPrice: 0,
    totalSavings: 0
  })
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadCartData()
  }, [])

  const loadCartData = () => {
    const items = cartService.getCartItems()
    const summary = cartService.getCartSummary()
    setCartItems(items)
    setCartSummary(summary)
    
    // 默认选中所有商品
    setSelectedItems(new Set(items.map(item => item.id)))
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const success = cartService.updateCartItem(itemId, newQuantity)
    if (success) {
      loadCartData()
    }
  }

  const handleRemoveItem = (itemId: string) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个商品吗？',
      onOk() {
        const success = cartService.removeFromCart(itemId)
        if (success) {
          message.success('商品已删除')
          loadCartData()
          // 从选中列表中移除
          const newSelected = new Set(selectedItems)
          newSelected.delete(itemId)
          setSelectedItems(newSelected)
        }
      },
    })
  }

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)))
    }
  }

  const handleClearCart = () => {
    confirm({
      title: '清空购物车',
      icon: <ExclamationCircleOutlined />,
      content: '确定要清空购物车吗？此操作不可撤销。',
      onOk() {
        const success = cartService.clearCart()
        if (success) {
          message.success('购物车已清空')
          loadCartData()
          setSelectedItems(new Set())
        }
      },
    })
  }

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      message.warning('请选择要购买的商品')
      return
    }

    setIsLoading(true)
    // 模拟结算过程
    setTimeout(() => {
      setIsLoading(false)
      message.success('订单提交成功！感谢您的购买')
      
      // 移除已购买的商品
      const selectedItemIds = Array.from(selectedItems)
      cartService.removeBatch(selectedItemIds)
      loadCartData()
      setSelectedItems(new Set())
    }, 2000)
  }

  const getSelectedSummary = () => {
    const selectedItemsList = cartItems.filter(item => selectedItems.has(item.id))
    const totalItems = selectedItemsList.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = selectedItemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalSavings = selectedItemsList.reduce((sum, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return sum + ((item.originalPrice - item.price) * item.quantity)
      }
      return sum
    }, 0)

    return { totalItems, totalPrice, totalSavings }
  }

  const selectedSummary = getSelectedSummary()

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* 头部导航 */}
        <div style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '64px' }}>
              <Title level={3} style={{ margin: 0 }}>购物车</Title>
              <div style={{ width: '80px' }} />
            </div>
          </div>
        </div>

        {/* 面包屑导航 */}
        <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Breadcrumb>
              <Breadcrumb.Item>
                <span 
                  onClick={() => navigate('/home')} 
                  style={{ cursor: 'pointer', color: '#1677ff' }}
                >
                  首页
                </span>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span 
                  onClick={() => navigate('/spots')} 
                  style={{ cursor: 'pointer', color: '#1677ff' }}
                >
                  景点列表
                </span>
              </Breadcrumb.Item>
              <Breadcrumb.Item>购物车</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>

        {/* 空购物车内容 */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{ height: '120px' }}
            description={
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ color: '#8c8c8c', marginBottom: '8px' }}>
                  购物车是空的
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  赶快去选择您喜欢的景点门票吧
                </Text>
              </div>
            }
          >
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/destinations')}
              style={{ 
                height: '48px', 
                padding: '0 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              去逛逛
            </Button>
          </Empty>
        </div>
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
            >
              返回
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              购物车 ({cartSummary.totalItems})
            </Title>
            <Button
              type="text"
              danger
              onClick={handleClearCart}
              style={{ fontSize: '14px' }}
            >
              清空购物车
            </Button>
          </div>
        </div>
      </div>

        {/* 面包屑导航 */}
        <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Breadcrumb>
              <Breadcrumb.Item>
                <span 
                  onClick={() => navigate('/home')} 
                  style={{ cursor: 'pointer', color: '#1677ff' }}
                >
                  首页
                </span>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span 
                  onClick={() => navigate('/destinations')} 
                  style={{ cursor: 'pointer', color: '#1677ff' }}
                >
                  景点列表
                </span>
              </Breadcrumb.Item>
              <Breadcrumb.Item>购物车</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <Row gutter={[32, 32]}>
          {/* 左侧商品列表 */}
          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: '16px' }}>
              {/* 全选工具栏 */}
              <div style={{ 
                borderBottom: '1px solid #f0f0f0', 
                padding: '16px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Space>
                  <Checkbox
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onChange={handleSelectAll}
                  />
                  <Text strong>
                    全选 ({selectedItems.size}/{cartItems.length})
                  </Text>
                </Space>
                <Text type="secondary">
                  共 {cartItems.length} 个商品
                </Text>
              </div>

              {/* 商品列表 */}
              <List
                dataSource={cartItems}
                renderItem={(item) => (
                  <List.Item
                    style={{ padding: '24px 0', borderBottom: '1px solid #f0f0f0' }}
                    extra={
                      <Space direction="vertical" align="end" style={{ minWidth: '120px' }}>
                        {/* 价格 */}
                        <Space align="baseline">
                          <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                            ¥{item.price}
                          </Text>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <Text delete type="secondary" style={{ fontSize: '12px' }}>
                              ¥{item.originalPrice}
                            </Text>
                          )}
                        </Space>

                        {/* 数量控制 */}
                        <Space>
                          <Button
                            type="text"
                            size="small"
                            icon={<MinusOutlined />}
                            disabled={item.quantity <= 1}
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            style={{ 
                              border: '1px solid #d9d9d9',
                              borderRadius: '4px',
                              width: '28px',
                              height: '28px'
                            }}
                          />
                          <InputNumber
                            min={1}
                            max={99}
                            value={item.quantity}
                            onChange={(value) => handleQuantityChange(item.id, value || 1)}
                            style={{ width: '60px' }}
                            size="small"
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            style={{ 
                              border: '1px solid #d9d9d9',
                              borderRadius: '4px',
                              width: '28px',
                              height: '28px'
                            }}
                          />
                        </Space>

                        {/* 删除按钮 */}
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          删除
                        </Button>
                      </Space>
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <Space>
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                          />
                          <Avatar
                            size={80}
                            shape="square"
                            src={item.spotImage}
                            style={{ borderRadius: '8px' }}
                          />
                        </Space>
                      }
                      title={
                        <Space direction="vertical" size={4}>
                          <Title level={5} style={{ margin: 0 }}>
                            {item.spotName}
                          </Title>
                          <Text type="secondary">{item.ticketName}</Text>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={8}>
                          <Space wrap>
                            <Tag icon={<ClockCircleOutlined />} color="blue">
                              有效期: {item.validDays}天
                            </Tag>
                            <Tag icon={<EnvironmentOutlined />} color="green">
                              {item.addedAt.toLocaleDateString()}
                            </Tag>
                          </Space>
                          
                          {item.originalPrice && item.originalPrice > item.price && (
                            <Badge 
                              count={`省¥${(item.originalPrice - item.price) * item.quantity}`}
                              style={{ backgroundColor: '#f50' }}
                            >
                              <Tag icon={<GiftOutlined />} color="orange">
                                优惠商品
                              </Tag>
                            </Badge>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* 右侧结算区域 */}
          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: '16px', position: 'sticky', top: '120px' }}>
              <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>
                订单详情
              </Title>
              
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="已选商品">
                    <Text strong>{selectedSummary.totalItems} 件</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="商品总价">
                    <Text strong>¥{selectedSummary.totalPrice}</Text>
                  </Descriptions.Item>
                  {selectedSummary.totalSavings > 0 && (
                    <Descriptions.Item label="优惠金额">
                      <Text style={{ color: '#ff4d4f' }}>-¥{selectedSummary.totalSavings}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
                
                <Divider />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: '16px' }}>应付总额:</Text>
                  <Statistic 
                    value={selectedSummary.totalPrice} 
                    precision={2} 
                    prefix="¥" 
                    valueStyle={{ color: '#ff4d4f', fontSize: '24px', fontWeight: 'bold' }}
                  />
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={isLoading}
                  disabled={selectedItems.size === 0}
                  onClick={handleCheckout}
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {isLoading ? '处理中...' : `结算 (${selectedSummary.totalItems})`}
                </Button>

                {selectedItems.size === 0 && (
                  <Alert
                    message="请选择要购买的商品"
                    type="warning"
                    showIcon
                    style={{ borderRadius: '8px' }}
                  />
                )}

                <Card size="small" style={{ background: '#f8fafc', borderRadius: '8px' }}>
                  <Space direction="vertical" size="small">
                    <Text strong style={{ fontSize: '14px' }}>
                      <SafetyCertificateOutlined style={{ marginRight: '8px' }} />
                      购票须知
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#666' }}>
                      • 请在有效期内使用门票
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#666' }}>
                      • 门票一经售出，不可退换
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#666' }}>
                      • 请凭购票凭证入园
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#666' }}>
                      • 如有疑问，请联系客服
                    </Text>
                  </Space>
                </Card>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Cart
