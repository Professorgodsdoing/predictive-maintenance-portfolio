"""
=============================================================
  LinkedIn Automation — Share Analysis Results
  Uses: python-linkedin-v2 OR direct REST API (OAuth 2.0)
  Author: [Your Name] | Portfolio Automation Project
=============================================================

SETUP STEPS:
  1. Go to https://www.linkedin.com/developers/apps
  2. Create an app → request "Share on LinkedIn" + "r_liteprofile" scopes
  3. Run OAuth flow to get your ACCESS_TOKEN (see get_access_token() below)
  4. pip install requests python-dotenv schedule Pillow

ENV FILE (.env):
  LINKEDIN_ACCESS_TOKEN=your_token_here
  LINKEDIN_PERSON_URN=urn:li:person:YOUR_ID   # from /v2/me endpoint
"""

import os
import json
import base64
import schedule
import time
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# ── CONFIG ────────────────────────────────────────────────────────────────────
ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN")
PERSON_URN   = os.getenv("LINKEDIN_PERSON_URN")   # e.g. "urn:li:person:abc123"
API_BASE     = "https://api.linkedin.com/v2"
HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type":  "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
}

# ── STEP 1: GET YOUR PERSON URN (run once) ────────────────────────────────────
def get_my_urn() -> str:
    """Fetch your LinkedIn URN — run once and save to .env"""
    r = requests.get(f"{API_BASE}/me", headers=HEADERS)
    r.raise_for_status()
    urn = f"urn:li:person:{r.json()['id']}"
    print(f"Your URN: {urn}")
    return urn


# ── STEP 2: UPLOAD AN IMAGE (chart PNG) ───────────────────────────────────────
def upload_image(image_path: str) -> str:
    """
    LinkedIn requires a 2-step upload:
      a) Register the image upload → get uploadUrl + asset
      b) PUT the binary to uploadUrl
    Returns the image asset URN.
    """
    # a) Register
    register_payload = {
        "registerUploadRequest": {
            "owner": PERSON_URN,
            "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
            "serviceRelationships": [{
                "identifier": "urn:li:userGeneratedContent",
                "relationshipType": "OWNER"
            }],
            "supportedUploadMechanism": ["SYNCHRONOUS_UPLOAD"]
        }
    }
    r = requests.post(
        f"{API_BASE}/assets?action=registerUpload",
        headers=HEADERS,
        json=register_payload
    )
    r.raise_for_status()
    result     = r.json()["value"]
    upload_url = result["uploadMechanism"][
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ]["uploadUrl"]
    asset_urn  = result["asset"]

    # b) Upload binary
    with open(image_path, "rb") as f:
        image_data = f.read()
    upload_headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type":  "application/octet-stream",
    }
    r2 = requests.put(upload_url, headers=upload_headers, data=image_data)
    r2.raise_for_status()
    print(f"  ✓ Image uploaded: {asset_urn}")
    return asset_urn


# ── STEP 3: BUILD POST TEXT ───────────────────────────────────────────────────
def build_post_text(
    failure_rate: float = 3.4,
    top_feature: str    = "Tool Wear",
    auc_score: float    = 0.974,
    date_str: str       = None,
) -> str:
    """Generates a ready-to-post LinkedIn caption from analysis results."""
    date_str = date_str or datetime.today().strftime("%B %d, %Y")
    return f"""🔧 Predictive Maintenance Analysis | {date_str}

I just completed an end-to-end machine failure analysis on 10,000 CNC machine records from the UCI AI4I dataset — here's what I found:

📊 Key Results:
• Overall machine failure rate: {failure_rate:.1f}%
• Top predictive feature: {top_feature}
• Random Forest ROC-AUC: {auc_score:.1%}

🔑 Insights:
→ Tool wear + torque are the strongest early-warning signals
→ High-load machines fail ~3× more often than low-load variants
→ A tuned classifier can flag at-risk machines BEFORE breakdown occurs

🛠 Tech stack: Python · Pandas · Scikit-learn · Matplotlib · Seaborn

This is part of my portfolio showcasing Data Analysis + AI Automation for Mechanical Engineering problems. 

Would love feedback from fellow engineers or data scientists 👇

#MechanicalEngineering #DataAnalysis #PredictiveMaintenance #MachineLearning #Python #PortfolioProject #Engineering #TechnicalWriting"""


# ── STEP 4: PUBLISH THE POST ──────────────────────────────────────────────────
def post_to_linkedin(text: str, image_asset_urn: str = None) -> dict:
    """
    Publishes a text post (with optional image) to LinkedIn.
    Returns the API response dict.
    """
    content = {
        "author":           PERSON_URN,
        "lifecycleState":   "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE" if not image_asset_urn else "IMAGE",
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }

    # Attach image if provided
    if image_asset_urn:
        content["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [{
            "status": "READY",
            "description": {"text": "EDA Dashboard — Predictive Maintenance"},
            "media": image_asset_urn,
            "title": {"text": "Machine Failure Analysis Chart"},
        }]
        content["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"

    r = requests.post(f"{API_BASE}/ugcPosts", headers=HEADERS, json=content)
    r.raise_for_status()
    post_id = r.headers.get("x-restli-id", "unknown")
    print(f"  ✓ Post published! Post ID: {post_id}")
    return r.json() if r.text else {"id": post_id}


# ── STEP 5: FULL PIPELINE ─────────────────────────────────────────────────────
def run_pipeline(
    image_path: str     = "eda_dashboard.png",
    failure_rate: float = 3.4,
    top_feature: str    = "Tool Wear",
    auc_score: float    = 0.974,
):
    """
    End-to-end: build caption → upload image → post to LinkedIn.
    Call this manually OR via the scheduler below.
    """
    print("\n🚀 Starting LinkedIn Post Pipeline...")

    text = build_post_text(failure_rate, top_feature, auc_score)
    print("  ✓ Caption built")

    image_urn = None
    if os.path.exists(image_path):
        image_urn = upload_image(image_path)

    result = post_to_linkedin(text, image_urn)
    print("  ✓ Pipeline complete!\n")
    return result


# ── STEP 6: SCHEDULER (optional — post every Monday at 9 AM) ──────────────────
def schedule_weekly_post():
    """
    Uses the 'schedule' library to post every Monday at 09:00.
    Run this script in the background (e.g., as a cron job or systemd service).
    """
    schedule.every().monday.at("09:00").do(run_pipeline)
    print("📅 Scheduler active — will post every Monday at 09:00")
    while True:
        schedule.run_pending()
        time.sleep(60)


# ── ENTRY POINT ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--schedule":
        schedule_weekly_post()
    else:
        # One-shot post (pass values from your analysis script)
        run_pipeline(
            image_path   = "eda_dashboard.png",
            failure_rate = 3.4,
            top_feature  = "Tool Wear [min]",
            auc_score    = 0.974,
        )
