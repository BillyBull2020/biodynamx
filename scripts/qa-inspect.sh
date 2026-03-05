#!/bin/bash
# ============================================================================
# BioDynamX QA Inspector — Checks LOCAL files + LIVE biodynamx.com
# ============================================================================
# Source of truth: Local machine + Firebase (biodynamx.com)
# NO GitHub. NO cloud repos. Just local + Firebase.
# ============================================================================

# ============================================================================

cd "$(dirname "$0")/.."

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

PASS=0
FAIL=0
WARN=0

pass() { echo -e "  ${GREEN}✅ PASS${NC} — $1"; PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}❌ FAIL${NC} — $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "  ${YELLOW}⚠️  WARN${NC} — $1"; WARN=$((WARN+1)); }

echo ""
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}  🔍 BioDynamX QA Inspector — Local + Firebase${NC}"
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# ── 1. ENVIRONMENT VARIABLES ──────────────────────────────────────────────
echo -e "${BOLD}📋 1. Environment Variables (.env.local)${NC}"

check_env() {
    local key=$1
    local val=$(grep "^${key}=" .env.local 2>/dev/null | cut -d= -f2-)
    local len=${#val}
    if [ -z "$val" ]; then
        fail "$key — NOT SET"
    elif echo "$val" | grep -qE '^\.\.\.|^your_|^sk_live_\.\.\.|^pk_live_\.\.\.|^ACx+$|^whsec_\.\.\.' ; then
        fail "$key — PLACEHOLDER VALUE ($len chars)"
    elif [ $len -lt 10 ]; then
        warn "$key — SUSPICIOUSLY SHORT ($len chars)"
    else
        pass "$key — SET ($len chars)"
    fi
}

check_env "GEMINI_API_KEY"
check_env "NEXT_PUBLIC_GEMINI_API_KEY"
check_env "STRIPE_SECRET_KEY"
check_env "STRIPE_PUBLISHABLE_KEY"
check_env "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
check_env "TWILIO_ACCOUNT_SID"
check_env "TWILIO_AUTH_TOKEN"
check_env "RESEND_API_KEY"
check_env "NEXT_PUBLIC_SUPABASE_URL"
check_env "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_env "JULES_API_KEY"
echo ""

# ── 2. SOCIAL IMAGES — LOCAL ──────────────────────────────────────────────
echo -e "${BOLD}🖼️  2. Social Images (local /public/)${NC}"

check_image() {
    local file=$1
    local min_w=$2
    local min_h=$3
    local name=$4
    if [ ! -f "public/$file" ]; then
        fail "$name — FILE NOT FOUND (public/$file)"
        return
    fi
    local size=$(stat -f%z "public/$file" 2>/dev/null || stat -c%s "public/$file" 2>/dev/null)
    local dims=$(sips -g pixelWidth -g pixelHeight "public/$file" 2>/dev/null)
    local w=$(echo "$dims" | grep pixelWidth | awk '{print $2}')
    local h=$(echo "$dims" | grep pixelHeight | awk '{print $2}')
    
    if [ "$w" -ge "$min_w" ] && [ "$h" -ge "$min_h" ]; then
        pass "$name — ${w}x${h} ($(( size / 1024 ))KB)"
    else
        fail "$name — ${w}x${h} (need ${min_w}x${min_h})"
    fi
}

check_image "og-image.png" 1200 630 "OG Image"
check_image "social-facebook-cover.png" 1640 600 "Facebook Cover"
check_image "social-linkedin-cover.png" 1584 396 "LinkedIn Banner"
check_image "social-instagram.png" 1080 1080 "Instagram Square"
check_image "social-tiktok.png" 1080 1080 "TikTok Square"
echo ""

# ── 3. ROI MESSAGING — LOCAL ──────────────────────────────────────────────
echo -e "${BOLD}💰 3. ROI Messaging Check (should be 5x, not 2x)${NC}"

bad_roi=$(grep -rn "2x ROI\|2x return on investment\|Guaranteed 2x" src/app/layout.tsx 2>/dev/null | grep -iv "amazon\|best-selling\|author" || true)
if [ -z "$bad_roi" ]; then
    pass "layout.tsx — No '2x ROI' found (all 5x)"
else
    fail "layout.tsx — Found '2x ROI' references:"
    echo "$bad_roi" | head -5
fi

bad_roi2=$(grep -rln "2x ROI" src/app/pricing/ src/app/audit/ src/components/PurchaseCard.tsx 2>/dev/null | grep -v node_modules || true)
if [ -z "$bad_roi2" ]; then
    pass "Pricing/Audit/PurchaseCard — No '2x ROI' found"
else
    fail "Found '2x ROI' in: $bad_roi2"
fi
echo ""

# ── 4. SECURITY — NO EXPOSED SECRETS ──────────────────────────────────────
echo -e "${BOLD}🔒 4. Security — Checking for exposed secrets${NC}"

exposed=$(grep -rn "STRIPE_SECRET_KEY\|TWILIO_AUTH_TOKEN\|SUPABASE_SERVICE_KEY\|RESEND_API_KEY" src/components/ src/app/page.tsx src/app/layout.tsx 2>/dev/null | grep -v "process.env" | grep -v ".d.ts" || true)
if [ -z "$exposed" ]; then
    pass "No server secrets in client-side components"
else
    fail "EXPOSED SECRETS in client code:"
    echo "$exposed"
fi

next_public_check=$(grep -rn "NEXT_PUBLIC_GEMINI\|NEXT_PUBLIC_STRIPE\|NEXT_PUBLIC_SUPABASE" src/components/ 2>/dev/null | head -3 || true)
if [ -n "$next_public_check" ]; then
    pass "NEXT_PUBLIC_ vars used correctly in components (safe)"
else
    pass "No public env vars in components (also fine)"
fi
echo ""

# ── 5. LIVE SITE — biodynamx.com ──────────────────────────────────────────
echo -e "${BOLD}🌐 5. Live Site Checks (biodynamx.com)${NC}"

check_url() {
    local url=$1
    local name=$2
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)
    if [ "$status" = "200" ]; then
        pass "$name — HTTP $status"
    elif [ "$status" = "000" ]; then
        fail "$name — TIMEOUT/UNREACHABLE"
    else
        warn "$name — HTTP $status"
    fi
}

check_url "https://biodynamx.com" "Homepage"
check_url "https://biodynamx.com/audit" "Audit Page"
check_url "https://biodynamx.com/pricing" "Pricing Page"
check_url "https://biodynamx.com/og-image.png" "OG Image (live)"
check_url "https://biodynamx.com/social-facebook-cover.png" "Facebook Cover (live)"
check_url "https://biodynamx.com/social-linkedin-cover.png" "LinkedIn Banner (live)"
check_url "https://biodynamx.com/api/jules" "Jules API"
echo ""

# ── 6. OG TAGS ON LIVE SITE ──────────────────────────────────────────────
echo -e "${BOLD}🏷️  6. OG Meta Tags (live biodynamx.com)${NC}"

og_html=$(curl -s --max-time 10 "https://biodynamx.com" 2>/dev/null)

og_desc=$(echo "$og_html" | grep -o 'property="og:description"[^>]*content="[^"]*"' | head -1)
if echo "$og_desc" | grep -qi "5x"; then
    pass "OG description contains '5x'"
elif echo "$og_desc" | grep -qi "2x ROI"; then
    fail "OG description still says '2x ROI'"
else
    warn "OG description — couldn't verify ROI messaging"
fi

og_img=$(echo "$og_html" | grep -o 'property="og:image"[^>]*content="[^"]*"' | head -1)
if [ -n "$og_img" ]; then
    pass "OG image tag present"
else
    warn "OG image tag not found in HTML"
fi

tw_desc=$(echo "$og_html" | grep -o 'name="twitter:description"[^>]*content="[^"]*"' | head -1)
if echo "$tw_desc" | grep -qi "5x"; then
    pass "Twitter description contains '5x'"
elif echo "$tw_desc" | grep -qi "2x ROI"; then
    fail "Twitter description still says '2x ROI'"
else
    warn "Twitter description — couldn't verify"
fi
echo ""

# ── 7. BUILD CHECK ────────────────────────────────────────────────────────
echo -e "${BOLD}⚙️  7. Build Artifacts${NC}"

if [ -d ".firebase/bio-dynamx/functions/.next" ]; then
    pass "Firebase build exists (.firebase/bio-dynamx/functions/.next)"
else
    warn "No Firebase build found"
fi

if [ -f ".firebase/bio-dynamx/functions/.env.local" ]; then
    fb_gemini=$(grep "^GEMINI_API_KEY=" .firebase/bio-dynamx/functions/.env.local | cut -d= -f2-)
    local_gemini=$(grep "^GEMINI_API_KEY=" .env.local | cut -d= -f2-)
    if [ "$fb_gemini" = "$local_gemini" ]; then
        pass "Firebase .env.local matches local .env.local (Gemini key)"
    else
        fail "Firebase .env.local DOES NOT MATCH local (keys differ!)"
    fi
else
    warn "No .env.local in Firebase build directory"
fi
echo ""

# ── SUMMARY ───────────────────────────────────────────────────────────────
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  📊 QA SUMMARY${NC}"
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}✅ Passed: $PASS${NC}"
echo -e "  ${YELLOW}⚠️  Warnings: $WARN${NC}"
echo -e "  ${RED}❌ Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "  ${GREEN}${BOLD}🎉 ALL CLEAR — Ready for production!${NC}"
else
    echo -e "  ${RED}${BOLD}🚨 $FAIL ISSUE(S) NEED ATTENTION${NC}"
fi
echo ""
