import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
  message,
  Modal,
  Statistic
} from 'antd'
import {
  DeleteOutlined,
  SearchOutlined,
  SendOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import adminOrderService from '../../services/adminOrderService'
import type { AdminOrder, OrderStatistics } from '../../services/adminOrderService'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    loadOrders()
    loadStatistics()
  }, [pagination.current, pagination.pageSize, statusFilter, searchKeyword])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const result = await adminOrderService.getOrders(
        pagination.current,
        pagination.pageSize,
        searchKeyword,
        statusFilter
      )
      
      setOrders(result.records)
      setPagination(prev => ({
        ...prev,
        total: result.total
      }))
    } catch (error: any) {
      message.error(error.message || '加载订单数据失败')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await adminOrderService.getOrderStatistics()
      setStatistics(stats)
    } catch (error: any) {
      console.error('加载统计数据失败:', error)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await adminOrderService.deleteOrder(orderId)
      message.success('订单删除成功')
      loadOrders()
      loadStatistics()
    } catch (error: any) {
      message.error(error.message || '删除订单失败')
    }
  }

  const handleReleaseTicket = async (orderId: string) => {
    try {
      await adminOrderService.releaseTicket(orderId)
      message.success('放票成功')
      loadOrders()
      loadStatistics()
    } catch (error: any) {
      message.error(error.message || '放票失败')
    }
  }

  const handleViewDetail = (order: AdminOrder) => {
    setSelectedOrder(order)
    setDetailModalVisible(true)
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    loadOrders()
  }

  const handleTableChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }))
  }

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      width: 180,
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '景点',
      dataIndex: 'attractionName',
      key: 'attractionName',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => `¥${price}`,
      width: 100,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `¥${amount}`,
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={adminOrderService.getStatusColor(status)}>
          {adminOrderService.getStatusText(status)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: '游览日期',
      dataIndex: 'visitDate',
      key: 'visitDate',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
      width: 150,
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: any, record: AdminOrder) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'CANCELLED' && (
            <Popconfirm
              title="确定删除此订单？"
              onConfirm={() => handleDeleteOrder(record.id)}
            >
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
              >
                删除
              </Button>
            </Popconfirm>
          )}
          {record.status === 'PAID' && (
            <Button
              icon={<SendOutlined />}
              size="small"
              type="primary"
              onClick={() => handleReleaseTicket(record.id)}
            >
              放票
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>订单管理</Title>
      
      {/* 统计卡片 */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="总订单数"
                value={statistics.totalOrders}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="待放票"
                value={statistics.paidOrders}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已放票"
                value={statistics.ticketedOrders}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="退票申请"
                value={statistics.refundRequestOrders}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已退款"
                value={statistics.refundedOrders}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已取消"
                value={statistics.cancelledOrders}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 过滤器 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="订单状态"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="ALL">全部状态</Option>
              <Option value="PAID">已支付待放票</Option>
              <Option value="TICKETED">已放票</Option>
              <Option value="REFUND_REQUEST">退票申请中</Option>
              <Option value="REFUNDED">已退款</Option>
              <Option value="CANCELLED">已取消</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
          <Col span={6}>
            <Input.Search
              placeholder="搜索订单号/联系人"
              allowClear
              value={searchKeyword}
              onSearch={handleSearch}
              onChange={(e) => setSearchKeyword(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                loadOrders()
                loadStatistics()
              }}
            >
              刷新
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 订单表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
          }}
        />
      </Card>

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>订单号：</strong>{selectedOrder.id}
              </Col>
              <Col span={12}>
                <strong>状态：</strong>
                <Tag color={adminOrderService.getStatusColor(selectedOrder.status)}>
                  {selectedOrder.statusName}
                </Tag>
              </Col>
              <Col span={12}>
                <strong>用户：</strong>{selectedOrder.userName}
              </Col>
              <Col span={12}>
                <strong>景点：</strong>{selectedOrder.attractionName}
              </Col>
              <Col span={12}>
                <strong>数量：</strong>{selectedOrder.quantity}张
              </Col>
              <Col span={12}>
                <strong>单价：</strong>¥{selectedOrder.unitPrice}
              </Col>
              <Col span={12}>
                <strong>总金额：</strong>¥{selectedOrder.totalAmount}
              </Col>
              <Col span={12}>
                <strong>游览日期：</strong>{selectedOrder.visitDate}
              </Col>
              <Col span={12}>
                <strong>联系人：</strong>{selectedOrder.contactName}
              </Col>
              <Col span={12}>
                <strong>联系电话：</strong>{selectedOrder.contactPhone}
              </Col>
              <Col span={24}>
                <strong>联系地址：</strong>{selectedOrder.address}
              </Col>
              <Col span={12}>
                <strong>支付方式：</strong>{selectedOrder.payMethodName}
              </Col>
              <Col span={12}>
                <strong>支付金额：</strong>¥{selectedOrder.payAmount}
              </Col>
              <Col span={12}>
                <strong>创建时间：</strong>{dayjs(selectedOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Col>
              {selectedOrder.payTime && (
                <Col span={12}>
                  <strong>付款时间：</strong>{dayjs(selectedOrder.payTime).format('YYYY-MM-DD HH:mm:ss')}
                </Col>
              )}
              {selectedOrder.refundReason && (
                <Col span={24}>
                  <strong>退款原因：</strong>{selectedOrder.refundReason}
                </Col>
              )}
              {selectedOrder.refundTime && (
                <Col span={12}>
                  <strong>退款时间：</strong>{dayjs(selectedOrder.refundTime).format('YYYY-MM-DD HH:mm:ss')}
                </Col>
              )}
              {selectedOrder.refundAmount && (
                <Col span={12}>
                  <strong>退款金额：</strong>¥{selectedOrder.refundAmount}
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OrderManagement
