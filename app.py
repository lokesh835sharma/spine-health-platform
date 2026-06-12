from flask import Flask, render_template, request, jsonify, session
import predictor
import json
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "spine-health-dev-fallback-key")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/assessment")
def assessment():
    return render_template("assessment.html")


@app.route("/result")
def result():
    result_data = session.get("result_data")
    if not result_data:
        return render_template("result.html", result=None)
    return render_template("result.html", result=result_data)


@app.route("/analytics")
def analytics():
    stats = predictor.get_cluster_stats()
    return render_template("analytics.html", stats=json.dumps(stats))


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = [
            "age", "gender", "morning_stiffness", "persistent_pain",
            "sitting_hours", "sitting_posture", "sleeping_posture",
            "sleep_turning", "sleep_quality", "physical_activity",
            "ott_usage", "family_backpain", "gut_infection"
        ]
        for field in required_fields:
            if field not in data or data[field] == "" or data[field] is None:
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Type checks
        try:
            float(data["age"])
            float(data["sitting_hours"])
        except (ValueError, TypeError):
            return jsonify({"error": "Age and sitting hours must be numbers."}), 400

        result = predictor.predict(data)
        session["result_data"] = result

        return jsonify({"success": True, "redirect": "/result", "result_data": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/stats")
def api_stats():
    stats = predictor.get_cluster_stats()
    return jsonify(stats)


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true", host="0.0.0.0", port=5000)
