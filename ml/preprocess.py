import pandas as pd
import numpy as np
import json
import os

def clean_columns(df):
    """
    Strips whitespace from column names and normalizes them.
    """
    df.columns = df.columns.str.strip()
    return df

def clean_data(df, feature_cols=None):
    """
    Handles missing (NaN) and infinite (inf) values in the dataframe.
    If feature_cols is provided, aligns the dataframe to contain exactly these columns.
    """
    df = clean_columns(df.copy())
    
    # If we are in inference mode, align columns
    if feature_cols is not None:
        # Add missing columns with 0
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0.0
        # Select only required columns in the correct order
        df = df[feature_cols]
    
    # Identify numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    # Replace infinite values with NaN first
    df[numeric_cols] = df[numeric_cols].replace([np.inf, -np.inf], np.nan)
    
    # Fill NaNs with 0.0 or column median (for simplicity, we use 0.0 or forward/backward fill, 
    # but filling with 0.0 is very safe and standard for network features)
    df[numeric_cols] = df[numeric_cols].fillna(0.0)
    
    return df

def extract_features_labels(df, label_col='Label'):
    """
    Splits the dataframe into features (X) and labels (y), and returns them.
    """
    df = clean_columns(df)
    
    if label_col in df.columns:
        X = df.drop(columns=[label_col])
        y = df[label_col].astype(str).str.strip()
    else:
        X = df
        y = None
        
    X = clean_data(X)
    return X, y
