import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  Descriptions,
  Avatar,
  message,
  Modal,
  Spin,
  Divider,
  Alert,
  Steps
} from 'antd'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
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
const { confirm } = Modal

const OrderDetail: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<TicketOrder | null>(null)
  const [loading, setLoading] = useState(true)

  const loadOrderDetail = useCallback(async () => {
    if (!orderNumber) return
    
    setLoading(true)
    try {
      const orderData = await orderService.getOrderDetail(orderNumber)
      if (orderData) {
        setOrder(orderData)
      } else {
        message.error('订单不存在或加载失败')
        navigate('/bookings')
      }
    } catch (error) {
      console.error('加载订单详情失败:', error)
      message.error('加载订单详情失败')
    } finally {
      setLoading(false)
    }
  }, [orderNumber, navigate])

  useEffect(() => {
    loadOrderDetail()
  }, [loadOrderDetail])

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

  const getOrderSteps = (order: TicketOrder) => {
    const steps: Array<{
      title: string
      description: string
      status: 'wait' | 'process' | 'finish' | 'error'
      icon: React.ReactNode
    }> = [
      {
        title: '订单创建',
        description: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'),
        status: 'finish',
        icon: <CheckCircleOutlined />
      }
    ]

    if (order.paidAt) {
      steps.push({
        title: '支付完成',
        description: dayjs(order.paidAt).format('YYYY-MM-DD HH:mm'),
        status: 'finish',
        icon: <CheckCircleOutlined />
      })
    }

    switch (order.status) {
      case OrderStatus.PAID:
        steps.push({
          title: '待出票',
          description: '正在处理中',
          status: 'process',
          icon: <ClockCircleOutlined />
        })
        break
      case OrderStatus.TICKETED:
        steps.push({
          title: '已出票',
          description: dayjs(order.updatedAt).format('YYYY-MM-DD HH:mm'),
          status: 'finish',
          icon: <CheckCircleOutlined />
        })
        break
      case OrderStatus.REFUND_REQUEST:
        steps.push({
          title: '申请退款',
          description: '退款申请处理中',
          status: 'process',
          icon: <SyncOutlined />
        })
        break
      case OrderStatus.REFUNDED:
        steps.push({
          title: '已退款',
          description: order.refundTime ? dayjs(order.refundTime).format('YYYY-MM-DD HH:mm') : '退款完成',
          status: 'finish',
          icon: <CheckCircleOutlined />
        })
        break
      case OrderStatus.CANCELLED:
        steps.push({
          title: '订单取消',
          description: dayjs(order.updatedAt).format('YYYY-MM-DD HH:mm'),
          status: 'error',
          icon: <StopOutlined />
        })
        break
    }

    return steps
  }

  const handleRefund = () => {
    if (!order) return
    
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
            loadOrderDetail() // 重新加载订单详情
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

  const handleCancel = () => {
    if (!order) return
    
    confirm({
      title: '取消订单',
      icon: <ExclamationCircleOutlined />,
      content: '确定要取消这个订单吗？取消后不能恢复。',
      onOk: async () => {
        try {
          const response = await orderService.cancelOrder(order.orderId)
          if (response) {
            message.success('订单已取消')
            loadOrderDetail() // 重新加载订单详情
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

  const canRefund = (order: TicketOrder) => {
    return order.status === OrderStatus.PAID && 
           dayjs(order.visitDate).isAfter(dayjs(), 'day')
  }

  const canCancel = (order: TicketOrder) => {
    return order.status === OrderStatus.PAID
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

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>
          <Alert
            message="订单不存在"
            description="无法找到该订单信息"
            type="error"
            showIcon
            action={
              <Button onClick={() => navigate('/bookings')}>
                返回订单列表
              </Button>
            }
          />
        </div>
      </div>
    )
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
              onClick={() => navigate('/bookings')}
            >
              返回订单列表
            </Button>
            <Title level={3} style={{ margin: '0 0 0 16px' }}>
              订单详情
            </Title>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* 订单状态卡片 */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space direction="vertical" size={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Tag 
                    icon={getStatusIcon(order.status)}
                    color={getStatusColor(order.status)}
                    style={{ fontSize: '14px', padding: '4px 12px', borderRadius: '8px' }}
                  >
                    {OrderStatusText[order.status]}
                  </Tag>
                  <Text strong style={{ fontSize: '16px' }}>
                    订单号: {order.orderNumber}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  创建时间: {dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
              </Space>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Space>
                {canRefund(order) && (
                  <Button 
                    type="primary"
                    ghost
                    onClick={handleRefund}
                  >
                    申请退款
                  </Button>
                )}
                {canCancel(order) && (
                  <Button 
                    danger
                    onClick={handleCancel}
                  >
                    取消订单
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 订单进度 */}
        <Card title="订单进度" style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Steps
            direction="horizontal"
            size="small"
            items={getOrderSteps(order)}
            responsive={false}
          />
        </Card>

        <Row gutter={[24, 24]}>
          {/* 景点信息 */}
          <Col xs={24} lg={14}>
            <Card title="景点信息" style={{ borderRadius: '12px', height: '100%' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Avatar
                  size={100}
                  shape="square"
                  src={order.attractionImage}
                  style={{ borderRadius: '8px', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Title level={4} style={{ margin: 0 }}>
                      {order.attractionName}
                    </Title>
                    
                    <Row gutter={[16, 8]}>
                      <Col span={24}>
                        <Space size={8}>
                          <CalendarOutlined style={{ color: '#1677ff' }} />
                          <Text strong>游玩日期:</Text>
                          <Text>{order.visitDate}</Text>
                        </Space>
                      </Col>
                      <Col span={24}>
                        <Space size={8}>
                          <UserOutlined style={{ color: '#52c41a' }} />
                          <Text strong>购买数量:</Text>
                          <Text>{order.quantity} 张</Text>
                        </Space>
                      </Col>
                    </Row>

                    <Divider style={{ margin: '12px 0' }} />
                    
                    <Row>
                      <Col span={12}>
                        <Text type="secondary">单价</Text>
                        <div>
                          <Text strong style={{ fontSize: '16px' }}>
                            ¥{order.unitPrice}
                          </Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">总价</Text>
                        <div>
                          <Text strong style={{ fontSize: '20px', color: '#ff4d4f' }}>
                            ¥{order.totalAmount}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>

          {/* 订单详情 */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              {/* 联系人信息 */}
              <Card title="联系人信息" style={{ borderRadius: '12px' }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item 
                    label={<><UserOutlined style={{ marginRight: '8px' }} />姓名</>}
                  >
                    {order.contactName || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<><PhoneOutlined style={{ marginRight: '8px' }} />手机号</>}
                  >
                    {order.contactPhone || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<><IdcardOutlined style={{ marginRight: '8px' }} />身份证</>}
                  >
                    {order.contactIdcard || '-'}
                  </Descriptions.Item>
                  {order.contactEmail && (
                    <Descriptions.Item label="邮箱">
                      {order.contactEmail}
                    </Descriptions.Item>
                  )}
                  {order.address && (
                    <Descriptions.Item label="地址">
                      {order.address}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* 支付信息 */}
              <Card title="支付信息" style={{ borderRadius: '12px' }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item 
                    label={<><CreditCardOutlined style={{ marginRight: '8px' }} />支付方式</>}
                  >
                    {order.payMethod ? PayMethodText[order.payMethod as keyof typeof PayMethod] : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="支付时间">
                    {order.paidAt ? dayjs(order.paidAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="支付金额">
                    {order.payAmount ? `¥${order.payAmount}` : `¥${order.totalAmount}`}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* 退款信息 */}
              {(order.status === OrderStatus.REFUND_REQUEST || order.status === OrderStatus.REFUNDED) && (
                <Card title="退款信息" style={{ borderRadius: '12px' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="退款原因">
                      {order.refundReason || '用户申请退款'}
                    </Descriptions.Item>
                    <Descriptions.Item label="退款时间">
                      {order.refundTime ? dayjs(order.refundTime).format('YYYY-MM-DD HH:mm:ss') : '处理中'}
                    </Descriptions.Item>
                    <Descriptions.Item label="退款金额">
                      {order.refundAmount ? `¥${order.refundAmount}` : `¥${order.totalAmount}`}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
            </Space>
          </Col>
        </Row>

        {/* 订单操作提示 */}
        {order.status === OrderStatus.PAID && (
          <Card style={{ marginTop: '24px', borderRadius: '12px' }}>
            <Alert
              message="温馨提示"
              description={
                <div>
                  <p>• 门票将在支付后24小时内出票，请耐心等待</p>
                  <p>• 如需退款，请在游玩日期前一天申请</p>
                  <p>• 出票后将通过短信或邮件发送电子票据</p>
                </div>
              }
              type="info"
              showIcon
            />
          </Card>
        )}
      </div>
    </div>
  )
}

export default OrderDetail
