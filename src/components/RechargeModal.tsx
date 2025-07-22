import { useState } from 'react'
import { Modal, Button, InputNumber, Radio, Form, message, Space } from 'antd'
import { AlipayOutlined, WechatOutlined } from '@ant-design/icons'
import { WalletService, type RechargeRequest } from '../services/walletService'

interface RechargeModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: (newBalance: number) => void
}

function RechargeModal({ visible, onClose, onSuccess }: RechargeModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleRecharge = async (values: { amount: number; paymentMethod: string }) => {
    setLoading(true)
    
    try {
      const rechargeData: RechargeRequest = {
        amount: values.amount,
        paymentMethod: values.paymentMethod as 'ALIPAY' | 'WECHAT'
      }

      const response = await WalletService.recharge(rechargeData)
      
      if (response.status === 200 && response.data) {
        message.success('充值成功！')
        onSuccess(response.data.newBalance)
        
        // 触发全局钱包更新事件
        window.dispatchEvent(new CustomEvent('walletUpdated'))
        
        form.resetFields()
        onClose()
      } else {
        message.error(response.message || '充值失败')
      }
    } catch (error) {
      console.error('Recharge error:', error)
      message.error('充值失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title="账户充值"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleRecharge}
        initialValues={{ paymentMethod: 'ALIPAY' }}
      >
        <Form.Item
          label="充值金额"
          name="amount"
          rules={[
            { required: true, message: '请输入充值金额' },
            { type: 'number', min: 0.01, message: '充值金额必须大于0' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入充值金额"
            min={0.01}
            step={0.01}
            precision={2}
            addonBefore="¥"
          />
        </Form.Item>

        <Form.Item
          label="支付方式"
          name="paymentMethod"
          rules={[{ required: true, message: '请选择支付方式' }]}
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="ALIPAY">
                <Space>
                  <AlipayOutlined style={{ color: '#1677ff' }} />
                  支付宝
                </Space>
              </Radio>
              <Radio value="WECHAT">
                <Space>
                  <WechatOutlined style={{ color: '#52c41a' }} />
                  微信支付
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>  

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              立即充值
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RechargeModal