import zipfile
import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

from preprocess import clean_columns, clean_data, extract_features_labels

def main():
    zip_path = "archive.zip"
    model_dir = "ml/saved_model"
    data_dir = "ml/data"
    
    os.makedirs(model_dir, exist_ok=True)
    os.makedirs(data_dir, exist_ok=True)
    
    sampled_dfs = []
    
    print("Step 1: Extracting and sampling dataset programmatically...")
    
    with zipfile.ZipFile(zip_path, 'r') as z:
        files = z.namelist()
        for f in files:
            print(f"Reading file: {f}")
            try:
                with z.open(f) as pf:
                    # Load the Parquet file
                    df = pd.read_parquet(pf, engine='pyarrow')
                    df = clean_columns(df)
                    
                    if 'Label' not in df.columns:
                        print(f"Skipping {f} - no Label column found.")
                        continue
                    
                    # Clean label column (strip spaces, resolve potential encoding characters)
                    # Convert to string and handle invalid character encodings if any
                    df['Label'] = df['Label'].astype(str).str.strip()
                    
                    # Handle Web Attack label cleaning
                    df['Label'] = df['Label'].apply(lambda x: "".join([c if ord(c) < 128 else " " for c in x]))
                    df['Label'] = df['Label'].str.replace(r'\s+', ' ', regex=True).str.strip()
                    
                    print(f"Original shape: {df.shape}")
                    
                    # Sample at most 5,000 per class to keep the training runtime fast
                    # Using a loop to avoid pandas 3.x groupby.apply dropping grouping columns
                    unique_labels = df['Label'].unique()
                    local_sampled = []
                    for label in unique_labels:
                        class_df = df[df['Label'] == label]
                        class_sample = class_df.sample(n=min(len(class_df), 5000), random_state=42)
                        local_sampled.append(class_sample)
                    
                    sampled_df = pd.concat(local_sampled, ignore_index=True)
                    
                    print(f"Sampled shape: {sampled_df.shape}")
                    print("Class distribution in sample:")
                    print(sampled_df['Label'].value_counts())
                    
                    sampled_dfs.append(sampled_df)
            except Exception as e:
                print(f"Error processing file {f}: {e}")
                
    if not sampled_dfs:
        print("No data was loaded. Exiting.")
        return
        
    # Combine all sampled dataframes
    print("\nStep 2: Combining sampled dataframes...")
    combined_df = pd.concat(sampled_dfs, ignore_index=True)
    print(f"Total combined sample shape: {combined_df.shape}")
    print("Overall class distribution:")
    print(combined_df['Label'].value_counts())
    
    # Process features and labels
    print("\nStep 3: Preprocessing features and labels...")
    X, y = extract_features_labels(combined_df, label_col='Label')
    
    # Save feature names list
    feature_cols = list(X.columns)
    
    # Label encoding map (save classes to map integer predictions back to labels)
    unique_classes = sorted(list(y.unique()))
    class_to_idx = {cls: idx for idx, cls in enumerate(unique_classes)}
    idx_to_class = {idx: cls for idx, cls in enumerate(unique_classes)}
    
    # Map labels to integers
    y_encoded = y.map(class_to_idx)
    
    print(f"Features dimension: {X.shape}")
    print(f"Classes: {unique_classes}")
    
    # Step 4: Split data
    print("\nStep 4: Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
    )
    
    print(f"Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")
    
    # Step 5: Export unseen demo traffic CSV
    # We will reconstruct a DataFrame from the test split with original labels
    demo_df = X_test.copy()
    demo_df['Label'] = y_test.map(idx_to_class)
    
    # Sample 1,000 records from the test split to serve as a lightweight demo file
    # Ensure we get a good mix of Benign and different Attack classes
    grouped_demo = demo_df.groupby('Label', group_keys=False)
    light_demo_df = grouped_demo.apply(lambda x: x.sample(n=min(len(x), 200), random_state=42))
    
    # Save the demo CSV file (with headers)
    demo_csv_path = os.path.join(data_dir, "unseen_demo_traffic.csv")
    light_demo_df.to_csv(demo_csv_path, index=False)
    print(f"Saved unseen demo traffic to {demo_csv_path} ({len(light_demo_df)} rows).")
    
    # Step 6: Train Random Forest model
    print("\nStep 6: Training Random Forest model...")
    # Using 50 estimators and max_depth of 15 to keep it lightweight but highly accurate
    model = RandomForestClassifier(n_estimators=50, max_depth=15, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    print("Model training complete.")
    
    # Step 7: Evaluate model on unseen test set
    print("\nStep 7: Evaluating model...")
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision_w = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall_w = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1_w = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Weighted Precision: {precision_w:.4f}")
    print(f"Weighted Recall: {recall_w:.4f}")
    print(f"Weighted F1 Score: {f1_w:.4f}")
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    # Convert confusion matrix to list for saving in metadata
    cm_list = cm.tolist()
    
    # Step 8: Save Model & Metadata
    model_path = os.path.join(model_dir, "threat_model.pkl")
    joblib.dump(model, model_path)
    print(f"Saved model to {model_path}")
    
    metadata = {
        "feature_columns": feature_cols,
        "classes": unique_classes,
        "idx_to_class": {str(k): v for k, v in idx_to_class.items()},
        "metrics": {
            "accuracy": float(accuracy),
            "precision": float(precision_w),
            "recall": float(recall_w),
            "f1_score": float(f1_w),
            "confusion_matrix": cm_list
        }
    }
    
    metadata_path = os.path.join(model_dir, "preprocessor_metadata.json")
    with open(metadata_path, 'w') as f_meta:
        json.dump(metadata, f_meta, indent=2)
    print(f"Saved preprocessing & metadata to {metadata_path}")
    
    print("\nTraining workflow completed successfully!")

if __name__ == "__main__":
    main()
