#!/bin/bash
# Contract Analyzer — GCP Cloud Run Deployment Script
# Usage: ./deploy.sh PROJECT_ID [REGION]
set -euo pipefail

PROJECT_ID="${1:?Usage: ./deploy.sh PROJECT_ID [REGION]}"
REGION="${2:-us-central1}"
SERVICE_NAME="contract-analyzer"
REPO_NAME="contract-analyzer-repo"

echo "================================================"
echo "  Contract Analyzer — GCP Cloud Run Deployment"
echo "================================================"
echo "  Project: $PROJECT_ID"
echo "  Region:  $REGION"
echo ""

# Enable required APIs
echo "[1/4] Enabling GCP APIs..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    --project="$PROJECT_ID"

# Create Artifact Registry repo if not exists
echo "[2/4] Setting up Artifact Registry..."
gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker \
    --location="$REGION" \
    --project="$PROJECT_ID" \
    2>/dev/null || echo "   Repository already exists"

IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest"

# Build with Cloud Build
echo "[3/4] Building container image (this may take 15-20 minutes)..."
gcloud builds submit \
    --tag="$IMAGE" \
    --project="$PROJECT_ID" \
    --timeout=1800

# Deploy to Cloud Run
echo "[4/4] Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --image="$IMAGE" \
    --platform=managed \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --memory=4Gi \
    --cpu=2 \
    --min-instances=0 \
    --max-instances=3 \
    --concurrency=1 \
    --timeout=300 \
    --port=8080 \
    --allow-unauthenticated \
    --set-env-vars="TRANSFORMERS_CACHE=/app/models"

# Get the deployed URL
URL=$(gcloud run services describe "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="value(status.url)")

echo ""
echo "================================================"
echo "  Deployment complete!"
echo "================================================"
echo "  App URL:     $URL"
echo "  Health:      ${URL}/health"
echo "  API docs:    ${URL}/docs"
echo "  Gradio UI:   ${URL}/"
echo "================================================"
