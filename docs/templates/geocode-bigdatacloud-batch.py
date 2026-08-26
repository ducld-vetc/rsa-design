#!/usr/bin/env python3
"""Reverse geocode via BigDataCloud (curl) — ưu tiên lat/lng cho trạm V2/thiếu huyện."""
import json, math, subprocess, time, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / "geocode-unmapped-results.json"
STATIONS_TS = ROOT / "pages/station-coverage/stationCoverageFromDb.ts"

def plottable(lat, lng):
    if lat is None or lng is None: return False
    if not (8.35 <= lat <= 23.45 and 102.12 <= lng <= 109.55): return False
    if abs(lat - round(lat)) < 1e-6 and abs(lng - round(lng)) < 1e-6: return False
    return True

def load_stations():
    text = STATIONS_TS.read_text()
    marker = "export const DB_STATIONS"
    assign = text.index(marker)
    start = text.index("\n[", assign)
    end = text.index("] as DbStationRow", start)
    return json.loads(text[start:end + 1])

def bdc(lat, lon):
    url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lon}&localityLanguage=vi"
    # Dùng proxy Cursor khi có; retry khi 403
    last_err = None
    for attempt in range(4):
        r = subprocess.run(
            ["curl", "-sS", "--max-time", "25", url],
            capture_output=True,
            text=True,
        )
        if r.returncode == 0 and r.stdout.strip().startswith("{"):
            return json.loads(r.stdout)
        last_err = (r.stderr or r.stdout or "curl failed").strip()
        time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(last_err or "curl failed")

def tokens_from(geo):
    toks = []
    def push(field, raw):
        if raw: toks.append(f"{field}={raw}")
    push("locality", geo.get("locality"))
    push("city", geo.get("city"))
    push("province", geo.get("principalSubdivision"))
    push("country", geo.get("countryName"))
    for a in (geo.get("localityInfo") or {}).get("administrative") or []:
        lvl = a.get("adminLevel") or 0
        name = a.get("name")
        if name and lvl >= 5:
            push(f"admin{lvl}", name)
        elif name and lvl > 3:
            push("admin", name)
    return toks

def main():
    existing = []
    if OUT.exists():
        existing = [r for r in json.loads(OUT.read_text()) if r.get("display_name") and not r.get("error")]
    have = {str(r["id"]) for r in existing}
    stations = load_stations()
    todo = []
    for s in stations:
        if str(s["id"]) in have: continue
        if not plottable(s.get("latitude"), s.get("longitude")): continue
        d = (s.get("districtCode") or "").strip()
        p = (s.get("precinctCode") or "").strip()
        if (not d) or re.fullmatch(r"\d{1,2}", d) or re.fullmatch(r"\d{5}", p):
            todo.append(s)
    print(f"Have OK: {len(existing)}; todo: {len(todo)}", flush=True)
    results = list(existing)
    for i, s in enumerate(todo, 1):
        print(f"[{i}/{len(todo)}] {s.get('code')} ... ", end="", flush=True)
        try:
            geo = bdc(s["latitude"], s["longitude"])
            cc = (geo.get("countryCode") or "").lower()
            display = ", ".join(filter(None, [geo.get("locality"), geo.get("city"), geo.get("principalSubdivision"), geo.get("countryName")]))
            results.append({
                "id": s["id"],
                "code": s.get("code"),
                "address": s.get("address"),
                "display_name": display,
                "tokens": tokens_from(geo),
                "country_code": cc,
                "preferredProvince": s.get("provinceCode"),
                "provider": "bigdatacloud",
            })
            print(f"{cc or '?'} · {geo.get('locality') or '-'} / {geo.get('city') or '-'}", flush=True)
        except Exception as e:
            results.append({"id": s["id"], "code": s.get("code"), "error": str(e), "provider": "bigdatacloud"})
            print(f"ERR {e}", flush=True)
            time.sleep(1.5)
        time.sleep(0.15)
        if i % 100 == 0:
            OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2))
            print(f"checkpoint {len(results)}", flush=True)
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    ok = sum(1 for r in results if r.get("display_name") and not r.get("error"))
    err = sum(1 for r in results if r.get("error"))
    print(json.dumps({"total": len(results), "ok": ok, "err": err}, ensure_ascii=False), flush=True)

if __name__ == "__main__":
    main()
