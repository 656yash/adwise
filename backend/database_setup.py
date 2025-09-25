import sqlite3
import csv
import os
from datetime import datetime

def create_database():
    """Create SQLite database and table for KPI dashboard data"""
    
    # Database file path
    db_path = os.path.join(os.path.dirname(__file__), 'kpi_dashboard.db')
    
    # Connect to database (creates if doesn't exist)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Drop existing table if it exists
    cursor.execute('DROP TABLE IF EXISTS kpi_data')
    
    # Create table with proper schema
    cursor.execute('''
        CREATE TABLE kpi_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform TEXT NOT NULL,
            campaign TEXT NOT NULL,
            impressions INTEGER NOT NULL,
            clicks INTEGER NOT NULL,
            conversion INTEGER NOT NULL,
            spent REAL NOT NULL,
            roi REAL NOT NULL,
            roas REAL NOT NULL,
            cpc REAL NOT NULL,
            ctr REAL NOT NULL,
            kpi INTEGER NOT NULL,
            date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    print("Database table created successfully!")
    
    conn.commit()
    conn.close()
    return db_path

def import_csv_data():
    """Import data from CSV file into the database"""
    
    # Paths
    csv_path = os.path.join(os.path.dirname(__file__), 'kpi_dashboard_data.csv')
    db_path = os.path.join(os.path.dirname(__file__), 'kpi_dashboard.db')
    
    if not os.path.exists(csv_path):
        print(f"CSV file not found: {csv_path}")
        return False
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Read and import CSV data
    with open(csv_path, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        imported_count = 0
        for row in csv_reader:
            # Skip empty rows
            if not row.get('Platform'):
                continue
                
            try:
                # Parse and clean data
                platform = row['Platform'].strip()
                campaign = row['Campaign'].strip()
                impressions = int(row['Impressions'])
                clicks = int(row['Clicks'])
                conversion = int(row['Conversion'])
                spent = float(row['Spent'])
                roi = float(row['ROI'])
                roas = float(row['ROAS'])
                cpc = float(row['CPC'])
                ctr = float(row['CTR (%)'])
                kpi = int(row['KPI'])
                date = row['Date'].strip()
                
                # Insert data
                cursor.execute('''
                    INSERT INTO kpi_data 
                    (platform, campaign, impressions, clicks, conversion, spent, roi, roas, cpc, ctr, kpi, date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (platform, campaign, impressions, clicks, conversion, spent, roi, roas, cpc, ctr, kpi, date))
                
                imported_count += 1
                
            except (ValueError, KeyError) as e:
                print(f"Error processing row: {row}, Error: {e}")
                continue
    
    conn.commit()
    conn.close()
    
    print(f"Successfully imported {imported_count} records from CSV!")
    return True

def get_database_stats():
    """Get basic statistics about the imported data"""
    
    db_path = os.path.join(os.path.dirname(__file__), 'kpi_dashboard.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Total records
    cursor.execute('SELECT COUNT(*) FROM kpi_data')
    total_records = cursor.fetchone()[0]
    
    # Unique platforms
    cursor.execute('SELECT COUNT(DISTINCT platform) FROM kpi_data')
    unique_platforms = cursor.fetchone()[0]
    
    # Unique campaigns
    cursor.execute('SELECT COUNT(DISTINCT campaign) FROM kpi_data')
    unique_campaigns = cursor.fetchone()[0]
    
    # Date range
    cursor.execute('SELECT MIN(date), MAX(date) FROM kpi_data')
    date_range = cursor.fetchone()
    
    # Total metrics
    cursor.execute('''
        SELECT 
            SUM(impressions) as total_impressions,
            SUM(clicks) as total_clicks,
            SUM(conversion) as total_conversions,
            SUM(spent) as total_spent,
            AVG(roi) as avg_roi,
            AVG(roas) as avg_roas
        FROM kpi_data
    ''')
    metrics = cursor.fetchone()
    
    conn.close()
    
    print("\n=== DATABASE STATISTICS ===")
    print(f"Total Records: {total_records}")
    print(f"Unique Platforms: {unique_platforms}")
    print(f"Unique Campaigns: {unique_campaigns}")
    print(f"Date Range: {date_range[0]} to {date_range[1]}")
    print(f"Total Impressions: {metrics[0]:,}")
    print(f"Total Clicks: {metrics[1]:,}")
    print(f"Total Conversions: {metrics[2]:,}")
    print(f"Total Spent: ${metrics[3]:,.2f}")
    print(f"Average ROI: {metrics[4]:.2f}")
    print(f"Average ROAS: {metrics[5]:.2f}")
    print("===========================\n")

def main():
    """Main function to set up database and import data"""
    
    print("Starting KPI Dashboard Database Setup...")
    
    # Create database and table
    db_path = create_database()
    print(f"Database created at: {db_path}")
    
    # Import CSV data
    if import_csv_data():
        print("CSV data imported successfully!")
        
        # Show statistics
        get_database_stats()
        
        print("Database setup completed successfully!")
        print("You can now run the Flask API to serve the data.")
    else:
        print("Failed to import CSV data!")

if __name__ == "__main__":
    main()
