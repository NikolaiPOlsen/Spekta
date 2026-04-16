#!/bin/bash

# Spekta — GitHub Issues setup script
# Usage: bash create_issues.sh
# Requirements: gh CLI installed and authenticated (gh auth login)

REPO="" # Set this to your repo, e.g. "username/spekta", or leave blank to use current directory

if [ -n "$REPO" ]; then
  GH="gh issue create -R $REPO"
else
  GH="gh issue create"
fi

echo "Creating milestones..."
gh api repos/{owner}/{repo} > /dev/null 2>&1

create_milestone() {
  gh api repos/:owner/:repo/milestones --method POST -f title="$1" 2>/dev/null | grep -q "title" && echo "  ✓ Milestone: $1" || echo "  ! Milestone may already exist: $1"
}

create_milestone "Backend & Infra"
create_milestone "Film Discovery"
create_milestone "Streaming Info"
create_milestone "UI/UX"
create_milestone "User & Auth"

echo ""
echo "Creating labels..."

create_label() {
  gh label create "$1" --color "$2" --description "$3" 2>/dev/null && echo "  ✓ Label: $1" || echo "  ! Label may already exist: $1"
}

create_label "infra"      "8b5cf6" "Infrastructure and setup"
create_label "feature"    "3b82f6" "New feature"
create_label "algorithm"  "ec4899" "Recommendation algorithm"
create_label "testing"    "10b981" "Testing and validation"

echo ""
echo "Creating issues..."

create_issue() {
  TITLE=$1
  MILESTONE=$2
  shift 2
  LABELS=$@

  LABEL_ARGS=""
  for label in $LABELS; do
    LABEL_ARGS="$LABEL_ARGS --label $label"
  done

  $GH --title "$TITLE" --milestone "$MILESTONE" $LABEL_ARGS --body "" && echo "  ✓ $TITLE" || echo "  ✗ Failed: $TITLE"
}

# ── Backend & Infra ────────────────────────────────────────────────
create_issue "Set up React Native + Expo project structure" "Backend & Infra" infra
create_issue "Configure Supabase — auth, user profiles, preferences table" "Backend & Infra" infra
create_issue "Set up Firebase for push notifications" "Backend & Infra" infra

# ── Film Discovery ─────────────────────────────────────────────────
create_issue "Integrate movie API — fetch metadata (title, genre, poster)" "Film Discovery" feature infra
create_issue "Handle API errors gracefully — no crashes (NFR4)" "Film Discovery" feature
create_issue "Implement swipe-based interaction (like/dislike)" "Film Discovery" feature
create_issue "Store user likes/dislikes in Supabase" "Film Discovery" feature
create_issue "Design core recommendation algorithm — scoring logic and architecture" "Film Discovery" algorithm
create_issue "Algorithm — genre matching" "Film Discovery" algorithm
create_issue "Algorithm — actor/director preference scoring" "Film Discovery" algorithm
create_issue "Algorithm — movie length filtering" "Film Discovery" algorithm
create_issue "Algorithm — release year preference" "Film Discovery" algorithm
create_issue "Algorithm — combine all parameters into final recommendation score" "Film Discovery" algorithm
create_issue "Filter out already-rejected movies from recommendations (FR8)" "Film Discovery" feature
create_issue "Build home / recommendation feed screen" "Film Discovery" feature

# ── Streaming Info ─────────────────────────────────────────────────
create_issue "Show streaming availability for recommended movies (FR11)" "Streaming Info" feature
create_issue "Implement search screen" "Streaming Info" feature

# ── UI/UX ──────────────────────────────────────────────────────────
create_issue "Visual consistency across all screens (NFR10)" "UI/UX" feature
create_issue "Implement bookmark screen (FR10)" "UI/UX" feature
create_issue "Responsive layout on Android and iOS (NFR8)" "UI/UX" feature testing
create_issue "Usability evaluation — test med eksterne brukere" "UI/UX" testing

# ── User & Auth ────────────────────────────────────────────────────
create_issue "Build signup / login screens" "User & Auth" feature
create_issue "Build profile and preferences screen (FR6, FR7)" "User & Auth" feature
create_issue "Persist user preferences between sessions (FR3)" "User & Auth" feature
create_issue "Allow user to view stored personal data (FR7)" "User & Auth" feature

echo ""
echo "Done! All issues created."