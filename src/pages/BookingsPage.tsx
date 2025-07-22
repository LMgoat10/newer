import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  Button,
  Typography,
  Space,
  List,
  Avatar,
  Tag,
  Row,
  Col,
  Select,
  DatePicker,
  Empty,
  Modal,
  message,
  Badge,
  Descriptions
} from 'antd'
import {
  ArrowLeftOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { orderService } from '../services/orderService'
import { 
  OrderStatus, 
  OrderStatusText, 
  PayMethod, 
  PayMethodText, 
  type TicketOrder
} from '../types/order'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { confirm } = Modal

const BookingsPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [allOrders, setAllOrders] = useState<TicketOrder[]>([]) // 所有订单数据
  const [filteredOrders, setFilteredOrders] = useState<TicketOrder[]>([]) // 筛选后的订单
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  
  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      // 只在初始加载时获取所有订单，不传筛选参数
      const response = await orderService.getUserOrders()
      if (response && response.content) {
        setAllOrders(response.content)
        // 初始时显示所有订单
        setFilteredOrders(response.content)
      } else {
        message.error('加载订单失败')
      }
    } catch (error) {
      console.error('加载订单失败:', error)
      message.error('加载订单失败')
    } finally {
      setLoading(false)
    }
  }, []) // 移除依赖，只在组件挂载时加载一次

  // 前端筛选逻辑
  const filterOrders = useCallback(() => {
    let filtered = [...allOrders]
    
    // 按状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus)
    }
    
    // 按日期范围筛选
    if (dateRange) {
      const startDate = dateRange[0].format('YYYY-MM-DD')
      const endDate = dateRange[1].format('YYYY-MM-DD')
      filtered = filtered.filter(order => {
        const orderDate = dayjs(order.createdAt).format('YYYY-MM-DD')
        return orderDate >= startDate && orderDate <= endDate
      })
    }
    
    console.log('前端筛选结果:', {
      原始订单数: allOrders.length,
      筛选条件: { selectedStatus, dateRange: dateRange ? [dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD')] : null },
      筛选后数量: filtered.length
    })
    
    setFilteredOrders(filtered)
  }, [allOrders, selectedStatus, dateRange])

  // 当筛选条件或订单数据变化时执行筛选
  useEffect(() => {
    filterOrders()
  }, [filterOrders])

  useEffect(() => {
    // 初始加载和状态改变时都要重新加载订单
    loadOrders()
    
    // 检查是否有新创建的订单需要显示成功提示
    if (location.state?.showSuccess) {
      const { payMethod, totalAmount, newOrderNumbers } = location.state
      const orderCount = newOrderNumbers?.length || 1
      
      let successMessage = `成功创建 ${orderCount} 个订单！`
      
      if (payMethod === 'balance') {
        successMessage += ` 余额支付成功，已扣除 ¥${totalAmount?.toFixed(2)}`
      } else if (payMethod === 'wechat') {
        successMessage += ' 微信支付成功'
      } else if (payMethod === 'alipay') {
        successMessage += ' 支付宝支付成功'
      }
      
      message.success(successMessage)
      // 清除状态避免重复显示
      window.history.replaceState({}, document.title)
    }
    
    // 检查是否是支付宝支付的待支付状态
    if (location.state?.isPending) {
      const { payMethod, totalAmount, newOrderNumbers } = location.state
      const orderCount = newOrderNumbers?.length || 1
      
      if (payMethod === PayMethod.ALIPAY) {
        message.info(`已创建 ${orderCount} 个订单，支付金额 ¥${totalAmount?.toFixed(2)}。请在支付宝页面完成支付。`)
      }
      
      // 清除状态避免重复显示
      window.history.replaceState({}, document.title)
    }
  }, [loadOrders, location.state])

  const handleViewDetail = (order: TicketOrder) => {
    navigate(`/order/${order.orderNumber || order.orderId}`)
  }

  const handleRefund = (order: TicketOrder) => {
    confirm({
      title: '申请退款',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>确定要申请退款吗？</p>
          <p style={{ color: '#999', fontSize: '12px' }}>
            退款申请提交后，我们会在3-5个工作日内处理
          </p>
        </div>
      ),
      onOk: async () => {
        try {
          const response = await orderService.requestRefund({
            orderId: order.orderId,
            refundReason: '用户申请退款'
          })
          if (response) {
            message.success('退款申请已提交')
            loadOrders()
          } else {
            message.error('退款申请失败')
          }
        } catch (error) {
          console.error('退款申请失败:', error)
          message.error('退款申请失败')
        }
      },
    })
  }

  const handleCancel = (order: TicketOrder) => {
    confirm({
      title: '取消订单',
      icon: <ExclamationCircleOutlined />,
      content: '确定要取消这个订单吗？取消后不能恢复。',
      onOk: async () => {
        try {
          const response = await orderService.cancelOrder(order.orderId)
          if (response) {
            message.success('订单已取消')
            loadOrders()
          } else {
            message.error('取消订单失败')
          }
        } catch (error) {
          console.error('取消订单失败:', error)
          message.error('取消订单失败')
        }
      },
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case OrderStatus.PAID:
        return <CheckCircleOutlined style={{ color: '#1677ff' }} />
      case OrderStatus.TICKETED:
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case OrderStatus.CANCELLED:
        return <StopOutlined style={{ color: '#ff4d4f' }} />
      case OrderStatus.REFUND_REQUEST:
        return <SyncOutlined style={{ color: '#722ed1' }} />
      case OrderStatus.REFUNDED:
        return <CheckCircleOutlined style={{ color: '#13c2c2' }} />
      default:
        return <ClockCircleOutlined />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.PAID: return 'blue'
      case OrderStatus.TICKETED: return 'green'
      case OrderStatus.CANCELLED: return 'red'
      case OrderStatus.REFUND_REQUEST: return 'purple'
      case OrderStatus.REFUNDED: return 'cyan'
      default: return 'default'
    }
  }

  const canRefund = (order: TicketOrder) => {
    return order.status === OrderStatus.PAID && 
           dayjs(order.visitDate).isAfter(dayjs(), 'day')
  }

  const canCancel = (order: TicketOrder) => {
    return order.status === OrderStatus.PAID
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* 头部导航 */}
      <div style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '64px' }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/home')}
            >
              返回首页
            </Button>
            <Title level={3} style={{ margin: '0 0 0 16px' }}>
              我的订单
            </Title>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* 筛选条件 */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Space>
                <Text strong>订单状态:</Text>
                <Select
                  value={selectedStatus}
                  onChange={(value) => {
                    console.log('状态筛选变化:', value) // 调试
                    setSelectedStatus(value)
                  }}
                  style={{ width: '140px' }}
                  placeholder="选择状态"
                  options={[
                    { label: '全部', value: 'all' },
                    { label: OrderStatusText[OrderStatus.PAID], value: OrderStatus.PAID },
                    { label: OrderStatusText[OrderStatus.TICKETED], value: OrderStatus.TICKETED },
                    { label: OrderStatusText[OrderStatus.REFUND_REQUEST], value: OrderStatus.REFUND_REQUEST },
                    { label: OrderStatusText[OrderStatus.CANCELLED], value: OrderStatus.CANCELLED },
                    { label: OrderStatusText[OrderStatus.REFUNDED], value: OrderStatus.REFUNDED },
                  ]}
                />
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space>
                <Text strong>日期范围:</Text>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => {
                    console.log('日期筛选变化:', dates) // 调试
                    setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
                  }}
                  format="YYYY-MM-DD"
                  placeholder={['开始日期', '结束日期']}
                />
              </Space>
            </Col>
            <Col xs={24} sm={4}>
              <Button onClick={() => {
                console.log('重置筛选按钮点击') // 调试
                setSelectedStatus('all')
                setDateRange(null)
              }}>
                重置筛选
              </Button>
            </Col>
          </Row>
          
          {/* 筛选状态提示 */}
          {(selectedStatus !== 'all' || dateRange) && (
            <div style={{ marginTop: '16px', padding: '8px 12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                当前筛选条件: 
                {selectedStatus !== 'all' && <span> 状态「{OrderStatusText[selectedStatus as keyof typeof OrderStatus]}」</span>}
                {dateRange && <span> 日期「{dateRange[0].format('YYYY-MM-DD')} 至 {dateRange[1].format('YYYY-MM-DD')}」</span>}
                ，共找到 {filteredOrders.length} 条订单
              </Text>
            </div>
          )}
        </Card>

        {/* 订单列表 */}
        <Card style={{ borderRadius: '12px' }}>
          {filteredOrders.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ color: '#8c8c8c', marginBottom: '8px' }}>
                    {allOrders.length === 0 ? '暂无订单' : '没有符合条件的订单'}
                  </Title>
                  <Text type="secondary">
                    {allOrders.length === 0 ? '您还没有任何订单，快去选购门票吧' : '请尝试调整筛选条件'}
                  </Text>
                </div>
              }
            >
              {allOrders.length === 0 && (
                <Button 
                  type="primary" 
                  onClick={() => navigate('/destinations')}
                  style={{ borderRadius: '8px' }}
                >
                  去逛逛
                </Button>
              )}
            </Empty>
          ) : (
            <List
              loading={loading}
              dataSource={filteredOrders}
              renderItem={(order) => (
                <List.Item style={{ padding: '24px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100%' }}>
                    <Row gutter={[24, 16]}>
                      {/* 订单信息 */}
                      <Col xs={24} lg={16}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <Avatar
                            size={80}
                            shape="square"
                            src={order.attractionImage}
                            style={{ borderRadius: '8px', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1 }}>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <Title level={5} style={{ margin: 0 }}>
                                  {order.attractionName}
                                </Title>
                                <Tag 
                                  icon={getStatusIcon(order.status)}
                                  color={getStatusColor(order.status)}
                                >
                                  {OrderStatusText[order.status]}
                                </Tag>
                              </div>
                              
                              <Text type="secondary">订单号: {order.orderNumber || order.orderId}</Text>
                              
                              <Row gutter={[16, 8]}>
                                <Col span={12}>
                                  <Space size={4}>
                                    <CalendarOutlined style={{ color: '#1677ff' }} />
                                    <Text style={{ fontSize: '12px' }}>
                                      游玩日期: {order.visitDate}
                                    </Text>
                                  </Space>
                                </Col>
                                <Col span={12}>
                                  <Space size={4}>
                                    <UserOutlined style={{ color: '#52c41a' }} />
                                    <Text style={{ fontSize: '12px' }}>
                                      数量: {order.quantity} 张
                                    </Text>
                                  </Space>
                                </Col>
                              </Row>

                              <Space wrap>
                                {order.payMethod && (
                                  <Badge count={PayMethodText[order.payMethod as keyof typeof PayMethod]} style={{ backgroundColor: '#1677ff' }} />
                                )}
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                  下单时间: {dayjs(order.createdAt).format('YYYY-MM-DD HH:mm')}
                                </Text>
                              </Space>
                            </Space>
                          </div>
                        </div>
                      </Col>

                      {/* 价格和操作 */}
                      <Col xs={24} lg={8}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: '100%', justifyContent: 'space-between' }}>
                          <div style={{ textAlign: 'right' }}>
                            <Text style={{ fontSize: '12px', color: '#666' }}>总价</Text>
                            <div>
                              <Text strong style={{ fontSize: '20px', color: '#ff4d4f' }}>
                                ¥{order.totalAmount}
                              </Text>
                            </div>
                          </div>

                          <Space>
                            <Button 
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => handleViewDetail(order)}
                            >
                              查看详情
                            </Button>
                            
                            {canRefund(order) && (
                              <Button 
                                size="small"
                                type="primary"
                                ghost
                                onClick={() => handleRefund(order)}
                              >
                                申请退款
                              </Button>
                            )}
                            
                            {canCancel(order) && (
                              <Button 
                                size="small"
                                danger
                                onClick={() => handleCancel(order)}
                              >
                                取消订单
                              </Button>
                            )}
                          </Space>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* 订单统计 */}
        {filteredOrders.length > 0 && (
          <Card style={{ marginTop: '24px', borderRadius: '12px' }}>
            <Title level={5} style={{ marginBottom: '16px' }}>订单统计</Title>
            <Row gutter={[24, 16]}>
              <Col xs={12} sm={6}>
                <Descriptions.Item>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1677ff' }}>
                      {filteredOrders.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>显示订单数</div>
                  </div>
                </Descriptions.Item>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {filteredOrders.filter(o => o.status === OrderStatus.PAID || o.status === OrderStatus.TICKETED).length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>已支付</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                    {filteredOrders.filter(o => o.status === OrderStatus.REFUND_REQUEST).length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>退款中</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                    ¥{filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>总金额</div>
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </div>
  )
}

export default BookingsPage
