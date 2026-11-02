const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { GoogleAuth } = require('google-auth-library');
const db = require('../models/supabaseModel');
const path = require('path');

let analyticsClient = null;

function getAnalyticsClient() {
  if (analyticsClient) return analyticsClient;
  try {
    const serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || './service.json'));
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });
    analyticsClient = new BetaAnalyticsDataClient({ auth });
  } catch (err) {
    console.error('GA4 client init failed:', err.message);
  }
  return analyticsClient;
}

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;

// ── Public tracking (Supabase) ────────────────────────────────

exports.logPageView = async (req, res) => {
  try {
    const { path, referrer } = req.body;
    if (!path) return res.status(400).json({ status: 'error', message: 'Path required.' });
    await db.logPageView(path, referrer);
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.logArticleClick = async (req, res) => {
  try {
    const { article_id } = req.body;
    if (!article_id) return res.status(400).json({ status: 'error', message: 'article_id required.' });
    await db.logArticleClick(article_id);
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.logServiceView = async (req, res) => {
  try {
    const { service_slug } = req.body;
    if (!service_slug) return res.status(400).json({ status: 'error', message: 'service_slug required.' });
    await db.logServiceView(service_slug);
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

// ── Admin analytics (GA4 Data API) ───────────────────────────

exports.getSummary = async (req, res) => {
  try {
    const client = getAnalyticsClient();
    if (!client) return res.status(503).json({ status: 'error', message: 'Analytics not configured.' });

    const [response] = await client.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
      ],
    });

    const row = response.rows?.[0]?.metricValues ?? [];
    const data = {
      pageViews:   parseInt(row[0]?.value ?? 0),
      activeUsers: parseInt(row[1]?.value ?? 0),
      sessions:    parseInt(row[2]?.value ?? 0),
      bounceRate:  parseFloat(row[3]?.value ?? 0).toFixed(1),
    };

    // Also get form submissions from Supabase
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: formSubmissions } = await db.supabase
      .from('contact_enquiries')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since);

    res.json({ status: 'success', data: { ...data, formSubmissions: formSubmissions || 0 } });
  } catch (err) {
    console.error('GA4 summary error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch analytics.' });
  }
};

exports.getTopArticles = async (req, res) => {
  try {
    const client = getAnalyticsClient();
    if (!client) return res.status(503).json({ status: 'error', message: 'Analytics not configured.' });

    const [response] = await client.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { matchType: 'BEGINS_WITH', value: '/insights/' },
        },
      },
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 5,
    });

    const data = (response.rows ?? []).map((row) => ({
      path:   row.dimensionValues[0].value,
      title:  row.dimensionValues[1].value,
      views:  parseInt(row.metricValues[0].value),
    }));

    res.json({ status: 'success', data });
  } catch (err) {
    console.error('GA4 top articles error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch top articles.' });
  }
};

exports.getTopServices = async (req, res) => {
  try {
    const client = getAnalyticsClient();
    if (!client) return res.status(503).json({ status: 'error', message: 'Analytics not configured.' });

    const [response] = await client.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { matchType: 'BEGINS_WITH', value: '/services/' },
        },
      },
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 6,
    });

    const data = (response.rows ?? []).map((row) => ({
      path:  row.dimensionValues[0].value,
      title: row.dimensionValues[1].value,
      views: parseInt(row.metricValues[0].value),
    }));

    res.json({ status: 'success', data });
  } catch (err) {
    console.error('GA4 top services error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch top services.' });
  }
};
