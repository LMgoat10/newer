import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  Button,
  Typography,
  Form,
  Input,
  DatePicker,
  Radio,
  Space,
  Divider,
  message,
  Row,
  Col,
  Descriptions,
  List,
  Avatar,
  Tag
} from 'antd'
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  WalletOutlined,
  AlipayOutlined,
  WechatOutlined
} from '@ant-design/icons'
import { orderService } from '../services/orderService'
import { cartService } from '../services/cartService'
import { AuthService } from '../services/authService'
import { paymentStatusService } from '../services/paymentStatusService'
import { PayMethod, PayMethodText, type CreateOrderRequest } from '../types/order'
import type { CartItem } from '../services/cartService'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input

const OrderConfirmPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()
  
  // 从路由state获取选中的购物车商品
  const selectedCartItems = useMemo(() => {
    return (location.state?.selectedItems as CartItem[]) || []
  }, [location.state?.selectedItems])
  
  const [loading, setLoading] = useState(false)
  const [userBalance, setUserBalance] = useState<number>(0)
  const [hasPendingPayment, setHasPendingPayment] = useState(false)
  const cartItems = selectedCartItems
  
  useEffect(() => {
    if (selectedCartItems.length === 0) {
      message.warning('没有选中的商品')
      navigate('/cart')
    }
  }, [selectedCartItems, navigate])

  // 加载用户余额
  useEffect(() => {
    const loadUserBalance = async () => {
      try {
        const balance = await AuthService.getUserBalance()
        console.log('用户余额:', balance)
        setUserBalance(balance)
      } catch (error) {
        console.error('加载用户余额失败:', error)
      }
    }
    
    // 检查是否有待支付的订单
    const pendingData = localStorage.getItem('pendingOrderData')
    setHasPendingPayment(!!pendingData)
    
    loadUserBalance()
  }, [])

  // 计算订单总金额
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  // 计算总数量
  const calculateTotalQuantity = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  // 支付宝支付处理函数
  const handleAlipayPayment = async (values: { [key: string]: unknown }) => {
    try {
      const totalAmount = calculateTotal()
      const orderSubject = `${cartItems[0].spotName}等${cartItems.length}个景点门票`
      const traceNo = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 将订单数据保存到 localStorage，支付成功后创建订单
      const orderDataList = cartItems.map(item => ({
        attractionId: parseInt(item.spotId),
        visitDate: (values.visitDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        quantity: item.quantity,
        unitPrice: item.price,
        totalAmount: item.price * item.quantity,
        contactName: values.contactName as string,
        contactPhone: values.contactPhone as string,
        contactIdcard: values.contactIdcard as string,
        address: values.address as string,
        payMethod: PayMethod.ALIPAY, // 直接使用枚举值
        cartItemIds: [item.id]
      }))
      
      localStorage.setItem('pendingOrderData', JSON.stringify({
        orderDataList,
        cartItems,
        totalAmount,
        traceNo // 保存交易号，用于后续支付状态检查
      }))
      
      // 使用 window.open 打开支付宝支付页面
      const paymentUrl = `${import.meta.env.VITE_API_URL}/alipay/pay?subject=${encodeURIComponent(orderSubject)}&traceNo=${traceNo}&totalAmount=${totalAmount}`
      
      console.log('支付参数:', {
        subject: orderSubject,
        traceNo: traceNo,
        totalAmount: totalAmount
      })
      
      // 在新窗口中打开支付页面
      window.open(paymentUrl, '_blank')
      
      // 更新状态
      setHasPendingPayment(true)
      
      // 提示用户
      message.success('支付页面已打开，请在新窗口中完成支付后，点击"刷新订单状态"按钮')
      
    } catch (error) {
      console.error('打开支付页面失败:', error)
      message.error('打开支付页面失败，请重试')
    }
  }

  // 检查支付状态并创建订单
  const checkPaymentAndCreateOrder = async () => {
    const pendingData = localStorage.getItem('pendingOrderData')
    if (!pendingData) {
      message.warning('没有待处理的支付订单')
      return
    }

    try {
      setLoading(true)
      const { orderDataList, cartItems: savedCartItems, totalAmount, traceNo } = JSON.parse(pendingData)
      
      // 调用后端API检查支付状态
      console.log('正在检查支付状态，交易号:', traceNo)
      const paymentResult = await paymentStatusService.pollPaymentStatus(traceNo, 3, 2000)
      
      if (paymentResult.success && paymentResult.paid) {
        // 支付成功，创建订单
        const orders = await Promise.all(
          orderDataList.map(async (orderData: CreateOrderRequest) => {
            return await orderService.createOrder(orderData)
          })
        )
        
        console.log('Orders created after payment:', orders)
        
        // 检查是否所有订单都创建成功
        const failedOrders = orders.filter(order => order.status !== 0)
        
        if (failedOrders.length === 0) {
          // 清理购物车
          const cartItemIds = savedCartItems.map((item: CartItem) => item.id)
          await cartService.removeBatch(cartItemIds)
          
          // 清理 localStorage
          localStorage.removeItem('pendingOrderData')
          
          // 跳转到订单页面
          navigate('/bookings', { 
            state: { 
              newOrderIds: orders.map(order => order.orderId),
              newOrderNumbers: orders.map(order => order.orderNumber),
              showSuccess: true,
              payMethod: PayMethod.ALIPAY,
              totalAmount: totalAmount
            } 
          })
        } else {
          message.error('部分订单创建失败，请联系客服')
        }
      } else {
        message.error(paymentResult.message || '支付未完成或支付失败，请重新支付')
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      message.error('创建订单失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 提交订单
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmitOrder = async (values: Record<string, any>) => {
    setLoading(true)
    try {
      const totalAmount = calculateTotal()
      
      // 如果是支付宝支付，先跳转支付，不创建订单
      if (values.payMethod === PayMethod.ALIPAY) {
        await handleAlipayPayment(values)
        setLoading(false)
        return
      }
      
      // 如果选择余额支付，先检查余额是否足够
      if (values.payMethod === PayMethod.BALANCE) {
        if (userBalance < totalAmount) {
          message.error(`余额不足！当前余额: ¥${userBalance.toFixed(2)}，需要支付: ¥${totalAmount.toFixed(2)}`)
          setLoading(false)
          return
        }
      }

      // 为每个购物车商品创建订单
      const orders = await Promise.all(
        cartItems.map(async (item) => {
          const orderData: CreateOrderRequest = {
            attractionId: parseInt(item.spotId),
            visitDate: values.visitDate.format('YYYY-MM-DD'),
            quantity: item.quantity,
            unitPrice: item.price,
            totalAmount: item.price * item.quantity,
            contactName: values.contactName,
            contactPhone: values.contactPhone,
            contactIdcard: values.contactIdcard,
            address: values.address,
            payMethod: values.payMethod,
            cartItemIds: [item.id]
          }
          
          return await orderService.createOrder(orderData)
        })
      )
      console.log('Orders created:', orders)
      
      // 检查是否所有订单都创建成功
      const failedOrders = orders.filter(order => order.status !== 0)
      orders.map(order => {
        console.log(`Order ID: ${order.orderId}, Order Number: ${order.orderNumber}, Status: ${order.status}, Message: ${order.message}`)
      })
      
      if (failedOrders.length === 0) {
        // 根据支付方式处理支付
        if (values.payMethod === PayMethod.BALANCE) {
          // 余额支付
          const deductSuccess = await AuthService.deductBalance(
            totalAmount,
            orders.map(o => o.orderId).join(','),
            `批量订单支付 - ${orders.length}个订单`
          )
          
          if (deductSuccess) {
            // 重新加载用户余额
            const newBalance = await AuthService.getUserBalance()
            setUserBalance(newBalance)
            
            // 清理购物车
            const cartItemIds = cartItems.map(item => item.id)
            await cartService.removeBatch(cartItemIds)
            
            // 跳转到订单页面
            navigate('/bookings', { 
              state: { 
                newOrderIds: orders.map(order => order.orderId),
                newOrderNumbers: orders.map(order => order.orderNumber),
                showSuccess: true,
                payMethod: values.payMethod,
                totalAmount: totalAmount
              } 
            })
          } else {
            message.error('余额扣除失败，请联系客服')
            return
          }
        } else if (values.payMethod === PayMethod.WECHAT) {
          // 微信支付（暂未实现）
          message.info('微信支付功能正在开发中，请选择其他支付方式')
        }
      } else {
        message.error(`部分订单创建失败，请重试`)
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      message.error('创建订单失败，请重试')
    } finally {
      setLoading(false)
    }
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
              onClick={() => navigate('/cart')}
            >
              返回购物车
            </Button>
            <Title level={3} style={{ margin: '0 0 0 16px' }}>
              确认订单
            </Title>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <Row gutter={[24, 24]}>
          {/* 左侧订单信息 */}
          <Col xs={24} lg={16}>
            <Card title="订单信息" style={{ marginBottom: '24px' }}>
              <List
                dataSource={cartItems}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={80}
                          shape="square"
                          src={item.spotImage}
                          style={{ borderRadius: '8px' }}
                        />
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
                        <Space wrap>
                          <Tag color="blue">
                            数量: {item.quantity}
                          </Tag>
                          <Tag color="green">
                            单价: ¥{item.price}
                          </Tag>
                          <Tag color="orange">
                            小计: ¥{(item.price * item.quantity).toFixed(2)}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            <Card title="联系信息">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmitOrder}
                initialValues={{
                  visitDate: dayjs().add(1, 'day'), // 默认明天
                  payMethod: PayMethod.BALANCE
                }}
              >
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="contactName"
                      label="联系人姓名"
                      rules={[{ required: true, message: '请输入联系人姓名' }]}
                    >
                      <Input 
                        prefix={<UserOutlined />}
                        placeholder="请输入联系人姓名"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="contactPhone"
                      label="联系电话"
                      rules={[
                        { required: true, message: '请输入联系电话' },
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                      ]}
                    >
                      <Input 
                        prefix={<PhoneOutlined />}
                        placeholder="请输入联系电话"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="contactIdcard"
                  label="身份证号（可选）"
                >
                  <Input 
                    prefix={<IdcardOutlined />}
                    placeholder="请输入身份证号码"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="address"
                  label="收货地址（可选）"
                >
                  <TextArea 
                    placeholder="请输入收货地址"
                    rows={3}
                  />
                </Form.Item>

                <Form.Item
                  name="visitDate"
                  label="游玩日期"
                  rules={[{ required: true, message: '请选择游玩日期' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="请选择游玩日期"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>

                <Form.Item
                  name="payMethod"
                  label="支付方式"
                  rules={[{ required: true, message: '请选择支付方式' }]}
                >
                  <Radio.Group size="large">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Radio value={PayMethod.BALANCE} style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: '8px', width: '100%' }}>
                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                          <Space>
                            <WalletOutlined style={{ color: '#1677ff' }} />
                            <Text strong>{PayMethodText[PayMethod.BALANCE]}</Text>
                          </Space>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            余额: ¥{userBalance.toFixed(2)}
                          </Text>
                        </Space>
                      </Radio>
                      <Radio value={PayMethod.ALIPAY} style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: '8px', width: '100%' }}>
                        <Space>
                          <AlipayOutlined style={{ color: '#1890ff' }} />
                          <Text strong>{PayMethodText[PayMethod.ALIPAY]}</Text>
                        </Space>
                      </Radio>
                      <Radio value={PayMethod.WECHAT} style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: '8px', width: '100%' }}>
                        <Space>
                          <WechatOutlined style={{ color: '#52c41a' }} />
                          <Text strong>{PayMethodText[PayMethod.WECHAT]}</Text>
                        </Space>
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* 右侧订单汇总 */}
          <Col xs={24} lg={8}>
            <Card style={{ position: 'sticky', top: '100px' }}>
              <Title level={4} style={{ textAlign: 'center', marginBottom: '24px' }}>
                订单汇总
              </Title>
              
              {hasPendingPayment && (
                <div style={{ 
                  background: '#fff7e6', 
                  border: '1px solid #ffd591', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginBottom: '16px' 
                }}>
                  <Text style={{ color: '#d48806', fontSize: '14px' }}>
                    📝 您有一个待支付的订单，请在支付宝完成支付后点击"刷新订单状态"
                  </Text>
                </div>
              )}
              
              <Descriptions column={1} size="small">
                <Descriptions.Item label="商品数量">
                  <Text strong>{calculateTotalQuantity()} 件</Text>
                </Descriptions.Item>
                <Descriptions.Item label="商品总价">
                  <Text strong>¥{calculateTotal().toFixed(2)}</Text>
                </Descriptions.Item>
              </Descriptions>
              
              <Divider />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Text strong style={{ fontSize: '16px' }}>应付总额:</Text>
                <Text strong style={{ fontSize: '24px', color: '#ff4d4f' }}>
                  ¥{calculateTotal().toFixed(2)}
                </Text>
              </div>

              {hasPendingPayment ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    onClick={checkPaymentAndCreateOrder}
                    style={{
                      height: '48px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '12px'
                    }}
                  >
                    {loading ? '正在检查支付状态...' : '刷新订单状态'}
                  </Button>
                  <Button
                    size="large"
                    block
                    onClick={() => {
                      localStorage.removeItem('pendingOrderData')
                      setHasPendingPayment(false)
                      message.success('已取消待支付订单')
                    }}
                    style={{
                      height: '48px',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    取消支付
                  </Button>
                </Space>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loading}
                  onClick={() => form.submit()}
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? '处理中...' : (
                    form.getFieldValue('payMethod') === PayMethod.ALIPAY ? '跳转支付宝支付' : 
                    form.getFieldValue('payMethod') === PayMethod.WECHAT ? '跳转微信支付' : '确认支付'
                  )}
                </Button>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default OrderConfirmPage
