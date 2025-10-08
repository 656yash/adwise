from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime 

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), '../backend/kpi_dashboard.db')

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

def dict_factory(cursor, row):
    """Convert sqlite row to dictionary"""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "KPI Dashboard API is running"})

@app.route('/api/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    """Get dashboard summary data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get summary metrics
        cursor.execute('''
            SELECT 
                COUNT(*) as total_campaigns,
                SUM(impressions) as total_impressions,
                SUM(clicks) as total_clicks,
                SUM(conversion) as total_conversions,
                SUM(spent) as total_spent,
                AVG(roi) as avg_roi,
                AVG(roas) as avg_roas,
                AVG(cpc) as avg_cpc,
                AVG(ctr) as avg_ctr
            FROM kpi_data
        ''')
        
        summary = cursor.fetchone()
        
        # Get platform breakdown
        cursor.execute('''
            SELECT 
                platform,
                COUNT(*) as campaigns,
                SUM(impressions) as impressions,
                SUM(clicks) as clicks,
                SUM(conversion) as conversions,
                SUM(spent) as spent,
                AVG(roi) as avg_roi
            FROM kpi_data
            GROUP BY platform
            ORDER BY spent DESC
        ''')
        
        platforms = [dict(row) for row in cursor.fetchall()]
        
        # Get recent campaigns
        cursor.execute('''
            SELECT 
                platform, campaign, impressions, clicks, conversion, spent, roi, roas, date
            FROM kpi_data
            ORDER BY date DESC
            LIMIT 10
        ''')
        
        recent_campaigns = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            "summary": dict(summary),
            "platforms": platforms,
            "recent_campaigns": recent_campaigns
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/kpi/data', methods=['GET'])
def get_kpi_data():
    """Get KPI visualization data with optional filters"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get query parameters for filtering
        platform = request.args.get('platform')
        campaign = request.args.get('campaign')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # Build WHERE clause
        where_conditions = []
        params = []
        
        if platform:
            where_conditions.append("platform = ?")
            params.append(platform)
        
        if campaign:
            where_conditions.append("campaign = ?")
            params.append(campaign)
        
        if date_from:
            where_conditions.append("date >= ?")
            params.append(date_from)
            
        if date_to:
            where_conditions.append("date <= ?")
            params.append(date_to)
        
        where_clause = " WHERE " + " AND ".join(where_conditions) if where_conditions else ""
        
        # Get KPI data for charts
        query = f'''
            SELECT 
                platform,
                campaign,
                impressions,
                clicks,
                conversion,
                spent,
                roi,
                roas,
                cpc,
                ctr,
                kpi,
                date
            FROM kpi_data
            {where_clause}
            ORDER BY date ASC
        '''
        
        cursor.execute(query, params)
        kpi_data = [dict(row) for row in cursor.fetchall()]
        
        # Get aggregated metrics by platform
        platform_query = f'''
            SELECT 
                platform,
                SUM(impressions) as total_impressions,
                SUM(clicks) as total_clicks,
                SUM(conversion) as total_conversions,
                SUM(spent) as total_spent,
                AVG(roi) as avg_roi,
                AVG(roas) as avg_roas,
                AVG(cpc) as avg_cpc,
                AVG(ctr) as avg_ctr
            FROM kpi_data
            {where_clause}
            GROUP BY platform
            ORDER BY total_spent DESC
        '''
        
        cursor.execute(platform_query, params)
        platform_metrics = [dict(row) for row in cursor.fetchall()]
        
        # Get campaign performance
        campaign_query = f'''
            SELECT 
                campaign,
                platform,
                SUM(impressions) as total_impressions,
                SUM(clicks) as total_clicks,
                SUM(conversion) as total_conversions,
                SUM(spent) as total_spent,
                AVG(roi) as avg_roi,
                AVG(roas) as avg_roas
            FROM kpi_data
            {where_clause}
            GROUP BY campaign, platform
            ORDER BY total_spent DESC
        '''
        
        cursor.execute(campaign_query, params)
        campaign_metrics = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            "kpi_data": kpi_data,
            "platform_metrics": platform_metrics,
            "campaign_metrics": campaign_metrics,
            "filters_applied": {
                "platform": platform,
                "campaign": campaign,
                "date_from": date_from,
                "date_to": date_to
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data/detailed', methods=['GET'])
def get_detailed_data():
    """Get detailed data with pagination and filtering"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        platform = request.args.get('platform')
        campaign = request.args.get('campaign')
        sort_by = request.args.get('sort_by', 'date')
        sort_order = request.args.get('sort_order', 'DESC')
        
        # Build WHERE clause
        where_conditions = []
        params = []
        
        if platform:
            where_conditions.append("platform = ?")
            params.append(platform)
        
        if campaign:
            where_conditions.append("campaign = ?")
            params.append(campaign)
        
        where_clause = " WHERE " + " AND ".join(where_conditions) if where_conditions else ""
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM kpi_data {where_clause}"
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()[0]
        
        # Calculate pagination
        offset = (page - 1) * per_page
        total_pages = (total_count + per_page - 1) // per_page
        
        # Get paginated data
        data_query = f'''
            SELECT 
                id, platform, campaign, impressions, clicks, conversion, 
                spent, roi, roas, cpc, ctr, kpi, date
            FROM kpi_data
            {where_clause}
            ORDER BY {sort_by} {sort_order}
            LIMIT ? OFFSET ?
        '''
        
        cursor.execute(data_query, params + [per_page, offset])
        data = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            "data": data,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            },
            "filters_applied": {
                "platform": platform,
                "campaign": campaign,
                "sort_by": sort_by,
                "sort_order": sort_order
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/filters/options', methods=['GET'])
def get_filter_options():
    """Get available filter options"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get unique platforms
        cursor.execute("SELECT DISTINCT platform FROM kpi_data ORDER BY platform")
        platforms = [row[0] for row in cursor.fetchall()]
        
        # Get unique campaigns
        cursor.execute("SELECT DISTINCT campaign FROM kpi_data ORDER BY campaign")
        campaigns = [row[0] for row in cursor.fetchall()]
        
        # Get date range
        cursor.execute("SELECT MIN(date), MAX(date) FROM kpi_data")
        date_range = cursor.fetchone()
        
        conn.close()
        
        return jsonify({
            "platforms": platforms,
            "campaigns": campaigns,
            "date_range": {
                "min_date": date_range[0],
                "max_date": date_range[1]
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics/trends', methods=['GET'])
def get_trends():
    """Get trend analysis data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get daily trends
        cursor.execute('''
            SELECT 
                date,
                SUM(impressions) as daily_impressions,
                SUM(clicks) as daily_clicks,
                SUM(conversion) as daily_conversions,
                SUM(spent) as daily_spent,
                AVG(roi) as daily_roi,
                AVG(roas) as daily_roas
            FROM kpi_data
            GROUP BY date
            ORDER BY date ASC
        ''')
        
        daily_trends = [dict(row) for row in cursor.fetchall()]
        
        # Get platform performance trends
        cursor.execute('''
            SELECT 
                platform,
                date,
                SUM(impressions) as impressions,
                SUM(clicks) as clicks,
                SUM(conversion) as conversions,
                SUM(spent) as spent,
                AVG(roi) as roi
            FROM kpi_data
            GROUP BY platform, date
            ORDER BY date ASC, platform ASC
        ''')
        
        platform_trends = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            "daily_trends": daily_trends,
            "platform_trends": platform_trends
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Check if database exists
    if not os.path.exists(DB_PATH):
        print("Database not found! Please run database_setup.py first.")
        exit(1)
    
    print("Starting KPI Dashboard API...")
    print(f"Database: {DB_PATH}")
    print("API will be available at: http://localhost:5000")
    print("Available endpoints:")
    print("  - GET /api/health")
    print("  - GET /api/dashboard/summary")
    print("  - GET /api/kpi/data")
    print("  - GET /api/data/detailed")
    print("  - GET /api/filters/options")
    print("  - GET /api/analytics/trends")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
