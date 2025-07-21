import { useState, useEffect } from 'react'
import { Card, Button, Typography, Space, Spin, message, Divider } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, ReloadOutlined, WalletOutlined } from '@ant-design/icons'
import { WalletService } from '../services/walletService'
import RechargeModal from '../components/RechargeModal'

const { Title, Text } = Typography

interface WalletPageProps {
  onNavigate: (route: string) => void
}

function WalletPage({ onNavigate }: WalletPageProps) {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false)

  // 获取钱包余额
  const fetchBalance = async (showLoading = false) => {
    if (showLoading) setRefreshing(true)
    
    try {
      const response = await WalletService.getBalance()
      
      if (response.status === 200 && response.data) {
        setBalance(response.data.balance)
      } else {
        message.error(response.message || '获取余额失败')
      }
    } catch (error) {
      console.error('Get balance error:', error)
      message.error('获取余额失败，请稍后重试')
    } finally {
      setLoading(false)
      if (showLoading) setRefreshing(false)
    }
  }

  // 页面加载时获取余额
  useEffect(() => {
    fetchBalance()
  }, [])

  // 处理充值成功
  const handleRechargeSuccess = (newBalance: number) => {
    setBalance(newBalance)
    message.success(`充值成功！当前余额：¥${newBalance.toFixed(2)}`)
  }

  // 刷新余额
  const handleRefresh = () => {
    fetchBalance(true)
  }

  return (
    <div>
      {/* Header */}
      <Card className="rounded-none shadow-sm" bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between">
          <Space>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => onNavigate('/home')}
            />
            <Title level={4} style={{ margin: 0, color: '#1f2937' }}>我的钱包</Title>
          </Space>
          <Button 
            type="text" 
            icon={<ReloadOutlined />} 
            loading={refreshing}
            onClick={handleRefresh}
          >
            刷新
          </Button>
        </div>
      </Card>

      {/* Content */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4">
              <Text type="secondary">正在获取余额信息...</Text>
            </div>
          </div>
        ) : (
          <>
            {/* 余额卡片 */}
            <Card 
              className="mb-6" 
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '16px'
              }}
            >
              <div className="text-center py-4">
                <WalletOutlined style={{ fontSize: '32px', color: 'white', marginBottom: '8px' }} />
                <div style={{ color: 'white', opacity: 0.8, marginBottom: '8px' }}>
                  账户余额
                </div>
                <Title level={1} style={{ color: 'white', margin: 0, fontSize: '36px' }}>
                  ¥{balance.toFixed(2)}
                </Title>
              </div>
            </Card>

            {/* 操作按钮 */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />}
                onClick={() => setRechargeModalVisible(true)}
                style={{ 
                  height: '56px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                立即充值
              </Button>
            </div>

            {/* 功能说明 */}
            <Card title="钱包功能" className="mb-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Text>余额支付</Text>
                  <Text type="secondary">订单支付时可使用余额</Text>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div className="flex items-center justify-between">
                  <Text>在线充值</Text>
                  <Text type="secondary">支持支付宝、微信支付</Text>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div className="flex items-center justify-between">
                  <Text>退款到账</Text>
                  <Text type="secondary">退票成功后自动到账</Text>
                </div>
              </div>
            </Card>

            {/* 温馨提示 */}
            <Card>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                💡 温馨提示：钱包余额仅用于平台内消费，请合理充值。如有问题，请联系客服。
              </Text>
            </Card>
          </>
        )}
      </div>

      {/* 充值弹窗 */}
      <RechargeModal 
        visible={rechargeModalVisible}
        onClose={() => setRechargeModalVisible(false)}
        onSuccess={handleRechargeSuccess}
      />
    </div>
  )
}

export default WalletPage