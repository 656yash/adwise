#!/usr/bin/env python3
"""
KPI Dashboard Database Initialization Script

This script will:
1. Create the SQLite database
2. Import data from the CSV file
3. Set up the database schema
4. Provide instructions for running the API

Run this script before starting the Flask API.
"""

import os
import sys
import subprocess
from database_setup import main as setup_database

def check_dependencies():
    """Check if required Python packages are installed"""
    required_packages = ['flask', 'flask_cors']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("Missing required packages:", missing_packages)
        print("Installing required packages...")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
            print("Packages installed successfully!")
        except subprocess.CalledProcessError:
            print("Failed to install packages. Please install manually:")
            print("pip install -r requirements.txt")
            return False
    
    return True

def main():
    """Main initialization function"""
    print("=" * 50)
    print("KPI DASHBOARD DATABASE INITIALIZATION")
    print("=" * 50)
    
    # Check dependencies
    print("\n1. Checking Python dependencies...")
    if not check_dependencies():
        print("Please install dependencies and try again.")
        return False
    
    print("✓ Dependencies are satisfied")
    
    # Set up database
    print("\n2. Setting up database...")
    try:
        setup_database()
        print("✓ Database setup completed successfully!")
    except Exception as e:
        print(f"✗ Database setup failed: {e}")
        return False
    
    # Provide next steps
    print("\n" + "=" * 50)
    print("SETUP COMPLETED SUCCESSFULLY!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Start the Flask API server:")
    print("   python app.py")
    print("\n2. The API will be available at:")
    print("   http://localhost:5000")
    print("\n3. Test the API endpoints:")
    print("   - Health check: http://localhost:5000/api/health")
    print("   - Dashboard data: http://localhost:5000/api/dashboard/summary")
    print("   - KPI data: http://localhost:5000/api/kpi/data")
    print("   - Detailed data: http://localhost:5000/api/data/detailed")
    print("   - Filter options: http://localhost:5000/api/filters/options")
    print("\n4. Update your React frontend to use these API endpoints")
    print("\nDatabase file created: kpi_dashboard.db")
    print("CSV data imported successfully!")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
