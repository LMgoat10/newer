import React, { useState, useEffect } from 'react'
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Modal, 
  message, 
  Card, 
  Statistic, 
  Row, 
  Col,
  Popconfirm,
  Form,
  Typography,
  Divider
} from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import { 
  SearchOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import adminRefundService from '../../services/adminRefundService'
import type { AdminRefund, RefundStatistics } from '../../services/adminRefundService'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { Title } = Typography

interface RefundManagementProps {}

const RefundManagement: React.FC<RefundManagementProps> = () => {
  const [refunds, setRefunds] = useState<AdminRefund[]>([])
  const [loading, setLoading] = useState(false)
  const [statistics, setStatistics] = useState<RefundStatistics | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [filters, setFilters] = useState({
    keyword: '',
    status: 'ALL',
  })
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [selectedRefund, setSelectedRefund] = useState<AdminRefund | null>(null)
  const [rejectForm] = Form.useForm()

  // 加载退票申请列表
  const loadRefunds = async () => {
    try {
      setLoading(true)
      console.log('Loading refunds with filters:', filters, 'pagination:', pagination)
      
      const data = await adminRefundService.getRefundRequests(
        pagination.current,
        pagination.pageSize,
        filters.keyword,
        filters.status
      )
      
      console.log('Loaded refunds:', data)
      setRefunds(data.records)
      setPagination(prev => ({
        ...prev,
        total: data.total,
      }))
    } catch (error) {
      console.error('加载退票申请失败:', error)
      message.error('加载退票申请失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const stats = await adminRefundService.getRefundStatistics()
      console.log('Loaded statistics:', stats)
      setStatistics(stats)
    } catch (error) {
      console.error('加载统计数据失败:', error)
      message.error('加载统计数据失败: ' + (error as Error).message)
    }
  }

  useEffect(() => {
    loadRefunds()
    loadStatistics()
  }, [pagination.current, pagination.pageSize, filters])

  // 批准退票
  const handleApprove = async (refund: AdminRefund) => {
    try {
      await adminRefundService.approveRefund(refund.id)
      message.success('退票申请已批准')
      loadRefunds()
      loadStatistics()
    } catch (error) {
      console.error('批准退票失败:', error)
      message.error('批准退票失败: ' + (error as Error).message)
    }
  }

  // 显示拒绝模态框
  const showRejectModal = (refund: AdminRefund) => {
    setSelectedRefund(refund)
    setRejectModalVisible(true)
    rejectForm.resetFields()
  }

  // 拒绝退票
  const handleReject = async () => {
    if (!selectedRefund) return
    
    try {
      const values = await rejectForm.validateFields()
      await adminRefundService.rejectRefund(selectedRefund.id, values.reason)
      message.success('退票申请已拒绝')
      setRejectModalVisible(false)
      setSelectedRefund(null)
      loadRefunds()
      loadStatistics()
    } catch (error) {
      console.error('拒绝退票失败:', error)
      message.error('拒绝退票失败: ' + (error as Error).message)
    }
  }

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'REFUND_REQUEST': 'orange',
      'REFUNDED': 'green',
      'PAID': 'blue',
      'TICKETED': 'purple',
      'CANCELLED': 'red'
    }
    return colorMap[status] || 'default'
  }

  // 支付方式颜色映射  
  const getPayMethodColor = (payMethod: string) => {
    const colorMap: Record<string, string> = {
      'BALANCE': 'blue',
      'ALIPAY': 'cyan',
      'WECHAT': 'green'
    }
    return colorMap[payMethod] || 'default'
  }

  // 表格列定义
  const columns: TableColumnsType<AdminRefund> = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      width: 160,
      fixed: 'left',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {text}
        </span>
      ),
    },
    {
      title: '用户信息',
      key: 'userInfo',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.userName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>ID: {record.userId}</div>
        </div>
      ),
    },
    {
      title: '景点信息',
      key: 'attractionInfo', 
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.attractionName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.visitDate} | {record.quantity}张
          </div>
        </div>
      ),
    },
    {
      title: '联系人',
      key: 'contactInfo',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.contactName}</div>
          <div style={{ color: '#666' }}>{record.contactPhone}</div>
        </div>
      ),
    },
    {
      title: '金额',
      key: 'amountInfo',
      width: 100,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#f50' }}>
            ¥{record.totalAmount}
          </div>
          <div style={{ color: '#666' }}>
            {record.unitPrice} × {record.quantity}
          </div>
        </div>
      ),
    },
    {
      title: '支付方式',
      dataIndex: 'payMethodName',
      key: 'payMethod',
      width: 100,
      render: (text: string, record) => (
        <Tag color={getPayMethodColor(record.payMethod)}>{text}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'statusName',
      key: 'status',
      width: 100,
      render: (text: string, record) => (
        <Tag color={getStatusColor(record.status)}>{text}</Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text: string) => new Date(text).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\//g, '-'),
    },
    {
      title: '退款原因',
      dataIndex: 'refundReason',
      key: 'refundReason',
      width: 150,
      render: (text: string) => (
        <span style={{ fontSize: '12px' }}>
          {text || '无'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 160,
      render: (_, record) => {
        if (record.status === 'REFUND_REQUEST') {
          return (
            <Space>
              <Popconfirm
                title="确认批准退票"
                description="确定要批准这个退票申请吗？退款将自动处理。"
                onConfirm={() => handleApprove(record)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  type="primary" 
                  size="small"
                  icon={<CheckCircleOutlined />}
                >
                  批准
                </Button>
              </Popconfirm>
              <Button 
                danger 
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => showRejectModal(record)}
              >
                拒绝
              </Button>
            </Space>
          )
        } else {
          return (
            <span style={{ color: '#999' }}>
              {record.status === 'REFUNDED' ? '已处理' : '无操作'}
            </span>
          )
        }
      },
    },
  ]

  // 表格变化处理
  const handleTableChange: TableProps<AdminRefund>['onChange'] = (paginationConfig) => {
    setPagination({
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
      total: pagination.total,
    })
  }

  // 搜索处理
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, keyword: value }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // 状态筛选处理
  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  return (
    <div>
      <Title level={2}>退票管理</Title>

      {/* 统计卡片 */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="待审核退票"
                value={statistics.pendingCount}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="已退款订单"
                value={statistics.refundedCount}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="今日退款金额"
                value={statistics.todayRefundAmount}
                precision={2}
                prefix={<DollarCircleOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
                suffix="¥"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="搜索订单号、联系人姓名或电话"
              allowClear
              onSearch={handleSearch}
              style={{ width: '300px' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col>
            <Select
              value={filters.status}
              onChange={handleStatusChange}
              style={{ width: '150px' }}
            >
              <Option value="ALL">全部状态</Option>
              <Option value="REFUND_REQUEST">退票申请中</Option>
              <Option value="REFUNDED">已退款</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 退票申请列表 */}
      <Card>
        <Table<AdminRefund>
          columns={columns}
          dataSource={refunds}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          size="small"
        />
      </Card>

      {/* 拒绝退票模态框 */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            拒绝退票申请
          </Space>
        }
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false)
          setSelectedRefund(null)
        }}
        width={600}
        okText="确定拒绝"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        {selectedRefund && (
          <div>
            <Divider orientation="left" plain>
              <FileTextOutlined /> 订单信息
            </Divider>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>订单号:</strong> {selectedRefund.id}</p>
                <p><strong>用户:</strong> {selectedRefund.userName}</p>
                <p><strong>景点:</strong> {selectedRefund.attractionName}</p>
              </Col>
              <Col span={12}>
                <p><strong>联系人:</strong> {selectedRefund.contactName}</p>
                <p><strong>电话:</strong> {selectedRefund.contactPhone}</p>
                <p><strong>金额:</strong> ¥{selectedRefund.totalAmount}</p>
              </Col>
            </Row>
            
            <Divider orientation="left" plain>
              拒绝理由
            </Divider>
            <Form form={rejectForm} layout="vertical">
              <Form.Item
                name="reason"
                label="请填写拒绝退票的理由"
                rules={[
                  { required: true, message: '请填写拒绝理由' },
                  { min: 5, message: '拒绝理由至少5个字符' },
                  { max: 200, message: '拒绝理由不超过200个字符' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="请详细说明拒绝退票的原因，如：已超出退票时限、景点门票特殊说明不支持退票等"
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RefundManagement
