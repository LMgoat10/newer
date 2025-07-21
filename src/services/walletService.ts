import { type ApiResponse } from './authService'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// 通用API请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // 添加认证token（如果存在）
  const token = localStorage.getItem('authToken')
  console.log('API Request:', {
    url,
    method: options.method || 'GET',
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : null
  })
  
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(url, config)
    
    console.log('API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })
    
    const result = await response.json()
    console.log('API Response Data:', result)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${result.message || response.statusText}`)
    }
    
    return result
  } catch (error) {
    console.error('Wallet API request failed:', {
      url,
      error: error instanceof Error ? error.message : error
    })
    throw error
  }
}

// 钱包相关接口定义
export interface WalletBalance {
  userId: number
  balance: number
}

export interface PaymentRequest {
  orderId: string
  paymentMethod: 'BALANCE' | 'ALIPAY' | 'WECHAT'
}

export interface PaymentResult {
  orderId: string
  paymentId: string
  remainingBalance: number
}

export interface RechargeRequest {
  amount: number
  paymentMethod: 'ALIPAY' | 'WECHAT'
}

export interface RechargeResult {
  rechargeId: string
  amount: number
  newBalance: number
}

export interface RefundRequest {
  orderId: string
  reason: string
}

export interface RefundResult {
  refundId: string
  orderId: string
  status: string
}

// 钱包API服务
export class WalletService {
  // 获取钱包余额
  static async getBalance(): Promise<ApiResponse<WalletBalance>> {
    return apiRequest<ApiResponse<WalletBalance>>('/api/user/wallet/balance', {
      method: 'GET',
    })
  }

  // 支付订单
  static async processPayment(paymentData: PaymentRequest): Promise<ApiResponse<PaymentResult>> {
    return apiRequest<ApiResponse<PaymentResult>>('/api/user/payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  // 账户充值
  static async recharge(rechargeData: RechargeRequest): Promise<ApiResponse<RechargeResult>> {
    return apiRequest<ApiResponse<RechargeResult>>('/api/user/recharge', {
      method: 'POST',
      body: JSON.stringify(rechargeData),
    })
  }

  // 申请退票
  static async applyRefund(refundData: RefundRequest): Promise<ApiResponse<RefundResult>> {
    return apiRequest<ApiResponse<RefundResult>>('/api/user/refund', {
      method: 'POST',
      body: JSON.stringify(refundData),
    })
  }

  // 测试方法：不需要JWT认证的余额查询
  static async testGetBalance(userId: number): Promise<ApiResponse<WalletBalance>> {
    return apiRequest<ApiResponse<WalletBalance>>(`/api/test/balance/${userId}`, {
      method: 'GET',
    })
  }

  // 测试方法：不需要JWT认证的充值
  static async testRecharge(userId: number, amount: number): Promise<ApiResponse<RechargeResult>> {
    return apiRequest<ApiResponse<RechargeResult>>(`/api/test/recharge/${userId}?amount=${amount}`, {
      method: 'POST',
    })
  }
}

export default WalletService