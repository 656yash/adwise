const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const DB_PATH = path.join(__dirname, 'kpi_dashboard.db');

// Initialize database connection
let db;
function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        resolve();
      }
    });
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'KPI Dashboard API is running' });
});

// Dashboard summary endpoint
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    // Get summary metrics
    const summaryQuery = `
      SELECT
        COUNT(DISTINCT campaign) as total_campaigns,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(spent) as total_spent,
        AVG(roi) as avg_roi,
        AVG(roas) as avg_roas,
        AVG(cpc) as avg_cpc,
        AVG(ctr) as avg_ctr
      FROM kpi_data
    `;

    // Get platform metrics
    const platformQuery = `
      SELECT
        platform,
        COUNT(*) as campaigns,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(spent) as total_spent,
        AVG(roi) as avg_roi,
        AVG(roas) as avg_roas,
        AVG(cpc) as avg_cpc,
        AVG(ctr) as avg_ctr
      FROM kpi_data
      GROUP BY platform
    `;

    // Get recent campaigns
    const recentQuery = `
      SELECT * FROM kpi_data
      ORDER BY date DESC
      LIMIT 5
    `;

    const [summaryResult, platformResult, recentResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.get(summaryQuery, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }),
      new Promise((resolve, reject) => {
        db.all(platformQuery, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        db.all(recentQuery, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      })
    ]);

    res.json({
      summary: summaryResult,
      platforms: platformResult,
      recent_campaigns: recentResult
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// KPI data endpoint
app.get('/api/kpi/data', async (req, res) => {
  try {
    const { platform, campaign, date_from, date_to, sort_by = 'date', sort_order = 'DESC' } = req.query;

    let query = 'SELECT * FROM kpi_data WHERE 1=1';
    const params = [];

    if (platform && platform !== 'all') {
      query += ' AND platform = ?';
      params.push(platform);
    }

    if (campaign) {
      query += ' AND campaign = ?';
      params.push(campaign);
    }

    if (date_from) {
      query += ' AND date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND date <= ?';
      params.push(date_to);
    }

    query += ` ORDER BY ${sort_by} ${sort_order}`;

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching KPI data:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        // Get platform and campaign metrics
        const platformMetricsQuery = `
          SELECT
            platform,
            COUNT(*) as campaigns,
            SUM(impressions) as total_impressions,
            SUM(clicks) as total_clicks,
            SUM(conversions) as total_conversions,
            SUM(spent) as total_spent,
            AVG(roi) as avg_roi,
            AVG(roas) as avg_roas
          FROM kpi_data
          GROUP BY platform
        `;

        const campaignMetricsQuery = `
          SELECT
            campaign,
            platform,
            SUM(impressions) as total_impressions,
            SUM(clicks) as total_clicks,
            SUM(conversions) as total_conversions,
            SUM(spent) as total_spent,
            AVG(roi) as avg_roi,
            AVG(roas) as avg_roas
          FROM kpi_data
          GROUP BY campaign, platform
        `;

        // Execute additional queries for metrics
        db.all(platformMetricsQuery, (err, platformMetrics) => {
          if (err) {
            console.error('Error fetching platform metrics:', err);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            db.all(campaignMetricsQuery, (err, campaignMetrics) => {
              if (err) {
                console.error('Error fetching campaign metrics:', err);
                res.status(500).json({ error: 'Internal server error' });
              } else {
                res.json({
                  kpi_data: rows,
                  platform_metrics: platformMetrics,
                  campaign_metrics: campaignMetrics,
                  filters_applied: { platform, campaign, date_from, date_to }
                });
              }
            });
          }
        });
      }
    });
  } catch (error) {
    console.error('Error in KPI data endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Filter options endpoint
app.get('/api/filters/options', async (req, res) => {
  try {
    const platformQuery = 'SELECT DISTINCT platform FROM kpi_data ORDER BY platform';
    const campaignQuery = 'SELECT DISTINCT campaign FROM kpi_data ORDER BY campaign';
    const dateQuery = 'SELECT MIN(date) as min_date, MAX(date) as max_date FROM kpi_data';

    const [platforms, campaigns, dateRange] = await Promise.all([
      new Promise((resolve, reject) => {
        db.all(platformQuery, (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => row.platform));
        });
      }),
      new Promise((resolve, reject) => {
        db.all(campaignQuery, (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => row.campaign));
        });
      }),
      new Promise((resolve, reject) => {
        db.get(dateQuery, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      })
    ]);

    res.json({
      platforms,
      campaigns,
      date_range: dateRange
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Detailed data endpoint
app.get('/api/data/detailed', async (req, res) => {
  try {
    const { page = 1, per_page = 20, platform, campaign, date_from, date_to } = req.query;

    let query = 'SELECT * FROM kpi_data WHERE 1=1';
    const params = [];
    const offset = (page - 1) * per_page;

    if (platform && platform !== 'all') {
      query += ' AND platform = ?';
      params.push(platform);
    }

    if (campaign) {
      query += ' AND campaign = ?';
      params.push(campaign);
    }

    if (date_from) {
      query += ' AND date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND date <= ?';
      params.push(date_to);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const totalCount = await new Promise((resolve, reject) => {
      db.get(countQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Get paginated data
    query += ` LIMIT ? OFFSET ?`;
    params.push(per_page, offset);

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching detailed data:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        const totalPages = Math.ceil(totalCount / per_page);
        res.json({
          data: rows,
          pagination: {
            page: parseInt(page),
            per_page: parseInt(per_page),
            total_count: totalCount,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          },
          filters_applied: { platform, campaign, date_from, date_to }
        });
      }
    });
  } catch (error) {
    console.error('Error in detailed data endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics trends endpoint
app.get('/api/analytics/trends', async (req, res) => {
  try {
    // Daily trends
    const dailyQuery = `
      SELECT
        date,
        SUM(impressions) as daily_impressions,
        SUM(clicks) as daily_clicks,
        SUM(conversions) as daily_conversions,
        SUM(spent) as daily_spent,
        AVG(roi) as daily_roi,
        AVG(roas) as daily_roas
      FROM kpi_data
      GROUP BY date
      ORDER BY date
    `;

    // Platform trends
    const platformQuery = `
      SELECT
        platform,
        date,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(conversions) as conversions,
        SUM(spent) as spent,
        AVG(roi) as roi
      FROM kpi_data
      GROUP BY platform, date
      ORDER BY platform, date
    `;

    const [dailyTrends, platformTrends] = await Promise.all([
      new Promise((resolve, reject) => {
        db.all(dailyQuery, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        db.all(platformQuery, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      })
    ]);

    res.json({
      daily_trends: dailyTrends,
      platform_trends: platformTrends
    });
  } catch (error) {
    console.error('Error fetching trends data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();

    // Serve static files (React build) in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, 'dist')));

      // Catch all handler for React Router
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      });
    }

    app.listen(PORT, () => {
      console.log(`🚀 KPI Dashboard API running on port ${PORT}`);
      console.log(`📊 Database: ${DB_PATH}`);
      console.log(`🌐 API endpoints available at: http://localhost:${PORT}/api/*`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
