/**
 * 支付状态检查服务
 */

export interface PaymentStatusResponse {
  success: boolean
  paid: boolean
  message: string
  orderInfo?: {
    tradeNo: string
    status: string
    totalAmount: number
    paymentTime?: string
  }
}

class PaymentStatusService {
  private baseURL = 'http://localhost:8080'

  /**
   * 检查支付状态
   * @param tradeNo 商户订单号
   */
  async checkPaymentStatus(tradeNo: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`${this.baseURL}/alipay/check-status?tradeNo=${tradeNo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        // 如果接口不存在（404），临时返回未支付状态
        if (response.status === 404) {
          return {
            success: false,
            paid: false,
            message: '后端接口尚未实现，请添加 /alipay/check-status 接口'
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        paid: result.status === 'PAID' || result.status === 'TRADE_SUCCESS',
        message: result.message || '查询成功',
        orderInfo: result.orderInfo
      }
    } catch (error) {
      console.error('检查支付状态失败:', error)
      
      // 网络错误时，提供用户友好的提示
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          paid: false,
          message: '网络连接失败，请检查后端服务是否启动'
        }
      }
      
      return {
        success: false,
        paid: false,
        message: error instanceof Error ? error.message : '查询支付状态失败'
      }
    }
  }

  /**
   * 轮询检查支付状态
   * @param tradeNo 商户订单号
   * @param maxAttempts 最大尝试次数
   * @param interval 检查间隔（毫秒）
   */
  async pollPaymentStatus(
    tradeNo: string, 
    maxAttempts: number = 5, 
    interval: number = 2000
  ): Promise<PaymentStatusResponse> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`第 ${attempt} 次检查支付状态...`)
      
      const result = await this.checkPaymentStatus(tradeNo)
      
      if (result.success && result.paid) {
        return result
      }
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, interval))
      }
    }
    
    return {
      success: false,
      paid: false,
      message: `经过 ${maxAttempts} 次检查，支付状态仍未确认，请稍后再试或联系客服`
    }
  }
}

export const paymentStatusService = new PaymentStatusService()
