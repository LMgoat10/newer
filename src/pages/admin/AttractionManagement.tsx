import React, { useState, useEffect } from 'react'
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Popconfirm, 
  Tag, 
  Image,
  Select,
  Row,
  Col,
  Card,
  Upload,
  App
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { adminAttractionService } from '../../services/attractionService.ts'

const { TextArea } = Input
const { Option } = Select

interface Attraction {
  id: number
  name: string
  location: string
  category: string
  rating: number
  description: string
  price: number
  picList: string[]
  tags: string[]
  timing: string
  contactInfo: string
  transportation: string
  createdAt: string
  updatedAt: string
}

interface AttractionForm {
  name: string
  location: string
  category: string
  rating: number
  description: string
  price: number
  picList: string[]
  tags: string[]
  timing: string
  contactInfo: string
  transportation: string
}

const AttractionManagement: React.FC = () => {
  const { message } = App.useApp()
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null)
  const [form] = Form.useForm<AttractionForm>()
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // 加载景点列表
  const loadAttractions = async () => {
    setLoading(true)
    try {
      const result = await adminAttractionService.getAdminAttractionList(1, 100)
      console.log('API返回结果:', result)
      
      // 转换服务返回的数据格式为本地的Attraction格式
      const apiAttractions = result.data || []
      const convertedAttractions: Attraction[] = apiAttractions.map((item: any) => ({
        id: item.id,
        name: item.name,
        location: item.address || '', // 使用address字段作为位置显示
        category: item.category || '景点', 
        rating: item.rating || 4.5,
        description: item.description || '',
        price: item.price || 0,
        picList: item.picList || [], 
        tags: item.tags || [],
        timing: item.timing || item.openTime || '08:30-17:00',
        contactInfo: item.contactInfo || item.phone || '',
        transportation: item.transportation || '',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      }))
      console.log('转换后的景点数据:', convertedAttractions)
      setAttractions(convertedAttractions)
      message.success('加载景点列表成功')
    } catch (error) {
      console.error('获取景点列表失败:', error)
      message.error('获取景点列表失败')
      // 设置空数组避免map错误
      setAttractions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttractions()
  }, [])

  // 新增景点
  const handleAdd = () => {
    setEditingAttraction(null)
    form.resetFields()
    setFileList([])
    setModalVisible(true)
  }

  // 编辑景点
  const handleEdit = (record: Attraction) => {
    setEditingAttraction(record)
    form.setFieldsValue({
      ...record,
      tags: record.tags || []
    })
    
    // 设置图片文件列表
    const imageFiles = record.picList?.map((url, index) => ({
      uid: `${index}`,
      name: `image-${index}`,
      status: 'done' as const,
      url: url
    })) || []
    setFileList(imageFiles)
    
    setModalVisible(true)
  }

  // 删除景点
  const handleDelete = async (id: number) => {
    try {
      await adminAttractionService.deleteAttraction(id)
      message.success('删除成功')
      loadAttractions()
    } catch (error) {
      console.error('删除景点失败:', error)
      message.error('删除失败')
    }
  }

  // 批量删除
  const handleBatchDelete = async (ids: number[]) => {
    try {
      await adminAttractionService.batchDeleteAttractions(ids)
      message.success('批量删除成功')
      loadAttractions()
    } catch (error) {
      console.error('批量删除失败:', error)
      message.error('批量删除失败')
    }
  }

  // 保存景点（新增或编辑）
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      // 提取图片URL
      const picList = fileList
        .filter(file => file.status === 'done')
        .map(file => file.url || file.response?.url)
        .filter(Boolean)

      const formData = {
        name: values.name,
        description: values.description,
        address: values.location, // 后端期望address字段
        cityName: values.location ? values.location.split(/[市区县]/)[0] : '', // 从地址中提取城市
        provinceName: values.location ? values.location.split(/[省市]/)[0] + (values.location.includes('省') ? '省' : '市') : '', // 从地址中提取省份
        areaName: values.location ? values.location.split(/[市]/)[1]?.split(/[区县]/)[0] : '',
        price: values.price || 0,
        totalTickets: 1000,
        availableTickets: 1000,
        openTimeStr: values.timing || '08:30-17:00',
        rating: values.rating || 4.5,
        reviewCount: 100,
        phone: values.contactInfo || '',
        website: '',
        picList,
        tags: values.tags || [],
        status: 'ACTIVE'
      }

      if (editingAttraction) {
        await adminAttractionService.updateAttraction(editingAttraction.id, formData as any)
        message.success('更新成功')
        console.log('景点更新成功，准备刷新列表')
      } else {
        await adminAttractionService.createAttraction(formData as any)
        message.success('创建成功')
        console.log('景点创建成功，准备刷新列表')
      }

      setModalVisible(false)
      console.log('开始重新加载景点列表...')
      await loadAttractions()
      console.log('景点列表重新加载完成')
    } catch (error) {
      console.error('保存景点失败:', error)
      message.error('保存失败')
    }
  }

  // 上传配置
  const uploadProps: UploadProps = {
    fileList,
    multiple: true,
    listType: 'picture-card',
    action: '/api/upload/image', // 假设有上传接口
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList)
    },
    onPreview: (file) => {
      const src = file.url || file.preview
      if (src) {
        window.open(src)
      }
    }
  }

  const columns: ColumnsType<Attraction> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '景点名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: true
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 200,
      ellipsis: true
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating) => `${rating}/5`
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => price === 0 ? '免费' : `¥${price}`
    },
    {
      title: '图片',
      dataIndex: 'picList',
      key: 'picList',
      width: 100,
      render: (picList: string[]) => 
        picList && picList.length > 0 ? (
          <Image
            width={50}
            height={50}
            src={picList[0]}
            style={{ objectFit: 'cover' }}
            fallback="/placeholder-image.jpg"
          />
        ) : (
          <div style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            无图片
          </div>
        )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <>
          {tags?.map(tag => (
            <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
        </>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (time) => time ? new Date(time).toLocaleDateString() : '-'
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个景点吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys as number[])
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2>景点管理</h2>
            </Col>
            <Col>
              <Space>
                {selectedRowKeys.length > 0 && (
                  <Popconfirm
                    title={`确定要删除选中的 ${selectedRowKeys.length} 个景点吗？`}
                    onConfirm={() => handleBatchDelete(selectedRowKeys)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button danger>
                      批量删除 ({selectedRowKeys.length})
                    </Button>
                  </Popconfirm>
                )}
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  新增景点
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={attractions}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title={editingAttraction ? '编辑景点' : '新增景点'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            rating: 5,
            price: 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="景点名称"
                name="name"
                rules={[{ required: true, message: '请输入景点名称' }]}
              >
                <Input placeholder="请输入景点名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="位置"
                name="location"
                rules={[{ required: true, message: '请输入位置' }]}
              >
                <Input placeholder="请输入位置" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="类别"
                name="category"
                rules={[{ required: true, message: '请选择类别' }]}
              >
                <Select placeholder="请选择类别">
                  <Option value="自然风景">自然风景</Option>
                  <Option value="历史文化">历史文化</Option>
                  <Option value="主题乐园">主题乐园</Option>
                  <Option value="城市地标">城市地标</Option>
                  <Option value="博物馆">博物馆</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="评分"
                name="rating"
                rules={[{ required: true, message: '请输入评分' }]}
              >
                <InputNumber
                  min={1}
                  max={5}
                  step={0.1}
                  placeholder="1-5分"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="价格 (¥)"
                name="price"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="请输入价格"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入景点描述' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="请输入景点描述"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="标签"
            name="tags"
          >
            <Select
              mode="tags"
              placeholder="请输入标签，按回车添加"
              style={{ width: '100%' }}
            >
              <Option value="热门">热门</Option>
              <Option value="推荐">推荐</Option>
              <Option value="网红打卡">网红打卡</Option>
              <Option value="亲子">亲子</Option>
              <Option value="情侣">情侣</Option>
              <Option value="周末游">周末游</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="开放时间"
                name="timing"
              >
                <Input placeholder="如：9:00-17:00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="联系方式"
                name="contactInfo"
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="交通信息"
            name="transportation"
          >
            <TextArea 
              rows={2} 
              placeholder="请输入交通信息"
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            label="景点图片"
            name="picList"
          >
            <Upload {...uploadProps}>
              {fileList.length >= 8 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AttractionManagement
