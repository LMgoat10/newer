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
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// 用户注册DTO接口
export interface UserRegisterDTO {
  name: string
  email: string
  password: string
  phone: string
  avatarFileName?: string
}

// 用户登录DTO接口
export interface UserLoginDTO {
  email: string
  password: string
}

// API响应接口
export interface ApiResponse<T = unknown> {
  status: number
  message: string
  data?: T
  token?: string
}

// 认证API服务
export class AuthService {
  // 用户注册
  static async register(registerData: UserRegisterDTO): Promise<ApiResponse> {
    return apiRequest<ApiResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    })
  }

  // 用户登录
  static async login(loginData: UserLoginDTO): Promise<ApiResponse> {
    return apiRequest<ApiResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })
  }

  // 更新用户信息
  static async update(updateData: Partial<UserRegisterDTO>): Promise<ApiResponse> {
    return apiRequest<ApiResponse>('/api/user/update', {
      method: 'POST',
      body: JSON.stringify(updateData),
    })
  }

  // 用户登出
  static async logout(): Promise<ApiResponse> {
    return apiRequest<ApiResponse>('/api/auth/logout', {
      method: 'POST',
    })
  }

  // 刷新token
  static async refreshToken(): Promise<ApiResponse> {
    return apiRequest<ApiResponse>('/api/auth/refresh', {
      method: 'POST',
    })
  }

  // 获取当前用户信息
  static async getCurrentUser(token: string): Promise<ApiResponse> {
    return apiRequest<ApiResponse>('/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // 存储认证信息
  static setAuthToken(token: string): void {
    localStorage.setItem('authToken', token)
  }

  // 存储用户ID
  static setUserId(userId: string): void {
    localStorage.setItem('userId', userId)
  }

  // 清除认证信息
  static clearAuthToken(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId') // 同时清除用户ID
  }

  // 获取认证token
  static getAuthToken(): string | null {
    console.log('获取token:', localStorage.getItem('authToken'))
    return localStorage.getItem('authToken')
  }

  // 获取用户ID
  static getUserId(): string | null {
    return localStorage.getItem('userId')
  }

  //获取用户头像
  static async getUserAvatar(avatarFileName: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/avatar/${avatarFileName}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${AuthService.getAuthToken()}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // 将响应转换为 Blob
      const blob = await response.blob()
      // 创建 URL 对象
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('获取头像失败:', error)
      throw error
    }
  }

  // 获取用户余额
  static async getUserBalance(): Promise<number> {
    try {
      const response = await apiRequest<ApiResponse<{ balance: number }>>('/api/user/wallet/balance', {
        method: 'GET',
      })
      
      if (response.status === 200 && response.data) {
        return response.data.balance
      } else {
        console.error('获取余额失败:', response.message)
        return 0
      }
    } catch (error) {
      console.error('获取用户余额失败:', error)
      return 0
    }
  }

  // 更新用户余额 (扣款)
  static async deductBalance(amount: number, orderId: string, description: string = '订单支付'): Promise<boolean> {
    try {
      const response = await apiRequest<ApiResponse<{ newBalance: number }>>('/api/user/balance/deduct', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          orderId,
          description
        })
      })
      
      if (response.status === 0 && response.data) {
        console.log(`余额扣除成功，新余额: ${response.data.newBalance}`)
        return true
      } else {
        console.error('余额扣除失败:', response.message)
        return false
      }
    } catch (error) {
      console.error('扣除用户余额失败:', error)
      return false
    }
  }

  // 充值用户余额
  static async rechargeBalance(amount: number, description: string = '账户充值'): Promise<boolean> {
    try {
      const response = await apiRequest<ApiResponse<{ newBalance: number }>>('/api/user/balance/recharge', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          description
        })
      })
      
      if (response.status === 0 && response.data) {
        console.log(`充值成功，新余额: ${response.data.newBalance}`)
        return true
      } else {
        console.error('充值失败:', response.message)
        return false
      }
    } catch (error) {
      console.error('充值失败:', error)
      return false
    }
  }
}

// 文件上传服务
export class FileService {
  // 上传头像
  static async uploadAvatar(file: File): Promise<ApiResponse<{ fileName: string; url: string }>> {
    const formData = new FormData()
    formData.append('avatar', file)

    return apiRequest<ApiResponse<{ fileName: string; url: string }>>('/api/upload/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // 不设置Content-Type，让浏览器自动设置multipart/form-data
    })
  }
}

export default AuthService
