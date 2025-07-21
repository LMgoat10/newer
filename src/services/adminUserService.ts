// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
console.log('AdminUserService API_BASE_URL:', API_BASE_URL)

// 用户状态常量
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
} as const

export type UserStatus = typeof UserStatus[keyof typeof UserStatus]

// 用户角色常量
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

// 用户信息接口
export interface AdminUser {
  id: number
  name: string
  email: string
  phone: string
  balance: number
  status: UserStatus
  joinDate: string
  totalOrders: number
  role?: UserRole
}

// 分页响应接口
export interface PageResponse<T> {
  total: number
  users: T[]
}

// API响应接口
export interface ApiResponse<T = unknown> {
  status: number
  message: string
  data?: T
}

// 添加用户请求接口
export interface AddUserRequest {
  name: string
  email: string
  password: string
  phone: string
  role: UserRole
}

// 更新用户请求接口
export interface UpdateUserRequest {
  name?: string
  email?: string
  phone?: string
  status?: UserStatus
}

// 通用API请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  console.log('API Request:', url, options)
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // 添加认证token
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
    console.log('Using auth token:', token?.substring(0, 20) + '...')
  }

  try {
    console.log('Sending request to:', url)
    const response = await fetch(url, config)
    
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Response error text:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('Response data:', data)
    return data
  } catch (error) {
    console.error('API request failed for:', url)
    console.error('Error details:', error)
    throw error
  }
}

// 管理员用户服务
export class AdminUserService {
  // 获取用户列表
  static async getUsers(
    page: number = 1, 
    size: number = 10, 
    keyword?: string
  ): Promise<ApiResponse<PageResponse<AdminUser>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })
    
    if (keyword) {
      params.append('keyword', keyword)
    }

    return apiRequest<ApiResponse<PageResponse<AdminUser>>>(
      `/api/admin/users?${params.toString()}`,
      {
        method: 'GET',
      }
    )
  }

  // 添加用户
  static async addUser(userData: AddUserRequest): Promise<ApiResponse> {
    return apiRequest<ApiResponse>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // 更新用户
  static async updateUser(
    userId: number, 
    userData: UpdateUserRequest
  ): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  // 删除用户
  static async deleteUser(userId: number): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    })
  }
}

export default AdminUserService
