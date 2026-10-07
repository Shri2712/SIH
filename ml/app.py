import os
import json
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import ThreatPredictor

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes (to support React dev server queries)

# Global predictor initialized lazily
_predictor = None

def get_predictor():
    global _predictor
    if _predictor is None:
        model_dir = os.path.join(os.path.dirname(__file__), "saved_model")
        _predictor = ThreatPredictor(model_dir=model_dir)
    return _predictor

@app.route('/api/health', methods=['GET'])
def health():
    try:
        # Check if model exists
        pred = get_predictor()
        return jsonify({
            "status": "healthy",
            "model_loaded": True,
            "classes": pred.classes,
            "metrics": pred.metadata.get("metrics", {})
        }), 200
    except Exception as e:
        return jsonify({
            "status": "degraded",
            "model_loaded": False,
            "error": str(e),
            "message": "Model is not loaded or not trained yet. Please run training script first."
        }), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        predictor = get_predictor()
        
        # Check if CSV file is uploaded
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No selected file"}), 400
            
            # Read CSV
            df = pd.read_csv(file)
            print(f"Received CSV file: {file.filename}, shape: {df.shape}")
            
        elif request.is_json:
            data = request.get_json()
            if 'records' not in data:
                return jsonify({"error": "Missing 'records' field in JSON"}), 400
            df = pd.DataFrame(data['records'])
            print(f"Received JSON payload with {len(df)} records")
        else:
            return jsonify({"error": "Unsupported Media Type. Send JSON with 'records' or upload a CSV file with key 'file'."}), 415
            
        # Run prediction
        report = predictor.predict_batch(df)
        return jsonify(report), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo-traffic', methods=['GET'])
def demo_traffic():
    try:
        demo_csv_path = os.path.join(os.path.dirname(__file__), "data", "unseen_demo_traffic.csv")
        if not os.path.exists(demo_csv_path):
            return jsonify({"error": "Unseen demo traffic file not found. Please train the model first."}), 404
            
        df = pd.read_csv(demo_csv_path)
        # Convert columns to string/float appropriately
        records = df.to_dict(orient='records')
        return jsonify({
            "filename": "unseen_demo_traffic.csv",
            "totalRecords": len(df),
            "records": records
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    print(f"Starting Network Threat Forecasting API on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
