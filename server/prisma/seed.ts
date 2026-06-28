import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.adminUser.deleteMany()
  await prisma.systemConfig.deleteMany()
  await prisma.faq.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversationParticipant.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.review.deleteMany()
  await prisma.serviceSession.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderTimeline.deleteMany()
  await prisma.orderPet.deleteMany()
  await prisma.orderService.deleteMany()
  await prisma.order.deleteMany()
  await prisma.service.deleteMany()
  await prisma.sitterCert.deleteMany()
  await prisma.sitterArea.deleteMany()
  await prisma.sitterProfile.deleteMany()
  await prisma.address.deleteMany()
  await prisma.pet.deleteMany()
  await prisma.userNotificationSettings.deleteMany()
  await prisma.user.deleteMany()

  const password = hashSync('123456', 10)

  // Admin
  const admin = await prisma.user.create({
    data: { account: 'admin', phone: '13800000000', password_hash: password, name: '管理员', role: 'admin', status: 'active' },
  })
  await prisma.adminUser.create({ data: { user_id: admin.id, role: 'admin' } })

  // Sitter 1
  const sitter1 = await prisma.user.create({
    data: { account: 'S000001', phone: '13800000001', password_hash: password, name: '张阿姨', role: 'sitter', status: 'active', sitter_status: 'approved', avatar: '👩' },
  })
  const sp1 = await prisma.sitterProfile.create({
    data: { user_id: sitter1.id, level: 3, bio: '10年宠物护理经验，温柔耐心', city: '北京', rating: 4.9, total_orders: 287, balance: 2870, status: 'approved', online: true },
  })
  await prisma.service.createMany({
    data: [
      { sitter_id: sp1.id, name: '遛狗 30分钟', price: 49, duration: 30, description: '小区内遛狗，保证运动量', category: 'walk', icon: '🐕' },
      { sitter_id: sp1.id, name: '遛狗 60分钟', price: 79, duration: 60, description: '公园散步+玩耍', category: 'walk', icon: '🐕' },
      { sitter_id: sp1.id, name: '上门喂食', price: 39, duration: 30, description: '喂食+换水+清洁', category: 'feed', icon: '🍽️' },
    ],
  })
  await prisma.sitterCert.createMany({
    data: [
      { sitter_id: sp1.id, label: '身份证实名认证', required: true, status: 'verified', file_url: 'id.jpg' },
      { sitter_id: sp1.id, label: '宠物护理培训证书', required: true, status: 'verified', file_url: 'cert.jpg' },
      { sitter_id: sp1.id, label: '动物急救证', required: false, status: 'verified', file_url: 'firstaid.jpg' },
    ],
  })
  await prisma.sitterArea.createMany({
    data: [
      { sitter_id: sp1.id, area: '望京' },
      { sitter_id: sp1.id, area: '三元桥' },
      { sitter_id: sp1.id, area: '亮马桥' },
    ],
  })

  // Sitter 2
  const sitter2 = await prisma.user.create({
    data: { account: 'S000002', phone: '13800000002', password_hash: password, name: 'test_sitter2', role: 'sitter', status: 'active', sitter_status: 'approved', avatar: '🧑' },
  })
  const sp2 = await prisma.sitterProfile.create({
    data: { user_id: sitter2.id, level: 2, bio: '热爱动物，有3年养宠经验', city: '北京', rating: 4.7, total_orders: 156, balance: 1560, status: 'approved', online: true },
  })
  await prisma.service.createMany({
    data: [
      { sitter_id: sp2.id, name: '遛狗 30分钟', price: 39, duration: 30, description: '认真负责', category: 'walk', icon: '🐕' },
      { sitter_id: sp2.id, name: '上门喂猫', price: 35, duration: 30, description: '猫咪专属服务', category: 'feed', icon: '🐈' },
    ],
  })
  await prisma.sitterArea.createMany({
    data: [
      { sitter_id: sp2.id, area: '西二旗' },
      { sitter_id: sp2.id, area: '上地' },
    ],
  })

  // Owner 1
  const owner = await prisma.user.create({
    data: { account: 'O000001', phone: '13800000003', password_hash: password, name: 'test_owner', role: 'owner', status: 'active', avatar: '🧑' },
  })
  await prisma.pet.createMany({
    data: [
      { owner_id: owner.id, name: '豆豆', type: 'dog', breed: '金毛', age: '3岁', weight: '28kg', avatar: '🐕' },
      { owner_id: owner.id, name: '咪咪', type: 'cat', breed: '英短', age: '2岁', weight: '4kg', avatar: '🐈' },
    ],
  })
  await prisma.address.createMany({
    data: [
      { user_id: owner.id, name: 'test_owner', phone: '13800000003', tag: 'home', address: '北京市朝阳区望京SOHO T3 1808', is_default: true },
      { user_id: owner.id, name: 'test_owner', phone: '13800000003', tag: 'company', address: '北京市海淀区中关村软件园A座 1206', is_default: false },
    ],
  })

  // Additional users from test-accounts.txt
  const zhangayi = await prisma.user.create({
    data: { account: 'Z000001', phone: '13800000004', password_hash: password, name: 'zhangayi', role: 'owner', status: 'active', avatar: '👩' },
  })
  await prisma.pet.createMany({
    data: [
      { owner_id: zhangayi.id, name: '可乐', type: 'dog', breed: '柯基', age: '2岁', weight: '12kg', avatar: '🐕' },
    ],
  })
  await prisma.address.create({
    data: { user_id: zhangayi.id, name: 'zhangayi', phone: '13800000004', tag: 'home', address: '北京市海淀区华润橡树湾5-2-801', is_default: true },
  })

  const liming = await prisma.user.create({
    data: { account: 'L000001', phone: '13800000005', password_hash: password, name: 'liming', role: 'sitter', status: 'active', sitter_status: 'approved', avatar: '🧑' },
  })
  const sp3 = await prisma.sitterProfile.create({
    data: { user_id: liming.id, level: 2, bio: '专业宠物保姆，服务细心周到', city: '北京', rating: 4.8, total_orders: 89, balance: 890, status: 'approved', online: true },
  })
  await prisma.service.createMany({
    data: [
      { sitter_id: sp3.id, name: '遛狗 30分钟', price: 45, duration: 30, description: '专业遛狗', category: 'walk', icon: '🐕' },
      { sitter_id: sp3.id, name: '上门喂养', price: 40, duration: 30, description: '不限宠物类型', category: 'feed', icon: '🍽️' },
    ],
  })

  const wang = await prisma.user.create({
    data: { account: 'W000001', phone: '13800000006', password_hash: password, name: 'wang', role: 'sitter', status: 'active', sitter_status: 'pending', avatar: '👩' },
  })
  const sp4 = await prisma.sitterProfile.create({
    data: { user_id: wang.id, level: 1, bio: '新手服务者，请多关照', city: '北京', rating: 0, total_orders: 0, status: 'pending', online: false },
  })
  await prisma.service.createMany({
    data: [
      { sitter_id: sp4.id, name: '遛狗 30分钟', price: 35, duration: 30, description: '耐心细心', category: 'walk', icon: '🐕' },
    ],
  })

  // System config
  await prisma.systemConfig.create({
    data: { commission_rate: 15, cancel_free_hours: 24, accept_timeout: 15, max_distance: 10, min_payout: 50, service_radius: 0.5, auto_confirm: true, sms_notify: true, new_sitter_open: true },
  })

  // Banners
  await prisma.banner.createMany({
    data: [
      { title: '新用户首单优惠', image_url: '', emoji: '🎉', link: '/register', sort: 1, status: 'active' },
      { title: '专业宠物保姆', image_url: '', emoji: '🐾', link: '/sitters', sort: 2, status: 'active' },
      { title: '24小时在线服务', image_url: '', emoji: '🕐', link: '/guarantee/1', sort: 3, status: 'active' },
    ],
  })

  // FAQs
  await prisma.faq.createMany({
    data: [
      { question: '如何预约服务？', answer: '注册登录后，浏览服务者列表，选择合适的服务者即可预约。', category: 'general', sort: 1, status: 'published' },
      { question: '如何取消订单？', answer: '在订单详情页可以取消订单，请提前24小时取消以免产生费用。', category: 'general', sort: 2, status: 'published' },
      { question: '如何成为服务者？', answer: '注册后申请成为服务者，提交相关资料审核通过即可。', category: 'sitter', sort: 1, status: 'published' },
    ],
  })

  // Announcements
  await prisma.announcement.createMany({
    data: [
      { title: '平台升级通知', content: '我们将于本周五凌晨进行系统升级', status: 'published', pinned: true, author: '管理员' },
      { title: '春节服务安排', content: '春节期间正常提供服务', status: 'published', pinned: false, author: '管理员' },
    ],
  })

  console.log('Seed completed!')
  console.log('Test accounts:')
  console.log('  admin (admin/123456)')
  console.log('  test_sitter2 (sitter/123456)')
  console.log('  test_owner (owner/123456)')
  console.log('  zhangayi (owner/123456)')
  console.log('  liming (sitter/123456)')
  console.log('  wang (sitter/123456)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
