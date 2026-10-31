/**
 * Supabase 连接配置（二选一）：
 *  方式一：直接把下面两个常量填好，随代码一起发布；
 *  方式二：留空，在应用「设置 → 云端同步」里手动输入（保存在浏览器本地）。
 *
 * 说明：anon public key 设计上是公开的（前端必然可见），数据安全由 Supabase
 * 行级安全策略（RLS）保证，不是机密；请勿使用 service_role key。
 */
export const DEFAULT_SUPABASE_URL = ''
export const DEFAULT_SUPABASE_ANON_KEY = ''
