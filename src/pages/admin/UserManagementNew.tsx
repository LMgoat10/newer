import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Select,
  message,
  Statistic,
  Avatar
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import AdminUserService from '../../services/adminUserService'
import type { 
  AdminUser, 
  AddUserRequest, 
  UpdateUserRequest 
} from '../../services/adminUserService'
import { UserStatus, UserRole } from '../../services/adminUserService'

const { Title } = Typography
const { Option } = Select
const { Search } = Input

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form] = Form.useForm()

  // 获取用户列表
  const fetchUsers = async (page = current, size = pageSize, searchKeyword = keyword) => {
    try {
      setLoading(true)
      const response = await AdminUserService.getUsers(page, size, searchKeyword)
      if (response.status === 200 && response.data) {
        setUsers(response.data.users)
        setTotal(response.data.total)
      } else {
        // Fallback to mock data for demo
        const mockUsers: AdminUser[] = [
          {
            id: 1,
            name: '张三',
            email: 'zhangsan@example.com',
            phone: '13800138001',
            balance: 1200.50,
            status: UserStatus.ACTIVE,
            joinDate: '2025-01-15',
            totalOrders: 5
          },
          {
            id: 2,
            name: '李四',
            email: 'lisi@example.com',
            phone: '13800138002',
            balance: 500.00,
            status: UserStatus.ACTIVE,
            joinDate: '2025-02-20',
            totalOrders: 3
          },
          {
            id: 3,
            name: '王五',
            email: 'wangwu@example.com',
            phone: '13800138003',
            balance: 0.00,
            status: UserStatus.SUSPENDED,
            joinDate: '2025-03-10',
            totalOrders: 0
          }
        ]
        setUsers(mockUsers)
        setTotal(mockUsers.length)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      message.error('获取用户列表失败，使用模拟数据')
      // Fallback to mock data
      const mockUsers: AdminUser[] = [
        {
          id: 1,
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138001',
          balance: 1200.50,
          status: UserStatus.ACTIVE,
          joinDate: '2025-01-15',
          totalOrders: 5
        },
        {
          id: 2,
          name: '李四',
          email: 'lisi@example.com',
          phone: '13800138002',
          balance: 500.00,
          status: UserStatus.ACTIVE,
          joinDate: '2025-02-20',
          totalOrders: 3
        }
      ]
      setUsers(mockUsers)
      setTotal(mockUsers.length)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [current, pageSize])

  // 搜索用户
  const handleSearch = (value: string) => {
    setKeyword(value)
    setCurrent(1)
    fetchUsers(1, pageSize, value)
  }

  // 显示添加用户模态框
  const showAddModal = () => {
    setIsEditMode(false)
    setEditingUser(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  // 显示编辑用户模态框
  const showEditModal = (user: AdminUser) => {
    setIsEditMode(true)
    setEditingUser(user)
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role || UserRole.USER
    })
    setIsModalVisible(true)
  }

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      if (isEditMode && editingUser) {
        // 更新用户
        const updateData: UpdateUserRequest = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          status: values.status
        }
        const response = await AdminUserService.updateUser(editingUser.id, updateData)
        if (response.status === 200) {
          message.success('用户更新成功')
          setIsModalVisible(false)
          fetchUsers()
        } else {
          message.error(response.message || '用户更新失败')
        }
      } else {
        // 添加用户
        const addData: AddUserRequest = {
          name: values.name,
          email: values.email,
          password: values.password,
          phone: values.phone,
          role: values.role
        }
        const response = await AdminUserService.addUser(addData)
        if (response.status === 200) {
          message.success('用户添加成功')
          setIsModalVisible(false)
          fetchUsers()
        } else {
          message.error(response.message || '用户添加失败')
        }
      }
    } catch (error) {
      console.error('操作失败:', error)
      message.error('操作失败，请重试')
    }
  }

  // 删除用户
  const handleDelete = async (userId: number) => {
    try {
      const response = await AdminUserService.deleteUser(userId)
      if (response.status === 200) {
        message.success('用户删除成功')
        fetchUsers()
      } else {
        message.error(response.message || '用户删除失败')
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      message.error('删除用户失败')
    }
  }

  // 获取状态标签样式
  const getStatusTag = (status: string) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return <Tag color="green">活跃</Tag>
      case UserStatus.INACTIVE:
        return <Tag color="orange">未激活</Tag>
      case UserStatus.SUSPENDED:
        return <Tag color="red">已暂停</Tag>
      default:
        return <Tag>未知</Tag>
    }
  }

  // 表格列定义
  const columns: ColumnsType<AdminUser> = [
    {
      title: '用户',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: AdminUser) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number) => `¥${balance.toFixed(2)}`,
      sorter: (a, b) => a.balance - b.balance,
    },
    {
      title: '订单数',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      sorter: (a, b) => a.totalOrders - b.totalOrders,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '加入时间',
      dataIndex: 'joinDate',
      key: 'joinDate',
      sorter: (a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: AdminUser) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            description="此操作不可撤销"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>用户管理</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={users.filter(u => u.status === UserStatus.ACTIVE).length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="暂停用户"
              value={users.filter(u => u.status === UserStatus.SUSPENDED).length}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总余额"
              value={users.reduce((sum, u) => sum + u.balance, 0)}
              formatter={(value) => `¥${Number(value).toFixed(2)}`}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between">
            <Col>
              <Space>
                <Search
                  placeholder="搜索用户名、邮箱或手机号"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  onSearch={handleSearch}
                  style={{ width: 300 }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchUsers()}
                  size="large"
                >
                  刷新
                </Button>
              </Space>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showAddModal}
                size="large"
              >
                添加用户
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page, size) => {
              setCurrent(page)
              setPageSize(size || 10)
            },
          }}
        />
      </Card>

      {/* 添加/编辑用户模态框 */}
      <Modal
        title={isEditMode ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '邮箱格式不正确' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
                ]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
                initialValue={UserStatus.ACTIVE}
              >
                <Select placeholder="请选择状态">
                  <Option value={UserStatus.ACTIVE}>活跃</Option>
                  <Option value={UserStatus.INACTIVE}>未激活</Option>
                  <Option value={UserStatus.SUSPENDED}>已暂停</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {!isEditMode && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' }
                  ]}
                >
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label="角色"
                  rules={[{ required: true, message: '请选择角色' }]}
                  initialValue={UserRole.USER}
                >
                  <Select placeholder="请选择角色">
                    <Option value={UserRole.USER}>普通用户</Option>
                    <Option value={UserRole.ADMIN}>管理员</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {isEditMode ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
