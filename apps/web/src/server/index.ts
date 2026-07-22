import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from './types'

// Route imports
import media from './routes/media'
import academicWorkspace from './routes/academicWorkspace'
import assessmentEngine from './routes/assessmentEngine'
import disciplinaryEngine from './routes/disciplinaryEngine'
import promotionEngine from './routes/promotionEngine'
import authRoutes from './routes/auth'
import settingsRoute from './routes/settings'

// Admin route imports
import peopleAdmin from './routes/admin/people'
import classesAdmin from './routes/admin/classes'
import subjectsAdmin from './routes/admin/subjects'
import violationsAdmin from './routes/admin/violations'
import auditLogsAdmin from './routes/admin/audit-logs'
import dashboardAdmin from './routes/admin/dashboard'
import onboardingAdmin from './routes/admin/onboarding'
import { usersAdmin } from './routes/admin/users'
import roomsAdmin from './routes/admin/rooms'

// Mustahiq route imports
import classMustahiq from './routes/mustahiq/class'
import scoresMustahiq from './routes/mustahiq/scores'
import attendanceMustahiq from './routes/mustahiq/attendance'
import mustahiqDashboard from './routes/mustahiq/dashboard'

// Guardian route imports
import guardianPortal from './routes/guardian/dashboard'

// Keamanan route imports
import keamananDashboard from './routes/keamanan/dashboard'

// Middleware imports
import { requireAuth } from './middlewares/authMiddleware'
import { auditLogMiddleware } from './middlewares/auditLogMiddleware'

const app = new Hono<AppEnv>()

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

// 0. Environment Bindings Injection (Mocking Cloudflare env to process.env)
const kvMock = new Map<string, string>();
app.use('*', async (c, next) => {
  c.env = {
    ENVIRONMENT: process.env.NODE_ENV || 'development',
    CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    SESSION_KV: {
      get: async (key: string) => kvMock.get(key) || null,
      put: async (key: string, value: string) => kvMock.set(key, value),
      delete: async (key: string) => kvMock.delete(key),
    } as any,
  } as any;
  await next();
});

// 1. CORS — Hanya izinkan domain produksi + dev
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return 'https://m.p3hm.my.id';
    // Hanya izinkan domain utama dan localhost
    if (origin === 'https://m.p3hm.my.id' || origin === 'http://localhost:3000') {
      return origin;
    }
    return 'https://m.p3hm.my.id';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// 2. Error Handler
app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`, err.stack)
  return c.json({
    status: "Server Error",
    message: err.message
  }, 500)
})

// ============================================================
// PUBLIC ROUTES (Tanpa Auth)
// ============================================================
app.get('/', (c) => {
  return c.json({
    name: 'MPHM v4.0 API Gateway',
    version: '4.0.0',
    status: 'running',
    environment: c.env.ENVIRONMENT || 'development',
  })
})

// Auth routes (login/logout/me) — Sebagian public, sebagian protected
app.route('/api/auth', authRoutes)

// Settings route - GET is public, PUT is protected inside the route itself
app.route('/api/settings', settingsRoute)

// ============================================================
// PROTECTED ROUTES (Semua memerlukan auth)
// ============================================================

// Global auth middleware untuk semua route /api/* kecuali /api/auth
app.use('/api/media/*', requireAuth)
app.use('/api/academic/*', requireAuth)
app.use('/api/assessment/*', requireAuth)
app.use('/api/disciplinary/*', requireAuth)
app.use('/api/promotion/*', requireAuth)
app.use('/api/admin/*', requireAuth)
app.use('/api/mustahiq/*', requireAuth)
app.use('/api/guardian/*', requireAuth)
app.use('/api/keamanan/*', requireAuth)

// Global audit log middleware untuk semua route yang mengubah data
app.use('/api/media/*', auditLogMiddleware('MEDIA_LIBRARY'))
app.use('/api/academic/*', auditLogMiddleware('ACADEMIC_WORKSPACE'))
app.use('/api/assessment/*', auditLogMiddleware('ASSESSMENT_ENGINE'))
app.use('/api/disciplinary/*', auditLogMiddleware('DISCIPLINARY_ENGINE'))
app.use('/api/promotion/*', auditLogMiddleware('PROMOTION_ENGINE'))
app.use('/api/admin/people/*', auditLogMiddleware('ADMIN_PEOPLE'))
app.use('/api/admin/classes/*', auditLogMiddleware('ADMIN_CLASSES'))
app.use('/api/admin/subjects/*', auditLogMiddleware('ADMIN_SUBJECTS'))
app.use('/api/admin/violations/*', auditLogMiddleware('ADMIN_VIOLATIONS'))
app.use('/api/admin/users/*', auditLogMiddleware('ADMIN_USERS'))
app.use('/api/admin/rooms/*', auditLogMiddleware('ADMIN_ROOMS'))
app.use('/api/mustahiq/scores/*', auditLogMiddleware('MUSTAHIQ_SCORES'))
app.use('/api/mustahiq/attendance/*', auditLogMiddleware('MUSTAHIQ_ATTENDANCE'))

// Mendaftarkan modul route
app.route('/api/media', media)
app.route('/api/academic', academicWorkspace)
app.route('/api/assessment', assessmentEngine)
app.route('/api/disciplinary', disciplinaryEngine)
app.route('/api/promotion', promotionEngine)

// Mendaftarkan modul admin
app.route('/api/admin/people', peopleAdmin)
app.route('/api/admin/classes', classesAdmin)
app.route('/api/admin/subjects', subjectsAdmin)
app.route('/api/admin/violations', violationsAdmin)
app.route('/api/admin/audit-logs', auditLogsAdmin)
app.route('/api/admin/dashboard', dashboardAdmin)
app.route('/api/admin/onboarding', onboardingAdmin)
app.route('/api/admin/users', usersAdmin)
app.route('/api/admin/rooms', roomsAdmin)

// Mendaftarkan modul mustahiq
app.route('/api/mustahiq/class', classMustahiq)
app.route('/api/mustahiq/scores', scoresMustahiq)
app.route('/api/mustahiq/attendance', attendanceMustahiq)
app.route('/api/mustahiq/dashboard', mustahiqDashboard)

// Mendaftarkan modul guardian
app.route('/api/guardian', guardianPortal)

// Mendaftarkan modul keamanan
app.route('/api/keamanan/dashboard', keamananDashboard)

export default app
