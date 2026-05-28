# 宠物上门服务网站 - 目录结构

```
pet-home-service/
├── package.json                    # 根工作区配置 (monorepo)
├── .gitignore
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── README.md
│
├── client/                         # 前端 React 应用
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── public/
│   │   ├── favicon.ico
│   │   └── images/                 # 静态图片资源
│   │       ├── logo.svg
│   │       └── default-avatar.png
│   ├── src/
│   │   ├── main.tsx                # 入口
│   │   ├── App.tsx                 # 根组件 + 路由
│   │   ├── vite-env.d.ts
│   │   │
│   │   ├── api/                    # API 请求层
│   │   │   ├── request.ts          # axios 实例封装（拦截器等）
│   │   │   ├── auth.ts             # 认证相关 API
│   │   │   ├── pet.ts              # 宠物 API
│   │   │   ├── service.ts          # 服务 API
│   │   │   ├── booking.ts          # 预约 API
│   │   │   ├── payment.ts          # 支付 API
│   │   │   ├── review.ts           # 评价 API
│   │   │   ├── message.ts          # 消息 API
│   │   │   └── user.ts             # 用户 API
│   │   │
│   │   ├── assets/                 # 样式/资源
│   │   │   ├── styles/
│   │   │   │   ├── reset.css
│   │   │   │   ├── variables.css   # CSS 变量
│   │   │   │   └── global.css      # 全局样式
│   │   │   └── icons/              # SVG 图标
│   │   │
│   │   ├── components/             # 通用组件
│   │   │   ├── common/             # 基础 UI 组件
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Loading/
│   │   │   │   ├── Empty/
│   │   │   │   ├── ErrorBoundary/
│   │   │   │   ├── ImageUploader/
│   │   │   │   └── Pagination/
│   │   │   ├── layout/             # 布局组件
│   │   │   │   ├── Header/
│   │   │   │   ├── Footer/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── MainLayout/     # 通用页面布局
│   │   │   │   └── AdminLayout/    # 后台管理布局
│   │   │   ├── pet/                # 宠物相关组件
│   │   │   │   ├── PetCard/
│   │   │   │   ├── PetAvatar/
│   │   │   │   ├── PetForm/
│   │   │   │   └── PetSelector/
│   │   │   ├── service/            # 服务相关组件
│   │   │   │   ├── ServiceCard/
│   │   │   │   ├── ServiceList/
│   │   │   │   └── ServiceFilter/
│   │   │   ├── booking/            # 预约相关组件
│   │   │   │   ├── BookingCard/
│   │   │   │   ├── BookingCalendar/
│   │   │   │   ├── BookingTimeline/
│   │   │   │   └── BookingForm/
│   │   │   ├── review/             # 评价组件
│   │   │   │   ├── ReviewCard/
│   │   │   │   ├── StarRating/
│   │   │   │   └── ReviewForm/
│   │   │   ├── chat/               # 即时通讯组件
│   │   │   │   ├── ChatWindow/
│   │   │   │   ├── MessageBubble/
│   │   │   │   └── ChatList/
│   │   │   └── map/                # 地图组件
│   │   │       ├── ServiceAreaMap/
│   │   │       └── LocationPicker/
│   │   │
│   │   ├── hooks/                  # 自定义 hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePagination.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useIntersectionObserver.ts
│   │   │   └── useWebSocket.ts
│   │   │
│   │   ├── pages/                  # 页面（按路由）
│   │   │   ├── Home/               # 首页
│   │   │   │   ├── index.tsx
│   │   │   │   └── components/     # 首页独有组件
│   │   │   │       ├── HeroBanner/
│   │   │   │       ├── FeaturedServices/
│   │   │   │       ├── HowItWorks/
│   │   │   │       └── Testimonials/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Services/           # 服务列表/详情
│   │   │   │   ├── index.tsx       # 服务列表页
│   │   │   │   └── [id].tsx        # 服务详情页
│   │   │   ├── Booking/            # 预约流程
│   │   │   │   ├── NewBooking.tsx  # 新建预约
│   │   │   │   └── Detail.tsx      # 预约详情
│   │   │   ├── Pets/               # 宠物管理
│   │   │   │   ├── index.tsx       # 我的宠物列表
│   │   │   │   ├── NewPet.tsx      # 添加宠物
│   │   │   │   └── [id].tsx        # 编辑宠物
│   │   │   ├── User/               # 用户中心
│   │   │   │   ├── Profile.tsx     # 个人资料
│   │   │   │   ├── Orders.tsx      # 我的订单
│   │   │   │   ├── Addresses.tsx   # 地址管理
│   │   │   │   └── Settings.tsx    # 账号设置
│   │   │   ├── Sitter/             # 宠物看护/服务者
│   │   │   │   ├── Dashboard.tsx   # 服务者工作台
│   │   │   │   ├── Schedule.tsx    # 日程管理
│   │   │   │   └── Earnings.tsx    # 收入统计
│   │   │   ├── Admin/              # 后台管理
│   │   │   │   ├── Dashboard.tsx   # 管理后台首页
│   │   │   │   ├── Users.tsx       # 用户管理
│   │   │   │   ├── Services.tsx    # 服务管理
│   │   │   │   ├── Orders.tsx      # 订单管理
│   │   │   │   ├── Reviews.tsx     # 评价管理
│   │   │   │   └── Settings.tsx    # 系统设置
│   │   │   ├── NotFound/           # 404
│   │   │   └── _app.tsx            # 页面包装器
│   │   │
│   │   ├── router/                 # 路由配置
│   │   │   ├── index.tsx           # 路由定义
│   │   │   ├── ProtectedRoute.tsx  # 鉴权守卫
│   │   │   └── RoleGuard.tsx       # 角色守卫
│   │   │
│   │   ├── store/                  # 状态管理 (Zustand/Redux)
│   │   │   ├── authStore.ts
│   │   │   ├── bookingStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── types/                  # TypeScript 类型定义
│   │   │   ├── user.ts
│   │   │   ├── pet.ts
│   │   │   ├── service.ts
│   │   │   ├── booking.ts
│   │   │   ├── payment.ts
│   │   │   ├── review.ts
│   │   │   ├── message.ts
│   │   │   └── api.ts              # 通用 API 响应类型
│   │   │
│   │   └── utils/                  # 工具函数
│   │       ├── format.ts           # 日期/金额格式化
│   │       ├── validators.ts       # 表单校验规则
│   │       ├── constants.ts        # 常量枚举
│   │       └── helpers.ts          # 通用辅助函数
│   │
│   └── __tests__/                  # 前端测试
│       ├── components/
│       └── pages/
│
├── server/                         # 后端 Node.js 服务
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   ├── src/
│   │   ├── index.ts                # 服务入口
│   │   ├── app.ts                  # Express 应用配置
│   │   │
│   │   ├── config/                 # 配置
│   │   │   ├── index.ts            # 配置聚合
│   │   │   ├── database.ts         # 数据库连接 (Prisma/TypeORM)
│   │   │   ├── redis.ts            # Redis 配置
│   │   │   └── logger.ts           # 日志配置
│   │   │
│   │   ├── modules/                # 业务模块（按领域拆分）
│   │   │   ├── auth/               # 认证模块
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.dto.ts         # 请求/响应 DTO
│   │   │   │   ├── auth.validation.ts  # 参数校验 (Joi/Zod)
│   │   │   │   └── strategies/         # 登录策略
│   │   │   │       ├── local.strategy.ts
│   │   │   │       ├── jwt.strategy.ts
│   │   │   │       └── oauth.strategy.ts
│   │   │   ├── user/               # 用户模块
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── user.dto.ts
│   │   │   │   └── user.validation.ts
│   │   │   ├── pet/                # 宠物模块
│   │   │   │   ├── pet.controller.ts
│   │   │   │   ├── pet.service.ts
│   │   │   │   ├── pet.routes.ts
│   │   │   │   ├── pet.dto.ts
│   │   │   │   └── pet.validation.ts
│   │   │   ├── service/            # 服务模块
│   │   │   │   ├── service.controller.ts
│   │   │   │   ├── service.service.ts
│   │   │   │   ├── service.routes.ts
│   │   │   │   ├── service.dto.ts
│   │   │   │   └── service.validation.ts
│   │   │   ├── booking/            # 预约模块（核心）
│   │   │   │   ├── booking.controller.ts
│   │   │   │   ├── booking.service.ts
│   │   │   │   ├── booking.routes.ts
│   │   │   │   ├── booking.dto.ts
│   │   │   │   ├── booking.validation.ts
│   │   │   │   └── booking.gateway.ts    # WebSocket 实时状态推送
│   │   │   ├── payment/            # 支付模块
│   │   │   │   ├── payment.controller.ts
│   │   │   │   ├── payment.service.ts
│   │   │   │   ├── payment.routes.ts
│   │   │   │   ├── payment.dto.ts
│   │   │   │   └── providers/           # 支付渠道
│   │   │   │       ├── wechat.ts
│   │   │   │       ├── alipay.ts
│   │   │   │       └── stripe.ts
│   │   │   ├── review/             # 评价模块
│   │   │   │   ├── review.controller.ts
│   │   │   │   ├── review.service.ts
│   │   │   │   ├── review.routes.ts
│   │   │   │   ├── review.dto.ts
│   │   │   │   └── review.validation.ts
│   │   │   ├── message/            # 消息/IM 模块
│   │   │   │   ├── message.controller.ts
│   │   │   │   ├── message.service.ts
│   │   │   │   ├── message.routes.ts
│   │   │   │   ├── message.dto.ts
│   │   │   │   └── message.gateway.ts
│   │   │   ├── notification/       # 通知模块
│   │   │   │   ├── notification.controller.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   ├── notification.routes.ts
│   │   │   │   ├── notification.dto.ts
│   │   │   │   └── channels/            # 通知渠道
│   │   │   │       ├── email.ts
│   │   │   │       ├── sms.ts
│   │   │   │       └── push.ts
│   │   │   ├── address/            # 地址模块
│   │   │   │   ├── address.controller.ts
│   │   │   │   ├── address.service.ts
│   │   │   │   ├── address.routes.ts
│   │   │   │   └── address.dto.ts
│   │   │   ├── upload/             # 文件上传模块
│   │   │   │   ├── upload.controller.ts
│   │   │   │   ├── upload.service.ts
│   │   │   │   └── upload.routes.ts
│   │   │   └── admin/              # 管理后台模块
│   │   │       ├── admin.controller.ts
│   │   │       ├── admin.service.ts
│   │   │       └── admin.routes.ts
│   │   │
│   │   ├── common/                 # 公共基础设施
│   │   │   ├── middleware/              # 中间件
│   │   │   │   ├── auth.middleware.ts    # JWT 鉴权
│   │   │   │   ├── role.middleware.ts    # 角色校验
│   │   │   │   ├── validate.middleware.ts # 参数校验
│   │   │   │   ├── rate-limit.middleware.ts
│   │   │   │   ├── error-handler.middleware.ts
│   │   │   │   └── request-logger.middleware.ts
│   │   │   ├── guards/                  # 守卫
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── filters/                 # 异常过滤器
│   │   │   │   ├── http-exception.filter.ts
│   │   │   │   └── ws-exception.filter.ts
│   │   │   ├── interceptors/            # 拦截器
│   │   │   │   ├── transform.interceptor.ts  # 响应格式统一
│   │   │   │   └── logging.interceptor.ts
│   │   │   ├── decorators/              # 自定义装饰器
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   ├── pipes/                   # 管道（参数转换）
│   │   │   │   ├── parse-int.pipe.ts
│   │   │   │   └── validation.pipe.ts
│   │   │   ├── exceptions/              # 自定义异常
│   │   │   │   ├── business.exception.ts
│   │   │   │   └── unauthorized.exception.ts
│   │   │   ├── enums/                   # 枚举常量
│   │   │   │   ├── role.enum.ts
│   │   │   │   ├── booking-status.enum.ts
│   │   │   │   ├── service-type.enum.ts
│   │   │   │   └── payment-status.enum.ts
│   │   │   └── helpers/                 # 辅助函数
│   │   │       ├── pagination.ts
│   │   │       ├── date.ts
│   │   │       └── crypto.ts
│   │   │
│   │   ├── database/               # 数据库相关
│   │   │   ├── prisma/             # Prisma ORM
│   │   │   │   ├── schema.prisma   # 数据模型定义
│   │   │   │   ├── migrations/     # 迁移文件
│   │   │   │   └── seed.ts         # 种子数据
│   │   │   └── repositories/       # 数据访问层（可选）
│   │   │       ├── user.repository.ts
│   │   │       └── booking.repository.ts
│   │   │
│   │   ├── tasks/                  # 定时任务
│   │   │   ├── cancel-expired-bookings.task.ts
│   │   │   └── send-reminders.task.ts
│   │   │
│   │   └── shared/                 # 跨模块共享
│   │       ├── interfaces/
│   │       ├── types/
│   │       └── constants/
│   │
│   ├── uploads/                    # 上传文件存储（本地开发）
│   └── __tests__/                  # 后端测试
│       ├── unit/
│       │   ├── services/
│       │   └── controllers/
│       └── integration/
│           ├── auth.test.ts
│           └── booking.test.ts
│
├── shared/                         # 前后端共享类型/工具
│   ├── package.json
│   ├── tsconfig.json
│   ├── types/
│   │   ├── index.ts
│   │   ├── common.ts               # 通用类型
│   │   ├── api-response.ts          # API 统一响应格式
│   │   └── enums.ts                 # 枚举
│   └── utils/
│       ├── validators.ts
│       └── constants.ts
│
├── docker/                         # Docker 配置
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   ├── docker-compose.yml
│   └── nginx/
│       └── nginx.conf
│
├── scripts/                        # 开发脚本
│   ├── setup.sh
│   ├── seed.ts
│   └── deploy.sh
│
└── docs/                           # 项目文档
    ├── api/                        # API 文档
    │   ├── auth.md
    │   ├── booking.md
    │   └── payment.md
    ├── database.md                 # 数据库设计
    └── architecture.md             # 架构说明
```
