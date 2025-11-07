"""
Migration script to add profile_image and cover_image columns to businesses table
"""
import sqlite3

# Connect to database
conn = sqlite3.connect('appointments.db')
cursor = conn.cursor()

try:
    # Add profile_image column
    cursor.execute('ALTER TABLE businesses ADD COLUMN profile_image TEXT')
    print("✅ Added profile_image column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⚠️  profile_image column already exists")
    else:
        raise

try:
    # Add cover_image column
    cursor.execute('ALTER TABLE businesses ADD COLUMN cover_image TEXT')
    print("✅ Added cover_image column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⚠️  cover_image column already exists")
    else:
        raise

# Commit changes
conn.commit()
conn.close()

print("\n✅ Migration completed successfully!")
print("The businesses table now has profile_image and cover_image columns.")
