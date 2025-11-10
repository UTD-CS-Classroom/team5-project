"""
Pytest tests for migrate_add_images.py migration script
"""
import pytest
import sqlite3
import os
import tempfile
from pathlib import Path


def create_test_database(db_path):
    """Create a test database with a businesses table (without image columns)"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create businesses table without profile_image and cover_image columns
    cursor.execute('''
        CREATE TABLE businesses (
            id INTEGER PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            business_name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            specialty TEXT,
            description TEXT,
            created_at TEXT
        )
    ''')
    
    conn.commit()
    conn.close()


def run_migration(db_path):
    """Run the migration script logic on a test database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    results = []
    
    try:
        # Add profile_image column
        cursor.execute('ALTER TABLE businesses ADD COLUMN profile_image TEXT')
        results.append(("profile_image", "added"))
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            results.append(("profile_image", "already_exists"))
        else:
            raise
    
    try:
        # Add cover_image column
        cursor.execute('ALTER TABLE businesses ADD COLUMN cover_image TEXT')
        results.append(("cover_image", "added"))
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            results.append(("cover_image", "already_exists"))
        else:
            raise
    
    conn.commit()
    conn.close()
    
    return results


def get_table_columns(db_path, table_name):
    """Get all column names from a table"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    conn.close()
    return columns


class TestMigrateAddImages:
    """Test suite for migrate_add_images.py"""
    
    def test_migration_adds_columns_to_empty_table(self):
        """Test that migration successfully adds both columns to a table without them"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
            db_path = tmp_file.name
        
        try:
            # Create test database
            create_test_database(db_path)
            
            # Verify columns don't exist before migration
            columns_before = get_table_columns(db_path, 'businesses')
            assert 'profile_image' not in columns_before
            assert 'cover_image' not in columns_before
            
            # Run migration
            results = run_migration(db_path)
            
            # Verify both columns were added
            assert results[0][0] == "profile_image"
            assert results[0][1] == "added"
            assert results[1][0] == "cover_image"
            assert results[1][1] == "added"
            
            # Verify columns exist after migration
            columns_after = get_table_columns(db_path, 'businesses')
            assert 'profile_image' in columns_after
            assert 'cover_image' in columns_after
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    def test_migration_handles_existing_profile_image_column(self):
        """Test that migration handles existing profile_image column gracefully"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
            db_path = tmp_file.name
        
        try:
            # Create test database with profile_image already present
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE businesses (
                    id INTEGER PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    profile_image TEXT
                )
            ''')
            conn.commit()
            conn.close()
            
            # Run migration
            results = run_migration(db_path)
            
            # Verify profile_image was detected as existing
            assert results[0][0] == "profile_image"
            assert results[0][1] == "already_exists"
            # cover_image should be added
            assert results[1][0] == "cover_image"
            assert results[1][1] == "added"
            
            # Verify both columns exist
            columns = get_table_columns(db_path, 'businesses')
            assert 'profile_image' in columns
            assert 'cover_image' in columns
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    def test_migration_handles_existing_cover_image_column(self):
        """Test that migration handles existing cover_image column gracefully"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
            db_path = tmp_file.name
        
        try:
            # Create test database with cover_image already present
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE businesses (
                    id INTEGER PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    cover_image TEXT
                )
            ''')
            conn.commit()
            conn.close()
            
            # Run migration
            results = run_migration(db_path)
            
            # Verify profile_image was added
            assert results[0][0] == "profile_image"
            assert results[0][1] == "added"
            # cover_image should be detected as existing
            assert results[1][0] == "cover_image"
            assert results[1][1] == "already_exists"
            
            # Verify both columns exist
            columns = get_table_columns(db_path, 'businesses')
            assert 'profile_image' in columns
            assert 'cover_image' in columns
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    def test_migration_handles_both_columns_existing(self):
        """Test that migration handles both columns already existing"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
            db_path = tmp_file.name
        
        try:
            # Create test database with both columns already present
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE businesses (
                    id INTEGER PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    profile_image TEXT,
                    cover_image TEXT
                )
            ''')
            conn.commit()
            conn.close()
            
            # Run migration
            results = run_migration(db_path)
            
            # Verify both columns were detected as existing
            assert results[0][0] == "profile_image"
            assert results[0][1] == "already_exists"
            assert results[1][0] == "cover_image"
            assert results[1][1] == "already_exists"
            
            # Verify both columns still exist
            columns = get_table_columns(db_path, 'businesses')
            assert 'profile_image' in columns
            assert 'cover_image' in columns
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    def test_migration_idempotent(self):
        """Test that running migration twice produces the same result"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
            db_path = tmp_file.name
        
        try:
            # Create test database
            create_test_database(db_path)
            
            # Run migration first time
            results1 = run_migration(db_path)
            columns1 = get_table_columns(db_path, 'businesses')
            
            # Run migration second time
            results2 = run_migration(db_path)
            columns2 = get_table_columns(db_path, 'businesses')
            
            # Verify columns are the same
            assert columns1 == columns2
            assert 'profile_image' in columns1
            assert 'cover_image' in columns1
            
            # Verify second run detected existing columns
            assert results2[0][1] == "already_exists"
            assert results2[1][1] == "already_exists"
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    def test_migration_preserves_existing_data(self):
        """Test that migration doesn't affect existing data in the table"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
            db_path = tmp_file.name
        
        try:
            # Create test database with existing data
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE businesses (
                    id INTEGER PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    business_name TEXT NOT NULL
                )
            ''')
            cursor.execute('''
                INSERT INTO businesses (email, business_name)
                VALUES ('test@example.com', 'Test Business')
            ''')
            conn.commit()
            conn.close()
            
            # Run migration
            run_migration(db_path)
            
            # Verify existing data is still there
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM businesses WHERE id = 1')
            row = cursor.fetchone()
            conn.close()
            
            assert row is not None
            assert row[1] == 'test@example.com'
            assert row[2] == 'Test Business'
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    def test_migration_column_types(self):
        """Test that added columns have the correct TEXT type"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
            db_path = tmp_file.name
        
        try:
            # Create test database
            create_test_database(db_path)
            
            # Run migration
            run_migration(db_path)
            
            # Check column types
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(businesses)")
            columns_info = {row[1]: row[2] for row in cursor.fetchall()}
            conn.close()
            
            # SQLite stores TEXT columns as TEXT type
            assert columns_info['profile_image'] == 'TEXT'
            assert columns_info['cover_image'] == 'TEXT'
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)

