import { z } from 'zod'

export const sendCodeSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/, '手机号格式不正确'),
})

export const forgotPasswordSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/, '手机号格式不正确'),
})

export const resetPasswordSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/, '手机号格式不正确'),
  code: z.string().regex(/^\d{6}$/, '验证码为6位数字'),
  password: z.string().min(6, '密码至少6位').max(50),
})

export const registerSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/, '手机号格式不正确'),
  password: z.string().min(6, '密码至少6位').max(50),
  name: z.string().min(1, '请输入姓名').max(30),
  role: z.enum(['owner', 'sitter']),
  code: z.string().regex(/^\d{6}$/, '验证码为6位数字'),
})

export const loginSchema = z.object({
  account: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1, '请输入密码'),
  loginMethod: z.enum(['phone', 'account']).optional().default('account'),
})

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(30).optional(),
  avatar: z.string().optional(),
})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6).max(50),
})

export const petSchema = z.object({
  name: z.string().min(1, '请输入宠物昵称').max(30),
  type: z.enum(['cat', 'dog', 'other']),
  breed: z.string().max(50).optional().default(''),
  age: z.string().max(20).optional().default(''),
  weight: z.string().max(20).optional().default(''),
  gender: z.enum(['male', 'female']),
  avatar: z.string().optional(),
  color: z.string().optional(),
  note: z.string().optional(),
})

export const addressSchema = z.object({
  name: z.string().min(1, '请输入联系人').max(30),
  phone: z.string().min(1, '请填写电话').max(20),
  tag: z.enum(['home', 'company', 'other']).default('other'),
  address: z.string().min(1, '请选择地址').max(200),
  detail: z.string().max(200).optional().default(''),
  is_default: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export const orderCreateSchema = z.object({
  sitter_id: z.string().min(1),
  pet_ids: z.array(z.string()).min(1, '请选择至少一个宠物'),
  address_id: z.string().min(1, '请选择地址'),
  service_ids: z.array(z.string()).min(1, '请选择至少一个服务'),
  service_date: z.string().min(1),
  service_time: z.string().min(1),
  note: z.string().optional().default(''),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  on_time: z.number().int().min(1).max(5).default(5),
  attitude: z.number().int().min(1).max(5).default(5),
  professional: z.number().int().min(1).max(5).default(5),
  text: z.string().max(500).optional().default(''),
  is_anonymous: z.boolean().default(false),
  images: z.string().optional().default(''),
})

export const sitterApplicationSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(30),
  phone: z.string().regex(/^1\d{10}$/, '手机号格式不正确'),
  city: z.string().min(1, '请选择所在城市'),
  wechat: z.string().optional().default(''),
  bio: z.string().min(10, '介绍至少10个字').max(200),
  certs: z.array(z.object({
    key: z.string(),
    label: z.string(),
    required: z.boolean(),
    uploaded: z.boolean(),
    fileName: z.string(),
  })),
  areas: z.array(z.string()).min(1, '请至少选择一个服务区域'),
  max_distance: z.number().min(1).max(50).default(5),
  workday_start: z.string().default('09:00'),
  workday_end: z.string().default('20:00'),
  weekend_start: z.string().default('10:00'),
  weekend_end: z.string().default('18:00'),
})

export const serviceSchema = z.object({
  name: z.string().min(1, '请输入服务名称'),
  icon: z.string().optional().default('🐾'),
  price: z.number().min(0, '价格不能为负'),
  duration: z.number().int().min(5, '时长至少5分钟'),
  description: z.string().optional().default(''),
  category: z.enum(['dog_walk', 'cat_feed', 'clean', 'medical', 'boarding', 'groom', 'training']).optional(),
})

export const messageSchema = z.object({
  content: z.string().min(1, '请输入消息内容').max(2000),
  type: z.enum(['text', 'image', 'system']).default('text'),
  images: z.string().optional().default(''),
})

export const withdrawSchema = z.object({
  amount: z.number().min(1, '提现金额至少1元'),
})
