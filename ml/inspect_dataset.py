import zipfile
import io
import os
import pandas as pd
import numpy as np

zip_path = "archive.zip"

print(f"Reading ZIP file: {zip_path}")
with zipfile.ZipFile(zip_path, 'r') as z:
    files = z.namelist()
    print("Files inside ZIP:", files)
    
    for f in files:
        print("\n" + "="*50)
        print(f"Inspecting file: {f}")
        try:
            # Read first few rows to get columns and data types
            with z.open(f) as pf:
                # Read using pandas and pyarrow
                df = pd.read_parquet(pf, engine='pyarrow')
                print(f"Shape: {df.shape}")
                print("Columns:")
                print(list(df.columns))
                
                # Check labels
                if 'Label' in df.columns:
                    print("Label distribution:")
                    print(df['Label'].value_counts())
                elif 'label' in df.columns:
                    print("Label distribution:")
                    print(df['label'].value_counts())
                else:
                    # Look for columns that might be label
                    label_cols = [c for c in df.columns if 'label' in c.lower()]
                    print(f"Potential label columns: {label_cols}")
                    for col in label_cols:
                        print(f"Distribution of {col}:")
                        print(df[col].value_counts())
                
                # Check for nulls/infs in a subset or full df
                null_counts = df.isnull().sum().sum()
                print(f"Total null values: {null_counts}")
                
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                inf_counts = np.isinf(df[numeric_cols]).sum().sum()
                print(f"Total infinite values: {inf_counts}")
                
        except Exception as e:
            print(f"Error inspecting {f}: {e}")
