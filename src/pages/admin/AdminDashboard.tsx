import React, { useState } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Space,
  Typography,
  Avatar,
  Progress,
  List
} from 'antd'
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  ArrowUpOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

const AdminDashboard: React.FC = () => {
  const [loading] = useState(false)

  // 模拟数据
  const statsData = {
    totalUsers: 1128,
    totalOrders: 2568,
    totalRevenue: 125680,
    totalSpots: 68,
    userGrowth: 12.5,
    orderGrowth: 8.3,
    revenueGrowth: 15.2,
    spotGrowth: 5.1
  }

  const recentOrders = [
    {
      key: '1',
      orderId: 'ORDER_20250719_001',
      userName: '张三',
      spotName: '故宫博物院',
      amount: 120,
      status: 'PAID',
      createTime: '2025-07-19 10:30:00'
    },
    {
      key: '2',
      orderId: 'ORDER_20250719_002',
      userName: '李四',
      spotName: '天坛公园',
      amount: 80,
      status: 'PENDING',
      createTime: '2025-07-19 09:15:00'
    },
    {
      key: '3',
      orderId: 'ORDER_20250719_003',
      userName: '王五',
      spotName: '颐和园',
      amount: 100,
      status: 'PAID',
      createTime: '2025-07-19 08:45:00'
    },
    {
      key: '4',
      orderId: 'ORDER_20250719_004',
      userName: '赵六',
      spotName: '八达岭长城',
      amount: 150,
      status: 'SHIPPED',
      createTime: '2025-07-19 07:20:00'
    }
  ]

  const topSpots = [
    { name: '故宫博物院', sales: 256, revenue: 30720 },
    { name: '天坛公园', sales: 189, revenue: 15120 },
    { name: '颐和园', sales: 168, revenue: 16800 },
    { name: '八达岭长城', sales: 145, revenue: 21750 },
    { name: '圆明园', sales: 123, revenue: 9840 }
  ]

  const orderColumns = [
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '景点',
      dataIndex: 'spotName',
      key: 'spotName',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          'PENDING': { color: 'orange', text: '待付款' },
          'PAID': { color: 'green', text: '已付款' },
          'SHIPPED': { color: 'blue', text: '已发货' },
          'COMPLETED': { color: 'success', text: '已完成' },
        }
        return (
          <Tag color={statusConfig[status as keyof typeof statusConfig]?.color}>
            {statusConfig[status as keyof typeof statusConfig]?.text}
          </Tag>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        仪表盘
      </Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={statsData.totalUsers}
              prefix={<UserOutlined />}
              suffix={
                <Space>
                  <ArrowUpOutlined style={{ color: '#3f8600' }} />
                  <Text type="success">{statsData.userGrowth}%</Text>
                </Space>
              }
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={statsData.totalOrders}
              prefix={<ShoppingCartOutlined />}
              suffix={
                <Space>
                  <ArrowUpOutlined style={{ color: '#3f8600' }} />
                  <Text type="success">{statsData.orderGrowth}%</Text>
                </Space>
              }
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={statsData.totalRevenue}
              prefix={<DollarOutlined />}
              suffix={
                <Space>
                  <ArrowUpOutlined style={{ color: '#3f8600' }} />
                  <Text type="success">{statsData.revenueGrowth}%</Text>
                </Space>
              }
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="景点数量"
              value={statsData.totalSpots}
              prefix={<EnvironmentOutlined />}
              suffix={
                <Space>
                  <ArrowUpOutlined style={{ color: '#3f8600' }} />
                  <Text type="success">{statsData.spotGrowth}%</Text>
                </Space>
              }
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 最近订单 */}
        <Col span={16}>
          <Card title="最近订单" style={{ marginBottom: 24 }}>
            <Table
              columns={orderColumns}
              dataSource={recentOrders}
              pagination={false}
              loading={loading}
              size="small"
            />
          </Card>
        </Col>

        {/* 热门景点 */}
        <Col span={8}>
          <Card title="热门景点排行" style={{ marginBottom: 24 }}>
            <List
              dataSource={topSpots}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ 
                        backgroundColor: '#1890ff',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </Avatar>
                    }
                    title={item.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">销量: {item.sales}张</Text>
                        <Text type="secondary">收入: ¥{item.revenue}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 系统状态 */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="系统状态">
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Progress type="circle" percent={85} format={() => 'CPU'} />
                  <div style={{ marginTop: 8 }}>CPU使用率</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Progress type="circle" percent={65} format={() => 'MEM'} />
                  <div style={{ marginTop: 8 }}>内存使用率</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Progress type="circle" percent={45} format={() => 'DISK'} />
                  <div style={{ marginTop: 8 }}>磁盘使用率</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Progress 
                    type="circle" 
                    percent={95} 
                    format={() => 'UP'} 
                    strokeColor="#52c41a"
                  />
                  <div style={{ marginTop: 8 }}>系统运行时间</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboard
