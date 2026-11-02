const { createClient } = require('@supabase/supabase-js');

// Service key client — bypasses RLS, used for all DB operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Anon key client — used for Supabase Auth sign-in
// Created lazily to ensure env vars are loaded
function getAuthClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
}

module.exports = {
  supabase,
  getAuthClient,

  // ─── ADMINS ───────────────────────────────────────────────
  async getAdminByEmail(email) {
    const { data, error } = await supabase.from('admins').select('*').eq('email', email.toLowerCase()).single();
    return { data, error };
  },

  async getAdminById(id) {
    const { data, error } = await supabase.from('admins').select('*').eq('id', id).single();
    return { data, error };
  },

  async updateAdminPassword(id, password_hash) {
    const { error } = await supabase.from('admins').update({ password_hash }).eq('id', id);
    return { error };
  },

  // ─── ARTICLES ─────────────────────────────────────────────
  async getPublishedArticles({ category, search, page = 1, limit = 12 } = {}) {
    let query = supabase
      .from('articles')
      .select('id,title,slug,introduction,featured_image_url,category,author,published_at', { count: 'exact' })
      .eq('status', 'published')
      .eq('hidden', false)
      .order('published_at', { ascending: false });
    if (category && category !== 'All') query = query.eq('category', category);
    if (search) query = query.or(`title.ilike.%${search}%,introduction.ilike.%${search}%`);
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);
    const { data, error, count } = await query;
    return { data, error, count };
  },

  async getArticleBySlug(slug) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('hidden', false)
      .single();
    return { data, error };
  },

  async getAllArticlesAdmin({ search, status, page = 1, limit = 20 } = {}) {
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    if (status && status !== 'all') query = query.eq('status', status);
    if (search) query = query.or(`title.ilike.%${search}%,category.ilike.%${search}%`);
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);
    const { data, error, count } = await query;
    return { data, error, count };
  },

  async getArticleByIdAdmin(id) {
    const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
    return { data, error };
  },

  async slugExists(slug, excludeId = null) {
    let query = supabase.from('articles').select('id').eq('slug', slug);
    if (excludeId) query = query.neq('id', excludeId);
    const { data } = await query;
    return data && data.length > 0;
  },

  async createArticle(data) {
    const { data: result, error } = await supabase.from('articles').insert([data]).select('*');
    return { data: result?.[0], error };
  },

  async updateArticle(id, data) {
    const { data: result, error } = await supabase.from('articles').update(data).eq('id', id).select('*');
    return { data: result?.[0], error };
  },

  async deleteArticle(id) {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    return { error };
  },

  // ─── CATEGORIES ───────────────────────────────────────────
  async getCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    return { data, error };
  },

  async createCategory(data) {
    const { data: result, error } = await supabase.from('categories').insert([data]).select('*');
    return { data: result?.[0], error };
  },

  async updateCategory(id, data) {
    const { data: result, error } = await supabase.from('categories').update(data).eq('id', id).select('*');
    return { data: result?.[0], error };
  },

  async deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    return { error };
  },

  // ─── SERVICES ─────────────────────────────────────────────
  async getActiveServices() {
    const { data, error } = await supabase
      .from('services').select('*').eq('is_active', true).order('display_order', { ascending: true });
    return { data, error };
  },

  async getServiceBySlug(slug) {
    const { data, error } = await supabase.from('services').select('*').eq('slug', slug).eq('is_active', true).single();
    return { data, error };
  },

  async getAllServicesAdmin() {
    const { data, error } = await supabase.from('services').select('*').order('display_order', { ascending: true });
    return { data, error };
  },

  async createService(data) {
    const { data: existing } = await supabase.from('services').select('display_order').order('display_order', { ascending: false }).limit(1);
    const display_order = existing?.length ? (existing[0].display_order || 0) + 1 : 0;
    const { data: result, error } = await supabase.from('services').insert([{ ...data, display_order }]).select('*');
    return { data: result?.[0], error };
  },

  async updateService(id, data) {
    const { data: result, error } = await supabase.from('services').update(data).eq('id', id).select('*');
    return { data: result?.[0], error };
  },

  async deleteService(id) {
    const { error } = await supabase.from('services').delete().eq('id', id);
    return { error };
  },

  // ─── CONTACT ENQUIRIES ────────────────────────────────────
  async createEnquiry(data) {
    const { data: result, error } = await supabase.from('contact_enquiries').insert([data]).select('*');
    return { data: result?.[0], error };
  },

  async getEnquiries({ status, search, page = 1, limit = 20 } = {}) {
    let query = supabase
      .from('contact_enquiries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    if (status && status !== 'All') query = query.eq('status', status);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,area_of_enquiry.ilike.%${search}%`);
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);
    const { data, error, count } = await query;
    return { data, error, count };
  },

  async updateEnquiryStatus(id, status) {
    const { data, error } = await supabase.from('contact_enquiries').update({ status }).eq('id', id).select('*');
    return { data: data?.[0], error };
  },

  async deleteEnquiry(id) {
    const { error } = await supabase.from('contact_enquiries').delete().eq('id', id);
    return { error };
  },

  // ─── DOCUMENT FOLDERS ─────────────────────────────────────
  async getFolders() {
    const { data, error } = await supabase.from('document_folders').select('*').order('created_at');
    return { data, error };
  },

  async createFolder(data) {
    const { data: result, error } = await supabase.from('document_folders').insert([data]).select('*');
    return { data: result?.[0], error };
  },

  async deleteFolder(id) {
    const { error } = await supabase.from('document_folders').delete().eq('id', id);
    return { error };
  },

  // ─── DOCUMENTS ────────────────────────────────────────────
  async getDocuments({ folder_id } = {}) {
    let query = supabase.from('documents').select('*').order('updated_at', { ascending: false });
    if (folder_id) query = query.eq('folder_id', folder_id);
    const { data, error } = await query;
    return { data, error };
  },

  async getDocumentById(id) {
    const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
    return { data, error };
  },

  async createDocument(data) {
    const { data: result, error } = await supabase.from('documents').insert([data]).select('*');
    return { data: result?.[0], error };
  },

  async updateDocument(id, data) {
    const { data: result, error } = await supabase.from('documents').update(data).eq('id', id).select('*');
    return { data: result?.[0], error };
  },

  async deleteDocument(id) {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    return { error };
  },

  // ─── UPLOADS ──────────────────────────────────────────────
  async uploadFile(buffer, path, mimetype) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'adqs-storage';
    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: mimetype,
      upsert: false,
    });
    if (error) return { url: null, error };
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  },

  async deleteFile(path) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'adqs-storage';
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return { error };
  },

  // ─── ANALYTICS ────────────────────────────────────────────
  async logPageView(path, referrer) {
    const { error } = await supabase.from('page_views').insert([{ path, referrer: referrer || null }]);
    return { error };
  },

  async logArticleClick(article_id) {
    const { error } = await supabase.from('article_clicks').insert([{ article_id }]);
    return { error };
  },

  async logServiceView(service_slug) {
    const { error } = await supabase.from('service_views').insert([{ service_slug }]);
    return { error };
  },

  async getAnalyticsSummary() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [pv, ac, sv, enq] = await Promise.all([
      supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', since),
      supabase.from('article_clicks').select('id', { count: 'exact', head: true }).gte('created_at', since),
      supabase.from('service_views').select('id', { count: 'exact', head: true }).gte('created_at', since),
      supabase.from('contact_enquiries').select('id', { count: 'exact', head: true }).gte('created_at', since),
    ]);
    return {
      pageViews:       pv.count  || 0,
      articleClicks:   ac.count  || 0,
      serviceViews:    sv.count  || 0,
      formSubmissions: enq.count || 0,
    };
  },

  async getTopArticles(limit = 5) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('article_clicks')
      .select('article_id, articles(title)')
      .gte('created_at', since);
    if (error || !data) return { data: [], error };
    const counts = {};
    data.forEach(({ article_id, articles }) => {
      if (!article_id) return;
      if (!counts[article_id]) counts[article_id] = { article_id, title: articles?.title || 'Unknown', clicks: 0 };
      counts[article_id].clicks++;
    });
    const sorted = Object.values(counts).sort((a, b) => b.clicks - a.clicks).slice(0, limit);
    return { data: sorted, error: null };
  },

  async getTopServices(limit = 6) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('service_views')
      .select('service_slug')
      .gte('created_at', since);
    if (error || !data) return { data: [], error };
    const counts = {};
    data.forEach(({ service_slug }) => {
      counts[service_slug] = (counts[service_slug] || 0) + 1;
    });
    const sorted = Object.entries(counts)
      .map(([service_slug, views]) => ({ service_slug, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
    return { data: sorted, error: null };
  },
};
