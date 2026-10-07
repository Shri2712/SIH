import os
import json
import pandas as pd
import numpy as np
import joblib
from preprocess import clean_data

class ThreatPredictor:
    def __init__(self, model_dir="ml/saved_model"):
        self.model_path = os.path.join(model_dir, "threat_model.pkl")
        self.metadata_path = os.path.join(model_dir, "preprocessor_metadata.json")
        
        if not os.path.exists(self.model_path) or not os.path.exists(self.metadata_path):
            raise FileNotFoundError("Model or preprocessing metadata not found. Please train the model first.")
            
        self.model = joblib.load(self.model_path)
        with open(self.metadata_path, 'r') as f:
            self.metadata = json.load(f)
            
        self.feature_cols = self.metadata["feature_columns"]
        self.classes = self.metadata["classes"]
        self.idx_to_class = {int(k): v for k, v in self.metadata["idx_to_class"].items()}
        
    def predict_batch(self, df):
        """
        Receives a raw pandas DataFrame of network flows,
        cleans and aligns it, performs prediction on each row,
        and aggregates the results to produce a security threat report.
        """
        # Ensure we have data
        if df.empty:
            return {
                "threatDetected": False,
                "threatLikelihood": 0.0,
                "riskLevel": "LOW",
                "confidence": 1.0,
                "totalRecords": 0,
                "anomalies": {},
                "summary": "No network traffic records provided."
            }
            
        # Clean and align columns
        X_clean = clean_data(df, self.feature_cols)
        
        # Run model predictions
        pred_indices = self.model.predict(X_clean)
        pred_probs = self.model.predict_proba(X_clean)
        
        # Map indices to labels
        predictions = [self.idx_to_class[idx] for idx in pred_indices]
        
        # Calculate row-level confidence (the probability of the predicted class)
        row_confidences = [float(np.max(probs)) for probs in pred_probs]
        avg_confidence = float(np.mean(row_confidences))
        
        # Aggregate counts
        total_records = len(df)
        benign_count = sum(1 for p in predictions if p.lower() == 'benign')
        malicious_count = total_records - benign_count
        
        anomalies_counts = {}
        for p in predictions:
            if p.lower() != 'benign':
                anomalies_counts[p] = anomalies_counts.get(p, 0) + 1
                
        # Calculate threat likelihood
        threat_likelihood = float(malicious_count / total_records)
        
        # Risk level assessment
        # If any malicious traffic is found, we assess risk.
        if threat_likelihood == 0:
            risk_level = "LOW"
        elif threat_likelihood < 0.05:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"
            
        threat_detected = malicious_count > 0
        
        # Create a descriptive summary
        if threat_detected:
            anomaly_details = ", ".join([f"{k} ({v} flows)" for k, v in anomalies_counts.items()])
            summary = f"Suspicious network activity detected. Found {malicious_count} malicious flow(s) out of {total_records} analyzed. Identified patterns: {anomaly_details}."
        else:
            summary = f"All {total_records} analyzed network flows match benign traffic signatures."
            
        # Format individual records for visualization/replay if needed (we can return the first 20 records with predictions)
        sample_records = []
        # Return a small sample with prediction labels to display in the UI
        sample_size = min(total_records, 100)
        # Get indices of some malicious flows and benign flows to make the UI sample interesting
        malicious_indices = [i for i, p in enumerate(predictions) if p.lower() != 'benign']
        benign_indices = [i for i, p in enumerate(predictions) if p.lower() == 'benign']
        
        # Take a mix of malicious and benign
        selected_indices = (malicious_indices[:50] + benign_indices[:50])[:sample_size]
        
        for idx in selected_indices:
            row_dict = {}
            # Include a few key visual network characteristics for display
            row_dict["id"] = f"flow-{idx}"
            row_dict["protocol"] = int(X_clean.iloc[idx].get("Protocol", 6))
            row_dict["duration"] = float(X_clean.iloc[idx].get("Flow Duration", 0))
            row_dict["fwdPackets"] = int(X_clean.iloc[idx].get("Total Fwd Packets", 0))
            row_dict["bwdPackets"] = int(X_clean.iloc[idx].get("Total Backward Packets", 0))
            row_dict["fwdLength"] = float(X_clean.iloc[idx].get("Fwd Packets Length Total", 0))
            row_dict["bwdLength"] = float(X_clean.iloc[idx].get("Bwd Packets Length Total", 0))
            row_dict["prediction"] = predictions[idx]
            row_dict["confidence"] = row_confidences[idx]
            row_dict["isMalicious"] = predictions[idx].lower() != 'benign'
            sample_records.append(row_dict)
            
        return {
            "threatDetected": threat_detected,
            "threatLikelihood": round(threat_likelihood, 4),
            "riskLevel": risk_level,
            "confidence": round(avg_confidence, 4),
            "totalRecords": total_records,
            "anomalies": anomalies_counts,
            "summary": summary,
            "sampleRecords": sample_records
        }
