/**
 * Override Địa chỉ cũ (reverse-map + address_new cho Chưa gán huyện).
 * key = String(rescue_station_id)
 * districtCode: '' = chỉ gán tỉnh, clear huyện/xã
 */
export interface StationAdminOverride {
  provinceCode?: string;
  districtCode: string;
  precinctCode?: string;
}

export const STATION_ADMIN_OVERRIDES: Record<string, StationAdminOverride> = {
  "1": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "TDON"
  },
  "2": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "BODE"
  },
  "3": {
    "provinceCode": "HNO",
    "districtCode": "SSO",
    "precinctCode": "BPHU"
  },
  "4": {
    "provinceCode": "VLO",
    "districtCode": "LHO",
    "precinctCode": "THAN"
  },
  "5": {
    "provinceCode": "TTH",
    "districtCode": "QPXU",
    "precinctCode": "PKLO"
  },
  "6": {
    "provinceCode": "LDO",
    "districtCode": "DTR",
    "precinctCode": "DLOA"
  },
  "7": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "0009"
  },
  "8": {
    "provinceCode": "QNI",
    "districtCode": "CPH",
    "precinctCode": "MDUO"
  },
  "9": {
    "provinceCode": "BTH",
    "districtCode": "PTH",
    "precinctCode": "XUAN"
  },
  "10": {
    "provinceCode": "QBI",
    "districtCode": "BTR",
    "precinctCode": "STRA"
  },
  "11": {
    "provinceCode": "LDO",
    "districtCode": "BLO",
    "precinctCode": "LPHA"
  },
  "12": {
    "provinceCode": "HCM",
    "districtCode": "BCH",
    "precinctCode": "ALAC"
  },
  "13": {
    "provinceCode": "QBI",
    "districtCode": "BTR",
    "precinctCode": "PTRA"
  },
  "14": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "HLIN"
  },
  "15": {
    "provinceCode": "TQU",
    "districtCode": "TQU",
    "precinctCode": "TQUA"
  },
  "16": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "TTHI"
  },
  "17": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "VHUN"
  },
  "18": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "DVIN"
  },
  "19": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "LENIN"
  },
  "20": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "GSAN"
  },
  "21": {
    "provinceCode": "VPH",
    "districtCode": "VYE",
    "precinctCode": "NQUY"
  },
  "22": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNT"
  },
  "23": {
    "provinceCode": "HPH",
    "districtCode": "HAN",
    "precinctCode": "LDU"
  },
  "24": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "AHOI"
  },
  "25": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "TCHA"
  },
  "26": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "TAAN"
  },
  "27": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "VHUN"
  },
  "28": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "TMA0"
  },
  "29": {
    "provinceCode": "HNO",
    "districtCode": "BTL",
    "precinctCode": "DNGA"
  },
  "30": {
    "provinceCode": "NDI",
    "districtCode": "NDI",
    "precinctCode": "NML"
  },
  "31": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "HYEN"
  },
  "32": {
    "provinceCode": "HBI",
    "districtCode": "HBI",
    "precinctCode": "HBIN"
  },
  "33": {
    "provinceCode": "BGI",
    "districtCode": "BGI",
    "precinctCode": "HVTH"
  },
  "34": {
    "provinceCode": "THO",
    "districtCode": "DSO",
    "precinctCode": "DQUA"
  },
  "35": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "DCUN"
  },
  "36": {
    "provinceCode": "HTI",
    "districtCode": "CXU",
    "precinctCode": "CBIN"
  },
  "37": {
    "provinceCode": "HCM",
    "districtCode": "007",
    "precinctCode": "BTHU"
  },
  "38": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "TAPH"
  },
  "39": {
    "provinceCode": "BRV",
    "districtCode": "BRI",
    "precinctCode": "LHUO"
  },
  "40": {
    "provinceCode": "BRV",
    "districtCode": "VTA",
    "precinctCode": "0006"
  },
  "41": {
    "provinceCode": "CTH",
    "districtCode": "CRA",
    "precinctCode": "HPHU"
  },
  "42": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HPH0"
  },
  "43": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "VTHN"
  },
  "45": {
    "provinceCode": "BDU",
    "districtCode": "TAN",
    "precinctCode": "BHOA"
  },
  "46": {
    "provinceCode": "BPH",
    "districtCode": "PLN",
    "precinctCode": "BPHU"
  },
  "47": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "ETAM"
  },
  "49": {
    "provinceCode": "QNI",
    "districtCode": "DHA",
    "precinctCode": "QTAN"
  },
  "50": {
    "provinceCode": "BRV",
    "districtCode": "XMO",
    "precinctCode": "HHOI"
  },
  "51": {
    "provinceCode": "QNI",
    "districtCode": "QHA",
    "precinctCode": "QTAN"
  },
  "52": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "QBAU"
  },
  "53": {
    "provinceCode": "KHO",
    "districtCode": "CRA",
    "precinctCode": "CHDO"
  },
  "54": {
    "provinceCode": "QNI",
    "districtCode": "QHA",
    "precinctCode": "DAHA"
  },
  "55": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "ANGH"
  },
  "56": {
    "provinceCode": "GLA",
    "districtCode": "PLE",
    "precinctCode": "DHON"
  },
  "57": {
    "provinceCode": "QNI",
    "districtCode": "CPH",
    "precinctCode": "CONG"
  },
  "58": {
    "provinceCode": "GLA",
    "districtCode": "CSE",
    "precinctCode": "IPAL"
  },
  "59": {
    "provinceCode": "BNI",
    "districtCode": "QVO",
    "precinctCode": "LIEU"
  },
  "60": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "HTHA"
  },
  "61": {
    "provinceCode": "DNI",
    "districtCode": "TBO",
    "precinctCode": "HTHI"
  },
  "62": {
    "provinceCode": "CTH",
    "districtCode": "TNO",
    "precinctCode": "TNOT"
  },
  "63": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "XHL"
  },
  "64": {
    "provinceCode": "NAN",
    "districtCode": "QLU",
    "precinctCode": "HMA0"
  },
  "65": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNA"
  },
  "66": {
    "provinceCode": "HNO",
    "districtCode": "DPH",
    "precinctCode": "PDIN"
  },
  "67": {
    "provinceCode": "QTR",
    "districtCode": "VLI",
    "precinctCode": "VTHU"
  },
  "68": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "VCUO"
  },
  "70": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "TADO"
  },
  "71": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "DODA"
  },
  "72": {
    "provinceCode": "TBI",
    "districtCode": "TTH",
    "precinctCode": "TTHU"
  },
  "73": {
    "provinceCode": "DTH",
    "districtCode": "CTH",
    "precinctCode": "PLON"
  },
  "74": {
    "provinceCode": "TGI",
    "districtCode": "CTH",
    "precinctCode": "LHUN"
  },
  "75": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "TQDI"
  },
  "76": {
    "provinceCode": "HGI",
    "districtCode": "VTA",
    "precinctCode": "VTAN"
  },
  "77": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "PCUO"
  },
  "78": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "PNH"
  },
  "79": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "0SAI"
  },
  "80": {
    "provinceCode": "TNI",
    "districtCode": "BCA",
    "precinctCode": "LTHU"
  },
  "81": {
    "provinceCode": "VLO",
    "districtCode": "LHO",
    "precinctCode": "PHAU"
  },
  "82": {
    "provinceCode": "LDO",
    "districtCode": "DTR",
    "precinctCode": "PHOI"
  },
  "83": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "84": {
    "provinceCode": "HPH",
    "districtCode": "KAN",
    "precinctCode": "BSON"
  },
  "85": {
    "provinceCode": "LDO",
    "districtCode": "DTR",
    "precinctCode": "LNGH"
  },
  "86": {
    "provinceCode": "HYE",
    "districtCode": "TPHYEN",
    "precinctCode": "PVP"
  },
  "87": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNA"
  },
  "88": {
    "provinceCode": "BNI",
    "districtCode": "TDU",
    "precinctCode": "DDON"
  },
  "89": {
    "provinceCode": "BPH",
    "districtCode": "PLN",
    "precinctCode": "BPHU"
  },
  "90": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "0011"
  },
  "91": {
    "provinceCode": "HNO",
    "districtCode": "SSO",
    "precinctCode": "MTRI"
  },
  "92": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "XHL"
  },
  "93": {
    "provinceCode": "PTH",
    "districtCode": "VTR",
    "precinctCode": "BHAC"
  },
  "94": {
    "provinceCode": "HCM",
    "districtCode": "002",
    "precinctCode": "CLAI"
  },
  "95": {
    "provinceCode": "CMA",
    "districtCode": "CMA",
    "precinctCode": "LVLA"
  },
  "96": {
    "provinceCode": "PTH",
    "districtCode": "HHO",
    "precinctCode": "YEKY"
  },
  "97": {
    "provinceCode": "DTH",
    "districtCode": "CAH",
    "precinctCode": "HTHU"
  },
  "98": {
    "provinceCode": "QNI",
    "districtCode": "YHU",
    "precinctCode": "DMAI"
  },
  "100": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "CXAN"
  },
  "101": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "DCON"
  },
  "102": {
    "provinceCode": "HNO",
    "districtCode": "TXU",
    "precinctCode": "KDIN"
  },
  "103": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "TNHA"
  },
  "104": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "HCHA"
  },
  "105": {
    "provinceCode": "QBI",
    "districtCode": "DHO",
    "precinctCode": "BNGH"
  },
  "106": {
    "provinceCode": "GLA",
    "districtCode": "IGR",
    "precinctCode": "IHRU"
  },
  "107": {
    "provinceCode": "TTH",
    "districtCode": "QTH",
    "precinctCode": "PACU"
  },
  "108": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "TLDA"
  },
  "109": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "LTRU"
  },
  "110": {
    "provinceCode": "STR",
    "districtCode": "MTU",
    "precinctCode": "HPHU"
  },
  "111": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "112": {
    "provinceCode": "VLO",
    "districtCode": "VLO",
    "precinctCode": "0002"
  },
  "113": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "HTHA"
  },
  "114": {
    "provinceCode": "BRV",
    "districtCode": "BRI",
    "precinctCode": "LTOA"
  },
  "115": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "HTHA"
  },
  "116": {
    "provinceCode": "HNO",
    "districtCode": "SSO",
    "precinctCode": "TXUA"
  },
  "117": {
    "provinceCode": "GLA",
    "districtCode": "PLE",
    "precinctCode": "TSO0"
  },
  "118": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "BCHI"
  },
  "119": {
    "provinceCode": "TQU",
    "districtCode": "TQU",
    "precinctCode": "MXUA"
  },
  "120": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "DNAI"
  },
  "121": {
    "provinceCode": "BLI",
    "districtCode": "VLO",
    "precinctCode": "VIMB"
  },
  "122": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "QDON"
  },
  "123": {
    "provinceCode": "HTI",
    "districtCode": "CXU",
    "precinctCode": "CBIN"
  },
  "124": {
    "provinceCode": "DNI",
    "districtCode": "XLO",
    "precinctCode": "XHUN"
  },
  "125": {
    "provinceCode": "CBA",
    "districtCode": "CBA"
  },
  "126": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "NGAN"
  },
  "127": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TLUO"
  },
  "128": {
    "provinceCode": "LCA",
    "districtCode": "LCA",
    "precinctCode": "NCUO"
  },
  "129": {
    "provinceCode": "KGI",
    "districtCode": "RGI",
    "precinctCode": "VLOI"
  },
  "130": {
    "provinceCode": "GLA",
    "districtCode": "PLE",
    "precinctCode": "DHON"
  },
  "131": {
    "provinceCode": "BGI",
    "districtCode": "BGI",
    "precinctCode": "DITR"
  },
  "132": {
    "provinceCode": "AGI",
    "districtCode": "LXU",
    "precinctCode": "MTHO"
  },
  "133": {
    "provinceCode": "AGI",
    "districtCode": "LXU",
    "precinctCode": "MTHA"
  },
  "134": {
    "provinceCode": "BGI",
    "districtCode": "TYE",
    "precinctCode": "NTHI"
  },
  "135": {
    "provinceCode": "HNO",
    "districtCode": "CMY",
    "precinctCode": "LDIE"
  },
  "136": {
    "provinceCode": "HNO",
    "districtCode": "DPH",
    "precinctCode": "HOHA"
  },
  "137": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "HBAN"
  },
  "138": {
    "provinceCode": "BGI",
    "districtCode": "BGI",
    "precinctCode": "SKHE"
  },
  "139": {
    "provinceCode": "LCA",
    "districtCode": "LCA",
    "precinctCode": "CDUO"
  },
  "140": {
    "provinceCode": "BTR",
    "districtCode": "CTH",
    "precinctCode": "QSON"
  },
  "141": {
    "provinceCode": "HNO",
    "districtCode": "GLA",
    "precinctCode": "XBDE"
  },
  "142": {
    "provinceCode": "BNI",
    "districtCode": "YPH",
    "precinctCode": "TADA"
  },
  "143": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "NGLO"
  },
  "144": {
    "provinceCode": "BDI",
    "districtCode": "HNH",
    "precinctCode": "HTHA"
  },
  "145": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "PTHUN"
  },
  "146": {
    "provinceCode": "HNO",
    "districtCode": "BTL",
    "precinctCode": "PDIE"
  },
  "147": {
    "provinceCode": "YBA",
    "districtCode": "YBA",
    "precinctCode": "ALAU"
  },
  "148": {
    "provinceCode": "DBI",
    "districtCode": "DBI",
    "precinctCode": "THAN"
  },
  "149": {
    "provinceCode": "BDU",
    "districtCode": "TXTU",
    "precinctCode": "PVT"
  },
  "150": {
    "provinceCode": "BDU",
    "districtCode": "TPDAN",
    "precinctCode": "TDHI"
  },
  "151": {
    "provinceCode": "BDU",
    "districtCode": "TPTAN",
    "precinctCode": "TDHI"
  },
  "152": {
    "provinceCode": "DLA",
    "districtCode": "KNA",
    "precinctCode": "KNAN"
  },
  "153": {
    "provinceCode": "SLA",
    "districtCode": "SLA",
    "precinctCode": "CHAN"
  },
  "154": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "VHUN"
  },
  "155": {
    "provinceCode": "QNI",
    "districtCode": "TXDTR",
    "precinctCode": "PMKHE"
  },
  "156": {
    "provinceCode": "QNI",
    "districtCode": "CPH",
    "precinctCode": "CONG"
  },
  "157": {
    "provinceCode": "BDU",
    "districtCode": "BBA",
    "precinctCode": "THUN"
  },
  "158": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "NDON"
  },
  "159": {
    "provinceCode": "CMA",
    "districtCode": "CNU",
    "precinctCode": "LTTR"
  },
  "160": {
    "provinceCode": "SLA",
    "districtCode": "MCH",
    "precinctCode": "MUTE"
  },
  "161": {
    "provinceCode": "STR",
    "districtCode": "STR",
    "precinctCode": "0002"
  },
  "162": {
    "provinceCode": "DNO",
    "districtCode": "CJU",
    "precinctCode": "TSON"
  },
  "163": {
    "provinceCode": "LCH",
    "districtCode": "LCH",
    "precinctCode": "TPHO"
  },
  "164": {
    "provinceCode": "GLA",
    "districtCode": "AKH",
    "precinctCode": "APHU"
  },
  "165": {
    "provinceCode": "LCH",
    "districtCode": "LCH",
    "precinctCode": "TPHO"
  },
  "166": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "NGDO"
  },
  "167": {
    "provinceCode": "QBI",
    "districtCode": "DHO",
    "precinctCode": "PHAI"
  },
  "168": {
    "provinceCode": "DNI",
    "districtCode": "LTH",
    "precinctCode": "TPHO"
  },
  "169": {
    "provinceCode": "HCM",
    "districtCode": "BTA",
    "precinctCode": "BTDO"
  },
  "171": {
    "provinceCode": "STR",
    "districtCode": "STR",
    "precinctCode": "0010"
  },
  "173": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TLUO"
  },
  "174": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "MKHA"
  },
  "175": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "TAAN"
  },
  "176": {
    "provinceCode": "NAN",
    "districtCode": "QLU",
    "precinctCode": "QNGH"
  },
  "177": {
    "provinceCode": "HCM",
    "districtCode": "009",
    "precinctCode": "LPHU"
  },
  "178": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "VG"
  },
  "179": {
    "provinceCode": "BPH",
    "districtCode": "PLN",
    "precinctCode": "LTAN"
  },
  "180": {
    "provinceCode": "HNO",
    "districtCode": "DAN",
    "precinctCode": "VHUN"
  },
  "181": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "AKHA"
  },
  "182": {
    "provinceCode": "AGI",
    "districtCode": "LXU",
    "precinctCode": "MBIN"
  },
  "183": {
    "provinceCode": "AGI",
    "districtCode": "LXU",
    "precinctCode": "MLON"
  },
  "184": {
    "provinceCode": "LAN",
    "districtCode": "TTA",
    "precinctCode": "TNIN"
  },
  "185": {
    "provinceCode": "HCM",
    "districtCode": "TPH",
    "precinctCode": "TTHN"
  },
  "186": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "HKHE"
  },
  "187": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "NPHU"
  },
  "188": {
    "provinceCode": "GLA",
    "districtCode": "AKH",
    "precinctCode": "APHU"
  },
  "189": {
    "provinceCode": "STR",
    "districtCode": "MTU",
    "precinctCode": "HPHU"
  },
  "191": {
    "provinceCode": "QNA",
    "districtCode": "TKY",
    "precinctCode": "APHU"
  },
  "192": {
    "provinceCode": "GLA",
    "districtCode": "PLE",
    "precinctCode": "APHU"
  },
  "193": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HPH0"
  },
  "194": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "NDUO"
  },
  "195": {
    "provinceCode": "DNA",
    "districtCode": "HCH",
    "precinctCode": "HTTA"
  },
  "196": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "BHAN"
  },
  "197": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HKHA"
  },
  "198": {
    "provinceCode": "QNA",
    "districtCode": "DXU",
    "precinctCode": "NPHU"
  },
  "199": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "TYEN"
  },
  "200": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "VTAN"
  },
  "201": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "PNH"
  },
  "202": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "0002"
  },
  "203": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "GRAN"
  },
  "204": {
    "provinceCode": "QNA",
    "districtCode": "TKY",
    "precinctCode": "ANMY"
  },
  "205": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "BTXU"
  },
  "206": {
    "provinceCode": "KGI",
    "districtCode": "CTH",
    "precinctCode": "MOTB"
  },
  "207": {
    "provinceCode": "CTH",
    "districtCode": "BTH",
    "precinctCode": "BTHU"
  },
  "208": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "NCHA"
  },
  "209": {
    "provinceCode": "KON",
    "districtCode": "KOT",
    "precinctCode": "DCAM"
  },
  "210": {
    "provinceCode": "LAN",
    "districtCode": "CGI",
    "precinctCode": "LOAN"
  },
  "211": {
    "provinceCode": "TNI",
    "districtCode": "CTH",
    "precinctCode": "TDIE"
  },
  "212": {
    "provinceCode": "BTH",
    "districtCode": "PTH",
    "precinctCode": "DNGH"
  },
  "213": {
    "provinceCode": "HCM",
    "districtCode": "012",
    "precinctCode": "THAN"
  },
  "214": {
    "provinceCode": "HNA",
    "districtCode": "TLI",
    "precinctCode": "THHA"
  },
  "215": {
    "provinceCode": "STR",
    "districtCode": "STR",
    "precinctCode": "0002"
  },
  "216": {
    "provinceCode": "STR",
    "districtCode": "STR",
    "precinctCode": "0003"
  },
  "217": {
    "provinceCode": "VLO",
    "districtCode": "VLO",
    "precinctCode": "0005"
  },
  "218": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "GRAN"
  },
  "219": {
    "provinceCode": "NDI",
    "districtCode": "YYE",
    "precinctCode": "YTHN"
  },
  "220": {
    "provinceCode": "VPH",
    "districtCode": "YLA",
    "precinctCode": "TELO"
  },
  "221": {
    "provinceCode": "TQU",
    "districtCode": "TQU",
    "precinctCode": "Y LA"
  },
  "222": {
    "provinceCode": "BLI",
    "districtCode": "BTP",
    "precinctCode": "VTRA"
  },
  "223": {
    "provinceCode": "DNO",
    "districtCode": "DRL",
    "precinctCode": "KDUC"
  },
  "224": {
    "provinceCode": "PTH",
    "districtCode": "VTR",
    "precinctCode": "NTRA"
  },
  "225": {
    "provinceCode": "TBI",
    "districtCode": "DHU",
    "precinctCode": "DHUN"
  },
  "226": {
    "provinceCode": "QNI",
    "districtCode": "UBI",
    "precinctCode": "BSON"
  },
  "227": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "ADON"
  },
  "228": {
    "provinceCode": "QNA",
    "districtCode": "TKY",
    "precinctCode": "TDA1"
  },
  "229": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNA"
  },
  "230": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "HALE"
  },
  "231": {
    "provinceCode": "QNA",
    "districtCode": "TKY",
    "precinctCode": "ASON"
  },
  "232": {
    "provinceCode": "DNO",
    "districtCode": "GNG",
    "precinctCode": "NTAN"
  },
  "233": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "ETAM"
  },
  "234": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "NGLO"
  },
  "235": {
    "provinceCode": "LDO",
    "districtCode": "DDU",
    "precinctCode": "LLAM"
  },
  "236": {
    "provinceCode": "THO",
    "districtCode": "QXU",
    "precinctCode": "QYEN"
  },
  "237": {
    "provinceCode": "TBI",
    "districtCode": "TBI",
    "precinctCode": "THDA"
  },
  "238": {
    "provinceCode": "HNO",
    "districtCode": "TLI",
    "precinctCode": "TAHO"
  },
  "239": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "DXUA"
  },
  "240": {
    "provinceCode": "QBI",
    "districtCode": "BTR",
    "precinctCode": "PTRA"
  },
  "241": {
    "provinceCode": "LCA",
    "districtCode": "SPA",
    "precinctCode": "SPA2"
  },
  "242": {
    "provinceCode": "HNO",
    "districtCode": "BDI",
    "precinctCode": "NGHA"
  },
  "243": {
    "provinceCode": "TBI",
    "districtCode": "TBI",
    "precinctCode": "THDA"
  },
  "244": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "HTHA"
  },
  "245": {
    "provinceCode": "CMA",
    "districtCode": "NHI",
    "precinctCode": "RGOC"
  },
  "246": {
    "provinceCode": "LAN",
    "districtCode": "TTA",
    "precinctCode": "TNIN"
  },
  "247": {
    "provinceCode": "LDO",
    "districtCode": "DTR",
    "precinctCode": "NLOA"
  },
  "248": {
    "provinceCode": "TNI",
    "districtCode": "CTH",
    "precinctCode": "HTHA"
  },
  "249": {
    "provinceCode": "BTH",
    "districtCode": "PTH",
    "precinctCode": "DNGH"
  },
  "250": {
    "provinceCode": "LCH",
    "districtCode": "LCH",
    "precinctCode": "DPHO"
  },
  "251": {
    "provinceCode": "HNO",
    "districtCode": "TXU",
    "precinctCode": "KDIN"
  },
  "252": {
    "provinceCode": "NAN",
    "districtCode": "HMA",
    "precinctCode": "MHUN"
  },
  "253": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "VTHH"
  },
  "254": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "TPHU"
  },
  "255": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "TTHO"
  },
  "256": {
    "provinceCode": "NBI",
    "districtCode": "YMO",
    "precinctCode": "YTH0"
  },
  "257": {
    "provinceCode": "LAN",
    "districtCode": "CGI",
    "precinctCode": "PHLY"
  },
  "258": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "PHAI"
  },
  "259": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "TTHA"
  },
  "260": {
    "provinceCode": "BPH",
    "districtCode": "PLN",
    "precinctCode": "BPHU"
  },
  "261": {
    "provinceCode": "HCM",
    "districtCode": "TPH",
    "precinctCode": "TTHN"
  },
  "262": {
    "provinceCode": "KON",
    "districtCode": "KOT",
    "precinctCode": "DCAM"
  },
  "263": {
    "provinceCode": "KGI",
    "districtCode": "CTH",
    "precinctCode": "MOTB"
  },
  "264": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HPH0"
  },
  "265": {
    "provinceCode": "QNA",
    "districtCode": "TKY",
    "precinctCode": "HTHU"
  },
  "266": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "DVAN"
  },
  "267": {
    "provinceCode": "TNI",
    "districtCode": "TNI",
    "precinctCode": "BMIN"
  },
  "268": {
    "provinceCode": "BRV",
    "districtCode": "VTA",
    "precinctCode": "0004"
  },
  "269": {
    "provinceCode": "BNI",
    "districtCode": "YPH",
    "precinctCode": "TADA"
  },
  "270": {
    "provinceCode": "HYE",
    "districtCode": "VGI",
    "precinctCode": "XQUA"
  },
  "271": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "HHTA"
  },
  "272": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "NAHA"
  },
  "273": {
    "provinceCode": "CMA",
    "districtCode": "CMA",
    "precinctCode": "LVLA"
  },
  "274": {
    "provinceCode": "GLA",
    "districtCode": "AKH",
    "precinctCode": "APHU"
  },
  "275": {
    "provinceCode": "NTH",
    "districtCode": "TNA",
    "precinctCode": "PDIN"
  },
  "276": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "TQTR"
  },
  "278": {
    "provinceCode": "HNA",
    "districtCode": "PLY",
    "precinctCode": "PVAN"
  },
  "279": {
    "provinceCode": "LAN",
    "districtCode": "CGI",
    "precinctCode": "LOAN"
  },
  "280": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "0003"
  },
  "281": {
    "provinceCode": "TQU",
    "districtCode": "TQU",
    "precinctCode": "MXUA"
  },
  "282": {
    "provinceCode": "HCM",
    "districtCode": "NBE",
    "precinctCode": "NHBE"
  },
  "283": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "THOA"
  },
  "284": {
    "provinceCode": "HCM",
    "districtCode": "TPH",
    "precinctCode": "TTHN"
  },
  "285": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "HTHA"
  },
  "286": {
    "provinceCode": "TNI",
    "districtCode": "TBI",
    "precinctCode": "THIE"
  },
  "287": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "KBAC"
  },
  "288": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "BCHI"
  },
  "289": {
    "provinceCode": "DNI",
    "districtCode": "TNH",
    "precinctCode": "DDAY"
  },
  "290": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "TLIE"
  },
  "291": {
    "provinceCode": "BDU",
    "districtCode": "TDM",
    "precinctCode": "CHMY"
  },
  "292": {
    "provinceCode": "SLA",
    "districtCode": "BYE",
    "precinctCode": "BYEN"
  },
  "293": {
    "provinceCode": "BDU",
    "districtCode": "TAN",
    "precinctCode": "HDIN"
  },
  "294": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "TLDA"
  },
  "295": {
    "provinceCode": "DNI",
    "districtCode": "LTH",
    "precinctCode": "PTHA"
  },
  "296": {
    "provinceCode": "HCM",
    "districtCode": "012",
    "precinctCode": "APDO"
  },
  "297": {
    "provinceCode": "CMA",
    "districtCode": "CMA",
    "precinctCode": "AXUY"
  },
  "298": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "DHON"
  },
  "299": {
    "provinceCode": "TNI",
    "districtCode": "TNI",
    "precinctCode": "NTHA"
  },
  "300": {
    "provinceCode": "HNO",
    "districtCode": "DAN",
    "precinctCode": "KCHU"
  },
  "301": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "LDAM"
  },
  "302": {
    "provinceCode": "KHO",
    "districtCode": "DKH",
    "precinctCode": "SHIE"
  },
  "303": {
    "provinceCode": "DNA",
    "districtCode": "HCH",
    "precinctCode": "HC"
  },
  "304": {
    "provinceCode": "HNO",
    "districtCode": "BDI",
    "precinctCode": "NGHA"
  },
  "305": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "NDUO"
  },
  "306": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "VTRU"
  },
  "307": {
    "provinceCode": "GLA",
    "districtCode": "PLE",
    "precinctCode": "TNHA"
  },
  "308": {
    "provinceCode": "DTH",
    "districtCode": "CTH",
    "precinctCode": "TNDO"
  },
  "309": {
    "provinceCode": "TTH",
    "districtCode": "HTH",
    "precinctCode": "TDUO"
  },
  "310": {
    "provinceCode": "TNI",
    "districtCode": "TBI",
    "precinctCode": "TBAC"
  },
  "311": {
    "provinceCode": "DBI",
    "districtCode": "DBI",
    "precinctCode": "TNUA"
  },
  "312": {
    "provinceCode": "VLO",
    "districtCode": "LHO",
    "precinctCode": "THAN"
  },
  "313": {
    "provinceCode": "HGI",
    "districtCode": "VTA",
    "precinctCode": "VTAN"
  },
  "314": {
    "provinceCode": "STR",
    "districtCode": "STR",
    "precinctCode": "0006"
  },
  "315": {
    "provinceCode": "BLI",
    "districtCode": "BLI",
    "precinctCode": "TPBLI"
  },
  "316": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNT"
  },
  "317": {
    "provinceCode": "HNO",
    "districtCode": "TXS",
    "precinctCode": "SDON"
  },
  "318": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "PVHOA"
  },
  "319": {
    "provinceCode": "BPH",
    "districtCode": "BGM",
    "precinctCode": "LBIN"
  },
  "320": {
    "provinceCode": "QNI",
    "districtCode": "CPH",
    "precinctCode": "CSON"
  },
  "321": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "BCHA"
  },
  "322": {
    "provinceCode": "HNO",
    "districtCode": "HDO",
    "precinctCode": "YNGH"
  },
  "325": {
    "provinceCode": "HNO",
    "districtCode": "TTR",
    "precinctCode": "TLIE"
  },
  "326": {
    "provinceCode": "BRV",
    "districtCode": "DDO",
    "precinctCode": "PTHA"
  },
  "327": {
    "provinceCode": "BTH",
    "districtCode": "HTH",
    "precinctCode": "TNAM"
  },
  "328": {
    "provinceCode": "BGI",
    "districtCode": "BGI",
    "precinctCode": "SMAI"
  },
  "329": {
    "provinceCode": "DLA",
    "districtCode": "EHL",
    "precinctCode": "EDRA"
  },
  "330": {
    "provinceCode": "QNA",
    "districtCode": "TKY"
  },
  "331": {
    "provinceCode": "TBI",
    "districtCode": "TBI",
    "precinctCode": "THDA"
  },
  "332": {
    "provinceCode": "QBI",
    "districtCode": "DHO",
    "precinctCode": "DHAI"
  },
  "333": {
    "provinceCode": "TQU",
    "districtCode": "TQU",
    "precinctCode": "MXUA"
  },
  "334": {
    "provinceCode": "KGI",
    "districtCode": "PQU",
    "precinctCode": "BTHO"
  },
  "335": {
    "provinceCode": "DNA",
    "districtCode": "HCH",
    "precinctCode": "HC"
  },
  "336": {
    "provinceCode": "PTH",
    "districtCode": "TTH",
    "precinctCode": "KHTHTHUY"
  },
  "337": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "GSAN"
  },
  "338": {
    "provinceCode": "PYE",
    "districtCode": "SCA",
    "precinctCode": "XLOC"
  },
  "339": {
    "provinceCode": "HDU",
    "districtCode": "CLI",
    "precinctCode": "TDAN"
  },
  "340": {
    "provinceCode": "DNA",
    "districtCode": "HCH",
    "precinctCode": "HC"
  },
  "341": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "PVHOA"
  },
  "342": {
    "provinceCode": "AGI",
    "districtCode": "LXU",
    "precinctCode": "MXUY"
  },
  "343": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "PDHUO"
  },
  "345": {
    "provinceCode": "BPH",
    "districtCode": "BDA",
    "precinctCode": "DNAI"
  },
  "346": {
    "provinceCode": "TTH",
    "districtCode": "HTR"
  },
  "347": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "NPHU"
  },
  "348": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "TPHU"
  },
  "349": {
    "provinceCode": "QNI",
    "districtCode": "MCA",
    "precinctCode": "TRCO"
  },
  "350": {
    "provinceCode": "HNO",
    "districtCode": "TLI",
    "precinctCode": "DNGA"
  },
  "351": {
    "provinceCode": "BRV",
    "districtCode": "BRI",
    "precinctCode": "LPHU"
  },
  "352": {
    "provinceCode": "TTH",
    "districtCode": "QPXU",
    "precinctCode": "PTHO"
  },
  "353": {
    "provinceCode": "BKA",
    "districtCode": "BCA",
    "precinctCode": "DXUA"
  },
  "354": {
    "provinceCode": "VLO",
    "districtCode": "VLO",
    "precinctCode": "THOA"
  },
  "356": {
    "provinceCode": "CBA",
    "districtCode": "CBA"
  },
  "357": {
    "provinceCode": "DNO",
    "districtCode": "GNG",
    "precinctCode": "NTRU"
  },
  "359": {
    "provinceCode": "DTH",
    "districtCode": "CAH",
    "precinctCode": "MNGA"
  },
  "360": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNA"
  },
  "361": {
    "provinceCode": "KGI",
    "districtCode": "RGI",
    "precinctCode": "VHIE"
  },
  "362": {
    "provinceCode": "TVI",
    "districtCode": "CTH",
    "precinctCode": "NHOA"
  },
  "363": {
    "provinceCode": "KON",
    "districtCode": "KOT",
    "precinctCode": "DCAM"
  },
  "365": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "0004"
  },
  "366": {
    "provinceCode": "SLA",
    "districtCode": "SLA",
    "precinctCode": "THIE"
  },
  "367": {
    "provinceCode": "YBA",
    "districtCode": "YBA",
    "precinctCode": "ALAU"
  },
  "368": {
    "provinceCode": "LCH",
    "districtCode": "LCH",
    "precinctCode": "TPHO"
  },
  "369": {
    "provinceCode": "PTH",
    "districtCode": "VTR",
    "precinctCode": "NTRA"
  },
  "370": {
    "provinceCode": "SLA",
    "districtCode": "SLA",
    "precinctCode": "THIE"
  },
  "371": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "BODE"
  },
  "372": {
    "provinceCode": "BDU",
    "districtCode": "TUY",
    "precinctCode": "THIE"
  },
  "373": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "LBIE"
  },
  "375": {
    "provinceCode": "BDU",
    "districtCode": "DAN",
    "precinctCode": "DIAN"
  },
  "376": {
    "provinceCode": "BDU",
    "districtCode": "DAN",
    "precinctCode": "BDUO"
  },
  "377": {
    "provinceCode": "BDU",
    "districtCode": "DAN",
    "precinctCode": "BDU1"
  },
  "378": {
    "provinceCode": "BDU",
    "districtCode": "TDM",
    "precinctCode": "HTHA"
  },
  "379": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "APHU"
  },
  "380": {
    "provinceCode": "BDU",
    "districtCode": "TPTAN",
    "precinctCode": "TDHI"
  },
  "381": {
    "provinceCode": "BDU",
    "districtCode": "TPTAN",
    "precinctCode": "TGIA"
  },
  "382": {
    "provinceCode": "BDU",
    "districtCode": "BCA",
    "precinctCode": "THOA"
  },
  "383": {
    "provinceCode": "BDU",
    "districtCode": "TDM",
    "precinctCode": "CNGH"
  },
  "384": {
    "provinceCode": "AGI",
    "districtCode": "TSO",
    "precinctCode": "VPHU"
  },
  "385": {
    "provinceCode": "KGI",
    "districtCode": "RGI",
    "precinctCode": "VTHA"
  },
  "386": {
    "provinceCode": "KGI",
    "districtCode": "PQU",
    "precinctCode": "CCAN"
  },
  "387": {
    "provinceCode": "NAN",
    "districtCode": "DCH",
    "precinctCode": "DLIE"
  },
  "388": {
    "provinceCode": "KGI",
    "districtCode": "RGI",
    "precinctCode": "VHIE"
  },
  "389": {
    "provinceCode": "KGI",
    "districtCode": "HDA",
    "precinctCode": "LHUY"
  },
  "390": {
    "provinceCode": "KGI",
    "districtCode": "PQU",
    "precinctCode": "HNIN"
  },
  "391": {
    "provinceCode": "KGI",
    "districtCode": "CTH",
    "precinctCode": "MHOA"
  },
  "392": {
    "provinceCode": "KGI",
    "districtCode": "CTH",
    "precinctCode": "MOTB"
  },
  "393": {
    "provinceCode": "KGI",
    "districtCode": "HTI",
    "precinctCode": "MDUC"
  },
  "395": {
    "provinceCode": "KGI",
    "districtCode": "HTI",
    "precinctCode": "TCHA"
  },
  "396": {
    "provinceCode": "KGI",
    "districtCode": "RGI",
    "precinctCode": "VLAC"
  },
  "397": {
    "provinceCode": "KGI",
    "districtCode": "PQU",
    "precinctCode": "CCAN"
  },
  "398": {
    "provinceCode": "QNI",
    "districtCode": "MCA",
    "precinctCode": "HDON"
  },
  "399": {
    "provinceCode": "QNI",
    "districtCode": "TXDTR",
    "precinctCode": "PMKHE"
  },
  "400": {
    "provinceCode": "QNI",
    "districtCode": "UBI",
    "precinctCode": "VDAN"
  },
  "401": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "HLAM"
  },
  "402": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "BCHA"
  },
  "403": {
    "provinceCode": "QNI",
    "districtCode": "QHA",
    "precinctCode": "DHOA"
  },
  "404": {
    "provinceCode": "TGI",
    "districtCode": "MTH",
    "precinctCode": "TRAN"
  },
  "405": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "NGDU"
  },
  "406": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "LTRU"
  },
  "407": {
    "provinceCode": "QNI",
    "districtCode": "MCA",
    "precinctCode": "HXUA"
  },
  "408": {
    "provinceCode": "DNI",
    "districtCode": "DQU",
    "precinctCode": "LNGA"
  },
  "409": {
    "provinceCode": "HYE",
    "districtCode": "MHA",
    "precinctCode": "PDPH"
  },
  "414": {
    "provinceCode": "BPH",
    "districtCode": "BLO",
    "precinctCode": "PHAN"
  },
  "415": {
    "provinceCode": "SLA",
    "districtCode": "SLA",
    "precinctCode": "THIE"
  },
  "416": {
    "provinceCode": "HBI",
    "districtCode": "HBI",
    "precinctCode": "HBIN"
  },
  "417": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "VINI"
  },
  "418": {
    "provinceCode": "THO",
    "districtCode": "HLO",
    "precinctCode": "HLO2"
  },
  "419": {
    "provinceCode": "TGI",
    "districtCode": "GCT",
    "precinctCode": "LBIN"
  },
  "420": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "CGIA"
  },
  "421": {
    "provinceCode": "HNO",
    "districtCode": "SSO",
    "precinctCode": "TXUA"
  },
  "422": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "LTHO"
  },
  "423": {
    "provinceCode": "AGI",
    "districtCode": "PTA",
    "precinctCode": "HLAC"
  },
  "424": {
    "provinceCode": "QNG",
    "districtCode": "LSO",
    "precinctCode": "AHAI"
  },
  "425": {
    "provinceCode": "TTH",
    "districtCode": "PLO",
    "precinctCode": "LBIN"
  },
  "426": {
    "provinceCode": "THO",
    "districtCode": "TGI",
    "precinctCode": "TLA0"
  },
  "428": {
    "provinceCode": "BRV",
    "districtCode": "BRI",
    "precinctCode": "LHUO"
  },
  "429": {
    "provinceCode": "TNG",
    "districtCode": "DHY",
    "precinctCode": "SCAU"
  },
  "431": {
    "provinceCode": "HNO",
    "districtCode": "BTL",
    "precinctCode": "XDIN"
  },
  "433": {
    "provinceCode": "BDI",
    "districtCode": "ALA",
    "precinctCode": "ALAO"
  },
  "435": {
    "provinceCode": "BKA",
    "districtCode": "CDO",
    "precinctCode": "YEMY"
  },
  "436": {
    "provinceCode": "LAN",
    "districtCode": "THU",
    "precinctCode": "VDAI"
  },
  "437": {
    "provinceCode": "BTH",
    "districtCode": "DLI",
    "precinctCode": "VOXU"
  },
  "438": {
    "provinceCode": "HNO",
    "districtCode": "HDU",
    "precinctCode": "TLAP"
  },
  "439": {
    "provinceCode": "TTH",
    "districtCode": "QTH",
    "precinctCode": "PACU"
  },
  "440": {
    "provinceCode": "BDU",
    "districtCode": "TPTAN",
    "precinctCode": "TGIA"
  },
  "441": {
    "provinceCode": "TTH",
    "districtCode": "HUE",
    "precinctCode": "ACUU"
  },
  "442": {
    "provinceCode": "AGI",
    "districtCode": "CDO",
    "precinctCode": "VITE"
  },
  "443": {
    "provinceCode": "HNO",
    "districtCode": "HKI",
    "precinctCode": "PTAN"
  },
  "444": {
    "provinceCode": "HBI",
    "districtCode": "YTH",
    "precinctCode": "NLUO"
  },
  "445": {
    "provinceCode": "PTH",
    "districtCode": "DHU",
    "precinctCode": "VDON"
  },
  "446": {
    "provinceCode": "HBI",
    "districtCode": "YTH",
    "precinctCode": "YTRI"
  },
  "447": {
    "provinceCode": "HBI",
    "districtCode": "YTH",
    "precinctCode": "PLAI"
  },
  "448": {
    "provinceCode": "HNO",
    "districtCode": "HDO",
    "precinctCode": "DNOI"
  },
  "449": {
    "provinceCode": "HNO",
    "districtCode": "HBT",
    "precinctCode": "BMAI"
  },
  "450": {
    "provinceCode": "HNO",
    "districtCode": "TXU",
    "precinctCode": "KDIN"
  },
  "451": {
    "provinceCode": "HNO",
    "districtCode": "TLI",
    "precinctCode": "DNGA"
  },
  "452": {
    "provinceCode": "TQU",
    "districtCode": "TQU",
    "precinctCode": "THA"
  },
  "453": {
    "provinceCode": "BDU",
    "districtCode": "TXBC",
    "precinctCode": "PTH"
  },
  "454": {
    "provinceCode": "HCM",
    "districtCode": "HMO",
    "precinctCode": "HMON"
  },
  "455": {
    "provinceCode": "DLA",
    "districtCode": "EKA",
    "precinctCode": "EAK"
  },
  "456": {
    "provinceCode": "CTH",
    "districtCode": "CTH",
    "precinctCode": "CRAN"
  },
  "457": {
    "provinceCode": "DTH",
    "districtCode": "LVU",
    "precinctCode": "PHOA"
  },
  "459": {
    "provinceCode": "AGI",
    "districtCode": "APH",
    "precinctCode": "VHDO"
  },
  "460": {
    "provinceCode": "BNI",
    "districtCode": "YPH",
    "precinctCode": "TADA"
  },
  "461": {
    "provinceCode": "AGI",
    "districtCode": "TAC",
    "precinctCode": "LTHA"
  },
  "462": {
    "provinceCode": "HDU",
    "districtCode": "TMI",
    "precinctCode": "NQUY"
  },
  "463": {
    "provinceCode": "HYE",
    "districtCode": "VGI",
    "precinctCode": "VGIA"
  },
  "464": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "TPH0"
  },
  "465": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "DAHA"
  },
  "466": {
    "provinceCode": "CBA",
    "districtCode": "BLA",
    "precinctCode": "COBA"
  },
  "467": {
    "provinceCode": "SLA",
    "districtCode": "SMA",
    "precinctCode": "MHUN"
  },
  "468": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "ABIN"
  },
  "469": {
    "provinceCode": "HNO",
    "districtCode": "NTL",
    "precinctCode": "TAMO"
  },
  "470": {
    "provinceCode": "HNO",
    "districtCode": "HDO",
    "precinctCode": "LLOI"
  },
  "471": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "NDUO"
  },
  "472": {
    "provinceCode": "TBI",
    "districtCode": "QPH",
    "precinctCode": "ACAU"
  },
  "473": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "HALE"
  },
  "474": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNA"
  },
  "475": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "VG"
  },
  "476": {
    "provinceCode": "HDU",
    "districtCode": "KMO",
    "precinctCode": "MTAN"
  },
  "477": {
    "provinceCode": "HTI",
    "districtCode": "HLI",
    "precinctCode": "BHON"
  },
  "478": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "NGDU"
  },
  "479": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "LADA"
  },
  "480": {
    "provinceCode": "HYE",
    "districtCode": "TPHYEN",
    "precinctCode": "XTHUN"
  },
  "481": {
    "provinceCode": "BTH",
    "districtCode": "HTA",
    "precinctCode": "TPHU"
  },
  "482": {
    "provinceCode": "BLI",
    "districtCode": "GRA",
    "precinctCode": "LDIE"
  },
  "483": {
    "provinceCode": "HTI",
    "districtCode": "LHA",
    "precinctCode": "HLOC"
  },
  "484": {
    "provinceCode": "HNO",
    "districtCode": "THO",
    "precinctCode": "XULA"
  },
  "485": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "TQHA"
  },
  "486": {
    "provinceCode": "HNO",
    "districtCode": "DAN",
    "precinctCode": "DMAC"
  },
  "487": {
    "provinceCode": "NBI",
    "districtCode": "NQU",
    "precinctCode": "PSON"
  },
  "488": {
    "provinceCode": "PYE",
    "districtCode": "SHI",
    "precinctCode": "TLAP"
  },
  "489": {
    "provinceCode": "TQU",
    "districtCode": "TQU",
    "precinctCode": "MXUA"
  },
  "490": {
    "provinceCode": "TQU",
    "districtCode": "TQU",
    "precinctCode": "Y LA"
  },
  "491": {
    "provinceCode": "PTH",
    "districtCode": "PCH",
    "precinctCode": "BNGU"
  },
  "492": {
    "provinceCode": "NBI",
    "districtCode": "YMO",
    "precinctCode": "YETU"
  },
  "493": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "TLIN"
  },
  "494": {
    "provinceCode": "DNI",
    "districtCode": "LKH",
    "precinctCode": "BVIN"
  },
  "495": {
    "provinceCode": "BPH",
    "districtCode": "BDA",
    "precinctCode": "TSON"
  },
  "496": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNA"
  },
  "497": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "VHUN"
  },
  "498": {
    "provinceCode": "BPH",
    "districtCode": "DPH",
    "precinctCode": "TPH0"
  },
  "499": {
    "provinceCode": "BTH",
    "districtCode": "BBI",
    "precinctCode": "SLUY"
  },
  "501": {
    "provinceCode": "HNO",
    "districtCode": "DAN",
    "precinctCode": "DMAC"
  },
  "502": {
    "provinceCode": "HYE",
    "districtCode": "YMY",
    "precinctCode": "89"
  },
  "503": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "QTRI"
  },
  "504": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "0002"
  },
  "505": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "0004"
  },
  "506": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "TNUN"
  },
  "507": {
    "provinceCode": "HCM",
    "districtCode": "BCH",
    "precinctCode": "TNHU"
  },
  "508": {
    "provinceCode": "DNI",
    "districtCode": "XLO",
    "precinctCode": "XDIN"
  },
  "509": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "HALE"
  },
  "511": {
    "provinceCode": "HCM",
    "districtCode": "CCH",
    "precinctCode": "THMY"
  },
  "512": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "YESO"
  },
  "513": {
    "provinceCode": "HNO",
    "districtCode": "BVI",
    "precinctCode": "CLIN"
  },
  "514": {
    "provinceCode": "VPH",
    "districtCode": "YLA",
    "precinctCode": "THON"
  },
  "515": {
    "provinceCode": "LCA",
    "districtCode": "LCA",
    "precinctCode": "CDUO"
  },
  "516": {
    "provinceCode": "PTH",
    "districtCode": "PTH",
    "precinctCode": "TTHI"
  },
  "517": {
    "provinceCode": "CBA",
    "districtCode": "TKH",
    "precinctCode": "PCHA"
  },
  "518": {
    "provinceCode": "TTH",
    "districtCode": "HTR",
    "precinctCode": "HBIN"
  },
  "519": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "PLOB"
  },
  "520": {
    "provinceCode": "YBA",
    "districtCode": "YBI",
    "precinctCode": "YBIN"
  },
  "521": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "YESO"
  },
  "522": {
    "provinceCode": "BTH",
    "districtCode": "HTN",
    "precinctCode": "MTHA"
  },
  "523": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "HYEN"
  },
  "524": {
    "provinceCode": "TBI",
    "districtCode": "QPH",
    "precinctCode": "QTHO"
  },
  "525": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "LPHU"
  },
  "526": {
    "provinceCode": "DNI",
    "districtCode": "XLO",
    "precinctCode": "XPHU"
  },
  "527": {
    "provinceCode": "SLA",
    "districtCode": "BYE",
    "precinctCode": "BYEN"
  },
  "528": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "THDA"
  },
  "529": {
    "provinceCode": "TBI",
    "districtCode": "QPH",
    "precinctCode": "QBAO"
  },
  "530": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "LNAM"
  },
  "531": {
    "provinceCode": "DNA",
    "districtCode": "CLE",
    "precinctCode": "HXUA"
  },
  "532": {
    "provinceCode": "BDU",
    "districtCode": "TPDAN",
    "precinctCode": "BDU1"
  },
  "533": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "NK"
  },
  "534": {
    "provinceCode": "BTH",
    "districtCode": "PTH",
    "precinctCode": "MUNE"
  },
  "535": {
    "provinceCode": "DNA",
    "districtCode": "NHS",
    "precinctCode": "BMAN"
  },
  "536": {
    "provinceCode": "GLA",
    "districtCode": "PLE",
    "precinctCode": "APHU"
  },
  "537": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "BTDO"
  },
  "538": {
    "provinceCode": "AGI",
    "districtCode": "APH",
    "precinctCode": "VLOC"
  },
  "539": {
    "provinceCode": "KGI",
    "districtCode": "GRI",
    "precinctCode": "LTHA"
  },
  "540": {
    "provinceCode": "TQU",
    "districtCode": "TQU",
    "precinctCode": "ATUO"
  },
  "541": {
    "provinceCode": "LCA",
    "districtCode": "BYE",
    "precinctCode": "BAHA"
  },
  "542": {
    "provinceCode": "DNI",
    "districtCode": "XLO",
    "precinctCode": "XTHA"
  },
  "543": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "0003"
  },
  "544": {
    "provinceCode": "LSO",
    "districtCode": "CLA",
    "precinctCode": "NHLY"
  },
  "545": {
    "provinceCode": "BTH",
    "districtCode": "PTH",
    "precinctCode": "MUNE"
  },
  "546": {
    "provinceCode": "QNI",
    "districtCode": "VDO",
    "precinctCode": "DKET"
  },
  "547": {
    "provinceCode": "QNI",
    "districtCode": "VDO",
    "precinctCode": "DOXA"
  },
  "548": {
    "provinceCode": "HNO",
    "districtCode": "BTL",
    "precinctCode": "DNGA"
  },
  "549": {
    "provinceCode": "DNI",
    "districtCode": "DQU",
    "precinctCode": "PHLY"
  },
  "550": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "XHL"
  },
  "551": {
    "provinceCode": "HNO",
    "districtCode": "NTL",
    "precinctCode": "DAMO"
  },
  "552": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "TLIE"
  },
  "553": {
    "provinceCode": "HNO",
    "districtCode": "HDO",
    "precinctCode": "DNOI"
  },
  "554": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "LBIE"
  },
  "555": {
    "provinceCode": "HYE",
    "districtCode": "VGI",
    "precinctCode": "XQUA"
  },
  "556": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "GLAM"
  },
  "557": {
    "provinceCode": "HDU",
    "districtCode": "TXKMO",
    "precinctCode": "PHSON"
  },
  "558": {
    "provinceCode": "HNO",
    "districtCode": "SSO",
    "precinctCode": "HOKY"
  },
  "559": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "DCAU"
  },
  "560": {
    "provinceCode": "HBI",
    "districtCode": "HBI",
    "precinctCode": "HBIN"
  },
  "561": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "AKHE"
  },
  "562": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "LTAY"
  },
  "563": {
    "provinceCode": "QNI",
    "districtCode": "VDO",
    "precinctCode": "DXUY"
  },
  "564": {
    "provinceCode": "HNO",
    "districtCode": "HDU",
    "precinctCode": "YESO"
  },
  "565": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "LBIE"
  },
  "566": {
    "provinceCode": "VPH",
    "districtCode": "VYE",
    "precinctCode": "LBAO"
  },
  "567": {
    "provinceCode": "CTH",
    "districtCode": "CRA",
    "precinctCode": "TPHU"
  },
  "568": {
    "provinceCode": "TTH",
    "districtCode": "PDI",
    "precinctCode": "PDIN"
  },
  "569": {
    "provinceCode": "HGA",
    "districtCode": "HGI",
    "precinctCode": "PLIN"
  },
  "570": {
    "provinceCode": "TVI",
    "districtCode": "TCU",
    "precinctCode": "HTAN"
  },
  "571": {
    "provinceCode": "BTH",
    "districtCode": "HTN",
    "precinctCode": "TNAM"
  },
  "572": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "VCUO"
  },
  "575": {
    "provinceCode": "TTH",
    "districtCode": "QTH",
    "precinctCode": "PVDA"
  },
  "576": {
    "provinceCode": "KHO",
    "districtCode": "CRA",
    "precinctCode": "CLIN"
  },
  "577": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "THUN"
  },
  "578": {
    "provinceCode": "BTH",
    "districtCode": "HTH",
    "precinctCode": "TNAM"
  },
  "579": {
    "provinceCode": "BTR",
    "districtCode": "CTH",
    "precinctCode": "APHU"
  },
  "581": {
    "provinceCode": "HBI",
    "districtCode": "YTH",
    "precinctCode": "HTRA"
  },
  "582": {
    "provinceCode": "TTH",
    "districtCode": "HUE",
    "precinctCode": "THUN"
  },
  "583": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "MKHA"
  },
  "584": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "PTAN"
  },
  "613": {
    "provinceCode": "HNO",
    "districtCode": "TTH",
    "precinctCode": "BPHU"
  },
  "614": {
    "provinceCode": "QNI",
    "districtCode": "YHU",
    "precinctCode": "QYEN"
  },
  "622": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "THKH"
  },
  "632": {
    "provinceCode": "HNO",
    "districtCode": "HKI",
    "precinctCode": "HBON"
  },
  "639": {
    "provinceCode": "TTH",
    "districtCode": "PDI",
    "precinctCode": "PDIN"
  },
  "640": {
    "provinceCode": "PTH",
    "districtCode": "TBA",
    "precinctCode": "DSON"
  },
  "641": {
    "provinceCode": "YBA",
    "districtCode": "TYE",
    "precinctCode": "ALAU"
  },
  "642": {
    "provinceCode": "PTH",
    "districtCode": "PTH",
    "precinctCode": "TVIN"
  },
  "643": {
    "provinceCode": "NAN",
    "districtCode": "DLU",
    "precinctCode": "LSO0"
  },
  "644": {
    "provinceCode": "HNO",
    "districtCode": "BDI",
    "precinctCode": "GIVO"
  },
  "645": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "NK"
  },
  "646": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "LBIE"
  },
  "647": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "NDUN"
  },
  "648": {
    "provinceCode": "QNA",
    "districtCode": "DBA",
    "precinctCode": "DTTR"
  },
  "649": {
    "provinceCode": "TTH",
    "districtCode": "NDO"
  },
  "657": {
    "provinceCode": "DTH",
    "districtCode": "THN",
    "precinctCode": "BTHA"
  },
  "658": {
    "provinceCode": "TTH",
    "districtCode": "HTR",
    "precinctCode": "HTIE"
  },
  "660": {
    "provinceCode": "LCA",
    "districtCode": "SPA",
    "precinctCode": "PSP"
  },
  "662": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "ANIN"
  },
  "663": {
    "provinceCode": "HNO",
    "districtCode": "TTR",
    "precinctCode": "TLIE"
  },
  "664": {
    "provinceCode": "HNO",
    "districtCode": "HKI",
    "precinctCode": "QTRU"
  },
  "665": {
    "provinceCode": "PTH",
    "districtCode": "VTR",
    "precinctCode": "TMIE"
  },
  "666": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TCUO"
  },
  "667": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "VCUO"
  },
  "668": {
    "provinceCode": "HCM",
    "districtCode": "BTA",
    "precinctCode": "ALAC"
  },
  "669": {
    "provinceCode": "BRV",
    "districtCode": "CDU",
    "precinctCode": "BTRU"
  },
  "670": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "TNPA"
  },
  "671": {
    "provinceCode": "HCM",
    "districtCode": "BCH",
    "precinctCode": "BHUN"
  },
  "672": {
    "provinceCode": "BDU",
    "districtCode": "TDM",
    "precinctCode": "PCMY"
  },
  "673": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "TAAN"
  },
  "674": {
    "provinceCode": "QNI",
    "districtCode": "YHU",
    "precinctCode": "QYEN"
  },
  "675": {
    "provinceCode": "BDU",
    "districtCode": "TAN",
    "precinctCode": "HDIN"
  },
  "676": {
    "provinceCode": "HDU",
    "districtCode": "GLO",
    "precinctCode": "YKIE"
  },
  "677": {
    "provinceCode": "TGI",
    "districtCode": "CTH",
    "precinctCode": "BTRU"
  },
  "678": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "KXUY"
  },
  "681": {
    "provinceCode": "QNA",
    "districtCode": "DBA",
    "precinctCode": "DHON"
  },
  "683": {
    "provinceCode": "QNA",
    "districtCode": "DBA",
    "precinctCode": "DHON"
  },
  "684": {
    "provinceCode": "NAN",
    "districtCode": "DCH",
    "precinctCode": "DCAT"
  },
  "685": {
    "provinceCode": "KGI",
    "districtCode": "ABI",
    "precinctCode": "DTHA"
  },
  "686": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "HPHU"
  },
  "704": {
    "provinceCode": "THO",
    "districtCode": "VLO",
    "precinctCode": "VTIE"
  },
  "705": {
    "provinceCode": "HNO",
    "districtCode": "TXS",
    "precinctCode": "SDON"
  },
  "706": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "0001"
  },
  "707": {
    "provinceCode": "TTH",
    "districtCode": "QTH",
    "precinctCode": "PACU"
  },
  "708": {
    "provinceCode": "NBI",
    "districtCode": "NBI",
    "precinctCode": "TNAM"
  },
  "709": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "VG"
  },
  "710": {
    "provinceCode": "LAN",
    "districtCode": "TTH",
    "precinctCode": "LTHH"
  },
  "711": {
    "provinceCode": "KGI",
    "districtCode": "AMI",
    "precinctCode": "TTHA"
  },
  "712": {
    "provinceCode": "HDU",
    "districtCode": "BGI",
    "precinctCode": "HTHI"
  },
  "713": {
    "provinceCode": "HNO",
    "districtCode": "HBT",
    "precinctCode": "BMAI"
  },
  "716": {
    "provinceCode": "HPH",
    "districtCode": "KTH",
    "precinctCode": "TSO1"
  },
  "717": {
    "provinceCode": "PTH",
    "districtCode": "TTH",
    "precinctCode": "TTHU"
  },
  "718": {
    "provinceCode": "CBA",
    "districtCode": "HAN",
    "precinctCode": "BDUO"
  },
  "719": {
    "provinceCode": "LDO",
    "districtCode": "LHA",
    "precinctCode": "GLAM"
  },
  "720": {
    "provinceCode": "BPH",
    "districtCode": "DPH",
    "precinctCode": "TLO1"
  },
  "721": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "DCUO"
  },
  "722": {
    "provinceCode": "PYE",
    "districtCode": "TAN",
    "precinctCode": "AHAI"
  },
  "724": {
    "provinceCode": "NDI",
    "districtCode": "HHA",
    "precinctCode": "HVAN"
  },
  "726": {
    "provinceCode": "NDI",
    "districtCode": "XTR",
    "precinctCode": "XPH1"
  },
  "728": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "ADON"
  },
  "729": {
    "provinceCode": "HDU",
    "districtCode": "KTH",
    "precinctCode": "KANH"
  },
  "730": {
    "provinceCode": "HPH",
    "districtCode": "TPTN",
    "precinctCode": "PHLA"
  },
  "732": {
    "provinceCode": "THO",
    "districtCode": "TGI",
    "precinctCode": "XLAM"
  },
  "733": {
    "provinceCode": "TTH",
    "districtCode": "HUE",
    "precinctCode": "THOA"
  },
  "734": {
    "provinceCode": "TGI",
    "districtCode": "GCO",
    "precinctCode": "LHUN"
  },
  "737": {
    "provinceCode": "THO",
    "districtCode": "TGI",
    "precinctCode": "HNIN"
  },
  "739": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "DVAN"
  },
  "741": {
    "provinceCode": "LSO",
    "districtCode": "HLU",
    "precinctCode": "HLAC"
  },
  "742": {
    "provinceCode": "HGA",
    "districtCode": "QBI",
    "precinctCode": "XMIN"
  },
  "743": {
    "provinceCode": "BNI",
    "districtCode": "GBI",
    "precinctCode": "BDUO"
  },
  "744": {
    "provinceCode": "BDU",
    "districtCode": "PGI",
    "precinctCode": "PHOA"
  },
  "745": {
    "provinceCode": "TNI",
    "districtCode": "TXTBAN",
    "precinctCode": "ATIN"
  },
  "746": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "TSON"
  },
  "747": {
    "provinceCode": "AGI",
    "districtCode": "CTH",
    "precinctCode": "VIAN"
  },
  "748": {
    "provinceCode": "HNO",
    "districtCode": "DDA",
    "precinctCode": "KLIE"
  },
  "749": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "ANIN"
  },
  "750": {
    "provinceCode": "LAN",
    "districtCode": "VHU",
    "precinctCode": "TBIN"
  },
  "751": {
    "provinceCode": "BRV",
    "districtCode": "VTA",
    "precinctCode": "0011"
  },
  "752": {
    "provinceCode": "DNI",
    "districtCode": "BHO",
    "precinctCode": "LBIN"
  },
  "754": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "QTRIE"
  },
  "755": {
    "provinceCode": "BPH",
    "districtCode": "BDA",
    "precinctCode": "BOBO"
  },
  "756": {
    "provinceCode": "DNI",
    "districtCode": "BHO",
    "precinctCode": "LBIN"
  },
  "757": {
    "provinceCode": "TQU",
    "districtCode": "CHO",
    "precinctCode": "HPHU"
  },
  "758": {
    "provinceCode": "PTH",
    "districtCode": "DHU",
    "precinctCode": "PTHU"
  },
  "759": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HPH0"
  },
  "760": {
    "provinceCode": "HCM",
    "districtCode": "HMO",
    "precinctCode": "XTDO"
  },
  "761": {
    "provinceCode": "HCM",
    "districtCode": "TPH",
    "precinctCode": "TTHN"
  },
  "762": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "HLOI"
  },
  "763": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "HLOI"
  },
  "845": {
    "provinceCode": "DNA",
    "districtCode": "NHS",
    "precinctCode": "MYAN"
  },
  "846": {
    "provinceCode": "BDU",
    "districtCode": "TPDAN",
    "precinctCode": "DIAN"
  },
  "851": {
    "provinceCode": "TTH",
    "districtCode": "PLO",
    "precinctCode": "XLOC"
  },
  "852": {
    "provinceCode": "TTH",
    "districtCode": "HUE",
    "precinctCode": "ACUU"
  },
  "853": {
    "provinceCode": "DLA",
    "districtCode": "CMG",
    "precinctCode": "QPHU"
  },
  "854": {
    "provinceCode": "HDU",
    "districtCode": "KTH",
    "precinctCode": "VHUN"
  },
  "859": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "TNGA"
  },
  "860": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "XNHOI"
  },
  "861": {
    "provinceCode": "NBI",
    "districtCode": "NQU",
    "precinctCode": "GLAM"
  },
  "862": {
    "provinceCode": "NAN",
    "districtCode": "DLU",
    "precinctCode": "HSO2"
  },
  "863": {
    "provinceCode": "LCA",
    "districtCode": "VBA",
    "precinctCode": "LGIA"
  },
  "864": {
    "provinceCode": "VPH",
    "districtCode": "YLA",
    "precinctCode": "YLAC"
  },
  "865": {
    "provinceCode": "QNI",
    "districtCode": "HHA",
    "precinctCode": "QUHA"
  },
  "866": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "PCTHU"
  },
  "869": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "0003"
  },
  "872": {
    "provinceCode": "HPH",
    "districtCode": "LCH",
    "precinctCode": "ABIE"
  },
  "873": {
    "provinceCode": "PTH",
    "districtCode": "TSO",
    "precinctCode": "TMIN"
  },
  "874": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "LXUA"
  },
  "875": {
    "provinceCode": "SLA",
    "districtCode": "PYE",
    "precinctCode": "PYEN"
  },
  "876": {
    "provinceCode": "PTH",
    "districtCode": "TNO",
    "precinctCode": "VXUA"
  },
  "877": {
    "provinceCode": "DLA",
    "districtCode": "EKA",
    "precinctCode": "EAK"
  },
  "880": {
    "provinceCode": "THO",
    "districtCode": "TGI",
    "precinctCode": "NSON"
  },
  "881": {
    "provinceCode": "THO",
    "districtCode": "VLO",
    "precinctCode": "VHU1"
  },
  "882": {
    "provinceCode": "DTH",
    "districtCode": "TBI",
    "precinctCode": "TQUO"
  },
  "883": {
    "provinceCode": "BTH",
    "districtCode": "BBI",
    "precinctCode": "PSON"
  },
  "884": {
    "provinceCode": "LCH",
    "districtCode": "LCH",
    "precinctCode": "DKET"
  },
  "886": {
    "provinceCode": "AGI",
    "districtCode": "CPH",
    "precinctCode": "BCHU"
  },
  "887": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "NK"
  },
  "888": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "TLIE"
  },
  "889": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "NGDO"
  },
  "891": {
    "provinceCode": "STR",
    "districtCode": "NNA",
    "precinctCode": "VBIE"
  },
  "892": {
    "provinceCode": "DNI",
    "districtCode": "NTR",
    "precinctCode": "PTHA"
  },
  "893": {
    "provinceCode": "DLA",
    "districtCode": "ESU",
    "precinctCode": "YTMO"
  },
  "894": {
    "provinceCode": "VLO",
    "districtCode": "TBI",
    "precinctCode": "TPHU"
  },
  "895": {
    "provinceCode": "TNI",
    "districtCode": "TNI",
    "precinctCode": "NSON"
  },
  "896": {
    "provinceCode": "GLA",
    "districtCode": "AKH",
    "precinctCode": "TUAN"
  },
  "897": {
    "provinceCode": "LCA",
    "districtCode": "LCA",
    "precinctCode": "BCUO"
  },
  "899": {
    "provinceCode": "LSO",
    "districtCode": "BGI",
    "precinctCode": "VYEN"
  },
  "900": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "TQHA"
  },
  "903": {
    "provinceCode": "PTH",
    "districtCode": "CKH",
    "precinctCode": "PHXA"
  },
  "904": {
    "provinceCode": "VPH",
    "districtCode": "TDU",
    "precinctCode": "HHO1"
  },
  "905": {
    "provinceCode": "LSO",
    "districtCode": "LSO",
    "precinctCode": "DKIN"
  },
  "906": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "NK"
  },
  "907": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "CXAN"
  },
  "908": {
    "provinceCode": "HPH",
    "districtCode": "AHA",
    "precinctCode": "ADUO"
  },
  "909": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "THOA"
  },
  "911": {
    "provinceCode": "KON",
    "districtCode": "KOT",
    "precinctCode": "DRWA"
  },
  "912": {
    "provinceCode": "LCA",
    "districtCode": "LCA",
    "precinctCode": "CDUO"
  },
  "913": {
    "provinceCode": "VPH",
    "districtCode": "LTH",
    "precinctCode": "SDON"
  },
  "915": {
    "provinceCode": "BDU",
    "districtCode": "DAN",
    "precinctCode": "BDUO"
  },
  "916": {
    "provinceCode": "DNO",
    "districtCode": "DSO",
    "precinctCode": "DMOL"
  },
  "917": {
    "provinceCode": "LAN",
    "districtCode": "THO",
    "precinctCode": "TDON"
  },
  "918": {
    "provinceCode": "QNG",
    "districtCode": "MDU",
    "precinctCode": "DHOA"
  },
  "920": {
    "provinceCode": "CTH",
    "districtCode": "TNO",
    "precinctCode": "TNOT"
  },
  "921": {
    "provinceCode": "HTI",
    "districtCode": "KAN",
    "precinctCode": "KXUA"
  },
  "922": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TLUO"
  },
  "923": {
    "provinceCode": "YBA",
    "districtCode": "VYE",
    "precinctCode": "LGIA"
  },
  "925": {
    "provinceCode": "BLI",
    "districtCode": "BLI",
    "precinctCode": "TPBLI"
  },
  "926": {
    "provinceCode": "HGA",
    "districtCode": "QBA",
    "precinctCode": "DOHA"
  },
  "927": {
    "provinceCode": "DLA",
    "districtCode": "EHL",
    "precinctCode": "EDRA"
  },
  "929": {
    "provinceCode": "HNO",
    "districtCode": "SSO",
    "precinctCode": "TGIA"
  },
  "930": {
    "provinceCode": "TGI",
    "districtCode": "CBE",
    "precinctCode": "HKHA"
  },
  "931": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "HKHA"
  },
  "932": {
    "provinceCode": "LAN",
    "districtCode": "KTG",
    "precinctCode": "THUN"
  },
  "933": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "ADON"
  },
  "934": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "TCHA"
  },
  "935": {
    "provinceCode": "YBA",
    "districtCode": "VYE",
    "precinctCode": "XUAI"
  },
  "936": {
    "provinceCode": "QNG",
    "districtCode": "STI",
    "precinctCode": "THOA"
  },
  "938": {
    "provinceCode": "QTR",
    "districtCode": "GLI",
    "precinctCode": "GLIN"
  },
  "939": {
    "provinceCode": "KHO",
    "districtCode": "CRA",
    "precinctCode": "CTHU"
  },
  "940": {
    "provinceCode": "DNA",
    "districtCode": "STR",
    "precinctCode": "ANMY"
  },
  "941": {
    "provinceCode": "BDI",
    "districtCode": "ALA",
    "precinctCode": "ADUN"
  },
  "942": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TTHN"
  },
  "943": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "VEAN"
  },
  "944": {
    "provinceCode": "KHO",
    "districtCode": "DKH",
    "precinctCode": "SDAU"
  },
  "945": {
    "provinceCode": "NBI",
    "districtCode": "YKH",
    "precinctCode": "KHOI"
  },
  "946": {
    "provinceCode": "DNI",
    "districtCode": "LTH",
    "precinctCode": "LOA1"
  },
  "947": {
    "provinceCode": "HDU",
    "districtCode": "NSA",
    "precinctCode": "NDON"
  },
  "948": {
    "provinceCode": "BPH",
    "districtCode": "LNI",
    "precinctCode": "LTAN"
  },
  "950": {
    "provinceCode": "HPH",
    "districtCode": "LCH",
    "precinctCode": "ABIE"
  },
  "951": {
    "provinceCode": "THO",
    "districtCode": "HTR",
    "precinctCode": "HDON"
  },
  "952": {
    "provinceCode": "HNO",
    "districtCode": "GLA",
    "precinctCode": "PDON"
  },
  "953": {
    "provinceCode": "BTH",
    "districtCode": "HTN",
    "precinctCode": "HKIE"
  },
  "955": {
    "provinceCode": "CTH",
    "districtCode": "CTH",
    "precinctCode": "CRAN"
  },
  "956": {
    "provinceCode": "HYE",
    "districtCode": "KCH",
    "precinctCode": "DTAP"
  },
  "958": {
    "provinceCode": "HNA",
    "districtCode": "XTH",
    "precinctCode": "GTHU"
  },
  "960": {
    "provinceCode": "YBA",
    "districtCode": "YBA",
    "precinctCode": "ALAU"
  },
  "961": {
    "provinceCode": "QNA",
    "districtCode": "TGI",
    "precinctCode": "LANG"
  },
  "962": {
    "provinceCode": "QNG",
    "districtCode": "BSO",
    "precinctCode": "BHIE"
  },
  "963": {
    "provinceCode": "BTH",
    "districtCode": "BBI",
    "precinctCode": "PSON"
  },
  "964": {
    "provinceCode": "LCA",
    "districtCode": "LCA",
    "precinctCode": "LCAI"
  },
  "965": {
    "provinceCode": "PYE",
    "districtCode": "TAN",
    "precinctCode": "ANTA"
  },
  "966": {
    "provinceCode": "HNO",
    "districtCode": "NTL",
    "precinctCode": "XPHU"
  },
  "967": {
    "provinceCode": "TQU",
    "districtCode": "TQU",
    "precinctCode": "ATUO"
  },
  "968": {
    "provinceCode": "NAN",
    "districtCode": "CCU",
    "precinctCode": "CLAM"
  },
  "970": {
    "provinceCode": "HTI",
    "districtCode": "KAN",
    "precinctCode": "STRI"
  },
  "971": {
    "provinceCode": "HCM",
    "districtCode": "BTA",
    "precinctCode": "TLAC"
  },
  "972": {
    "provinceCode": "QBI",
    "districtCode": "BTR",
    "precinctCode": "BTRA"
  },
  "973": {
    "provinceCode": "YBA",
    "districtCode": "YBI",
    "precinctCode": "DDON"
  },
  "974": {
    "provinceCode": "HTI",
    "districtCode": "DTH",
    "precinctCode": "DLAP"
  },
  "975": {
    "provinceCode": "LAN",
    "districtCode": "TAN",
    "precinctCode": "KHAU"
  },
  "976": {
    "provinceCode": "AGI",
    "districtCode": "TSO",
    "precinctCode": "TGIA"
  },
  "977": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "XTRU"
  },
  "979": {
    "provinceCode": "HCM",
    "districtCode": "HMO",
    "precinctCode": "BDIE"
  },
  "982": {
    "provinceCode": "BPH",
    "districtCode": "PLN",
    "precinctCode": "PVAN"
  },
  "983": {
    "provinceCode": "BGI",
    "districtCode": "VYE",
    "precinctCode": "NSON"
  },
  "993": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "HNI1"
  },
  "994": {
    "provinceCode": "QNI",
    "districtCode": "YHU",
    "precinctCode": "QYEN"
  },
  "995": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "HNA0"
  },
  "996": {
    "provinceCode": "LDO",
    "districtCode": "DTE",
    "precinctCode": "QTRI"
  },
  "997": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "PDON"
  },
  "998": {
    "provinceCode": "BPH",
    "districtCode": "BDA",
    "precinctCode": "BOBO"
  },
  "1002": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "HCHA"
  },
  "1003": {
    "provinceCode": "HCM",
    "districtCode": "BTA",
    "precinctCode": "TTAO"
  },
  "1004": {
    "provinceCode": "TBI",
    "districtCode": "DHU",
    "precinctCode": "HOLU"
  },
  "1005": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "CNAM"
  },
  "1006": {
    "provinceCode": "QNI",
    "districtCode": "QHA",
    "precinctCode": "DAHA"
  },
  "1007": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "HALE"
  },
  "1008": {
    "provinceCode": "HNO",
    "districtCode": "TLI",
    "precinctCode": "TAHO"
  },
  "1009": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "VNIN"
  },
  "1010": {
    "provinceCode": "BLI",
    "districtCode": "BLI",
    "precinctCode": "TPBLI"
  },
  "1011": {
    "provinceCode": "CMA",
    "districtCode": "DDO",
    "precinctCode": "TDUY"
  },
  "1012": {
    "provinceCode": "BLI",
    "districtCode": "BLI",
    "precinctCode": "TPBLI"
  },
  "1013": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "HNI1"
  },
  "1014": {
    "provinceCode": "DNI",
    "districtCode": "LTH",
    "precinctCode": "APHU"
  },
  "1015": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "LCHI"
  },
  "1016": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "DANH"
  },
  "1018": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "BKHE"
  },
  "1019": {
    "provinceCode": "TNI",
    "districtCode": "TNI",
    "precinctCode": "NTHA"
  },
  "1020": {
    "provinceCode": "HPH",
    "districtCode": "HAN",
    "precinctCode": "TTO"
  },
  "1021": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "NKIM"
  },
  "1022": {
    "provinceCode": "BNI",
    "districtCode": "TSO",
    "precinctCode": "DNGU"
  },
  "1023": {
    "provinceCode": "BTH",
    "districtCode": "BBI",
    "precinctCode": "PSON"
  },
  "1025": {
    "provinceCode": "LAN",
    "districtCode": "THO",
    "precinctCode": "THOA"
  },
  "1026": {
    "provinceCode": "TTH",
    "districtCode": "NDO",
    "precinctCode": "KTRE"
  },
  "1027": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HKHA"
  },
  "1028": {
    "provinceCode": "DNA",
    "districtCode": "HCH",
    "precinctCode": "NDUO"
  },
  "1029": {
    "provinceCode": "DTH",
    "districtCode": "CLA",
    "precinctCode": "MHIE"
  },
  "1030": {
    "provinceCode": "QBI",
    "districtCode": "BDO",
    "precinctCode": "BDON"
  },
  "1037": {
    "provinceCode": "LAN",
    "districtCode": "CDU",
    "precinctCode": "MLOC"
  },
  "1038": {
    "provinceCode": "BDI",
    "districtCode": "TPH",
    "precinctCode": "PHAN"
  },
  "1039": {
    "provinceCode": "BGI",
    "districtCode": "BGI",
    "precinctCode": "TPHU"
  },
  "1040": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "TSON"
  },
  "1041": {
    "provinceCode": "HNO",
    "districtCode": "QOA",
    "precinctCode": "TNGH"
  },
  "1042": {
    "provinceCode": "HPH",
    "districtCode": "HAN",
    "precinctCode": "DHA"
  },
  "1044": {
    "provinceCode": "CMA",
    "districtCode": "CMA",
    "precinctCode": "TVAN"
  },
  "1046": {
    "provinceCode": "QNI",
    "districtCode": "TXDTR",
    "precinctCode": "XASIN"
  },
  "1048": {
    "provinceCode": "LAN",
    "districtCode": "TAN",
    "precinctCode": "KHAU"
  },
  "1049": {
    "provinceCode": "AGI",
    "districtCode": "CMO",
    "precinctCode": "HOA0"
  },
  "1050": {
    "provinceCode": "HDU",
    "districtCode": "NGI",
    "precinctCode": "NHAI"
  },
  "1051": {
    "provinceCode": "DBI",
    "districtCode": "DBP",
    "precinctCode": "TTHA"
  },
  "1052": {
    "provinceCode": "HPH",
    "districtCode": "VBA",
    "precinctCode": "VH"
  },
  "1053": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "VPHO"
  },
  "1054": {
    "provinceCode": "HPH",
    "districtCode": "DKI",
    "precinctCode": "DPH"
  },
  "1055": {
    "provinceCode": "DNO",
    "districtCode": "GNG",
    "precinctCode": "PNTAN"
  },
  "1056": {
    "provinceCode": "LAN",
    "districtCode": "THO",
    "precinctCode": "THAN"
  },
  "1057": {
    "provinceCode": "BDU",
    "districtCode": "DTI",
    "precinctCode": "BCAT"
  },
  "1058": {
    "provinceCode": "VPH",
    "districtCode": "TDA",
    "precinctCode": "DDIN"
  },
  "1059": {
    "provinceCode": "VLO",
    "districtCode": "BMI",
    "precinctCode": "TDON"
  },
  "1061": {
    "provinceCode": "HNO",
    "districtCode": "GLA",
    "precinctCode": "VDUC"
  },
  "1062": {
    "provinceCode": "LCA",
    "districtCode": "LCA",
    "precinctCode": "DHAI"
  },
  "1063": {
    "provinceCode": "BDU",
    "districtCode": "TUY",
    "precinctCode": "BIMY"
  },
  "1064": {
    "provinceCode": "HPH",
    "districtCode": "TPTN",
    "precinctCode": "PALU"
  },
  "1070": {
    "provinceCode": "CMA",
    "districtCode": "CNU",
    "precinctCode": "CDVA"
  },
  "1071": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "NIXA"
  },
  "1089": {
    "provinceCode": "LAN",
    "districtCode": "THO",
    "precinctCode": "TPHU"
  },
  "1090": {
    "provinceCode": "BNI",
    "districtCode": "QVO",
    "precinctCode": "PLAN"
  },
  "1091": {
    "provinceCode": "QBI",
    "districtCode": "BTR",
    "precinctCode": "PTRA"
  },
  "1092": {
    "provinceCode": "TBI",
    "districtCode": "TTH",
    "precinctCode": "TTHU"
  },
  "1093": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "NNGH"
  },
  "1094": {
    "provinceCode": "BDI",
    "districtCode": "TXHNHO",
    "precinctCode": "HNHO"
  },
  "1095": {
    "provinceCode": "TGI",
    "districtCode": "CLA",
    "precinctCode": "BPHU"
  },
  "1096": {
    "provinceCode": "THO",
    "districtCode": "NTH",
    "precinctCode": "XUDU"
  },
  "1097": {
    "provinceCode": "NAN",
    "districtCode": "DCH",
    "precinctCode": "DLIE"
  },
  "1099": {
    "provinceCode": "TNI",
    "districtCode": "TBI",
    "precinctCode": "TLAP"
  },
  "1100": {
    "provinceCode": "HCM",
    "districtCode": "001",
    "precinctCode": "TDIN"
  },
  "1105": {
    "provinceCode": "BGI",
    "districtCode": "BGI",
    "precinctCode": "TTIE"
  },
  "1106": {
    "provinceCode": "CTH",
    "districtCode": "CRA",
    "precinctCode": "PTHU"
  },
  "1107": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "TBIN"
  },
  "1109": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "NNGH"
  },
  "1110": {
    "provinceCode": "AGI",
    "districtCode": "APH",
    "precinctCode": "KBIN"
  },
  "1111": {
    "provinceCode": "TBI",
    "districtCode": "THA",
    "precinctCode": "DHAI"
  },
  "1112": {
    "provinceCode": "DNO",
    "districtCode": "DRL",
    "precinctCode": "QTIN"
  },
  "1113": {
    "provinceCode": "KGI",
    "districtCode": "VTH",
    "precinctCode": "VTHA"
  },
  "1114": {
    "provinceCode": "BTH",
    "districtCode": "PTH",
    "precinctCode": "PTAI"
  },
  "1115": {
    "provinceCode": "THO",
    "districtCode": "TGI",
    "precinctCode": "TLA0"
  },
  "1116": {
    "provinceCode": "LDO",
    "districtCode": "BLO",
    "precinctCode": "0002"
  },
  "1117": {
    "provinceCode": "QNI",
    "districtCode": "QHA",
    "precinctCode": "QLON"
  },
  "1118": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "TXUA"
  },
  "1119": {
    "provinceCode": "QNI",
    "districtCode": "UBI",
    "precinctCode": "TSON"
  },
  "1120": {
    "provinceCode": "THO",
    "districtCode": "TGI",
    "precinctCode": "HTHA"
  },
  "1122": {
    "provinceCode": "QTR",
    "districtCode": "CLO",
    "precinctCode": "CTHA"
  },
  "1124": {
    "provinceCode": "LDO",
    "districtCode": "DDU",
    "precinctCode": "DRAN"
  },
  "1125": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "TNUN"
  },
  "1126": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "VDUO"
  },
  "1128": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "TLON"
  },
  "1131": {
    "provinceCode": "QNI",
    "districtCode": "QHA",
    "precinctCode": "QCHI"
  },
  "1133": {
    "provinceCode": "HTI",
    "districtCode": "CLO",
    "precinctCode": "TLOC"
  },
  "1134": {
    "provinceCode": "GLA",
    "districtCode": "AKH",
    "precinctCode": "THAN"
  },
  "1135": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "QHAU"
  },
  "1138": {
    "provinceCode": "LCA",
    "districtCode": "SPA",
    "precinctCode": "TPHU"
  },
  "1139": {
    "provinceCode": "KHO",
    "districtCode": "CRA",
    "precinctCode": "CLIN"
  },
  "1140": {
    "provinceCode": "LCA",
    "districtCode": "SPA",
    "precinctCode": "SAPA"
  },
  "1141": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "CKHE"
  },
  "1142": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "TTRU"
  },
  "1143": {
    "provinceCode": "AGI",
    "districtCode": "CPH",
    "precinctCode": "BCHU"
  },
  "1144": {
    "provinceCode": "TNI",
    "districtCode": "TNI",
    "precinctCode": "MDUC"
  },
  "1146": {
    "provinceCode": "DNI",
    "districtCode": "TNH",
    "precinctCode": "XTHA"
  },
  "1147": {
    "provinceCode": "GLA",
    "districtCode": "PLE",
    "precinctCode": "CHDR"
  },
  "1148": {
    "provinceCode": "LDO",
    "districtCode": "DTR",
    "precinctCode": "HIAN"
  },
  "1150": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "TXUA"
  },
  "1151": {
    "provinceCode": "DNI",
    "districtCode": "DQU",
    "precinctCode": "PHLY"
  },
  "1152": {
    "provinceCode": "HCM",
    "districtCode": "NBE",
    "precinctCode": "NHBE"
  },
  "1153": {
    "provinceCode": "LDO",
    "districtCode": "DHU",
    "precinctCode": "DT"
  },
  "1154": {
    "provinceCode": "LDO",
    "districtCode": "DTR",
    "precinctCode": "LNGH"
  },
  "1155": {
    "provinceCode": "TNG",
    "districtCode": "DTU",
    "precinctCode": "PXUY"
  },
  "1156": {
    "provinceCode": "NDI",
    "districtCode": "NHU",
    "precinctCode": "NHUN"
  },
  "1157": {
    "provinceCode": "BPH",
    "districtCode": "LNI",
    "precinctCode": "TLOC"
  },
  "1158": {
    "provinceCode": "TNI",
    "districtCode": "TNI",
    "precinctCode": "GLOC"
  },
  "1159": {
    "provinceCode": "QNI",
    "districtCode": "MCA",
    "precinctCode": "HXUA"
  },
  "1160": {
    "provinceCode": "THO",
    "districtCode": "TGI",
    "precinctCode": "HAAN"
  },
  "1161": {
    "provinceCode": "TGI",
    "districtCode": "CGA",
    "precinctCode": "MTAN"
  },
  "1162": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "BCHA"
  },
  "1164": {
    "provinceCode": "QNI",
    "districtCode": "CPH",
    "precinctCode": "CONG"
  },
  "1165": {
    "provinceCode": "TNI",
    "districtCode": "CTH",
    "precinctCode": "HHOI"
  },
  "1166": {
    "provinceCode": "DNI",
    "districtCode": "BHO",
    "precinctCode": "PTP"
  },
  "1167": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNA"
  },
  "1168": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "NDON"
  },
  "1169": {
    "provinceCode": "TTH",
    "districtCode": "PDI",
    "precinctCode": "PDIN"
  },
  "1172": {
    "provinceCode": "BGI",
    "districtCode": "HHO",
    "precinctCode": "XCAM"
  },
  "1173": {
    "provinceCode": "QNI",
    "districtCode": "QHA",
    "precinctCode": "QTAN"
  },
  "1174": {
    "provinceCode": "HDU",
    "districtCode": "NSA",
    "precinctCode": "AQUO"
  },
  "1175": {
    "provinceCode": "BGI",
    "districtCode": "BGI",
    "precinctCode": "TNHA"
  },
  "1176": {
    "provinceCode": "HNO",
    "districtCode": "HKI",
    "precinctCode": "PTAN"
  },
  "1177": {
    "provinceCode": "HNO",
    "districtCode": "GLA",
    "precinctCode": "XBDE"
  },
  "1178": {
    "provinceCode": "QTR",
    "districtCode": "CLO",
    "precinctCode": "CAAN"
  },
  "1179": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "KBAC"
  },
  "1180": {
    "provinceCode": "DLA",
    "districtCode": "KBU",
    "precinctCode": "PDRA"
  },
  "1181": {
    "provinceCode": "QTR",
    "districtCode": "VLI",
    "precinctCode": "BQUA"
  },
  "1182": {
    "provinceCode": "PYE",
    "districtCode": "PHO",
    "precinctCode": "HTRI"
  },
  "1183": {
    "provinceCode": "KGI",
    "districtCode": "PQU",
    "precinctCode": "HTHO"
  },
  "1184": {
    "provinceCode": "QNA",
    "districtCode": "HAN",
    "precinctCode": "CAPH"
  },
  "1185": {
    "provinceCode": "TGI",
    "districtCode": "TPH",
    "precinctCode": "TAL2"
  },
  "1186": {
    "provinceCode": "TGI",
    "districtCode": "TPH",
    "precinctCode": "THTH"
  },
  "1187": {
    "provinceCode": "BDU",
    "districtCode": "BCA",
    "precinctCode": "THOA"
  },
  "1188": {
    "provinceCode": "QNG",
    "districtCode": "NHA",
    "precinctCode": "HTHI"
  },
  "1189": {
    "provinceCode": "HNO",
    "districtCode": "TOA",
    "precinctCode": "DHOA"
  },
  "1190": {
    "provinceCode": "QNI",
    "districtCode": "TYE",
    "precinctCode": "DHAI"
  },
  "1191": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "TBIN"
  },
  "1192": {
    "provinceCode": "CBA",
    "districtCode": "QUY",
    "precinctCode": "CABO"
  },
  "1193": {
    "provinceCode": "TVI",
    "districtCode": "DHA",
    "precinctCode": "TLHO"
  },
  "1194": {
    "provinceCode": "TVI",
    "districtCode": "DHA",
    "precinctCode": "TLHO"
  },
  "1195": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "ADON"
  },
  "1196": {
    "provinceCode": "CMA",
    "districtCode": "CMA",
    "precinctCode": "AXUY"
  },
  "1198": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "HNA0"
  },
  "1199": {
    "provinceCode": "HNO",
    "districtCode": "TTR",
    "precinctCode": "TLIE"
  },
  "1200": {
    "provinceCode": "TQU",
    "districtCode": "NHA",
    "precinctCode": "YHOA"
  },
  "1201": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "THT2"
  },
  "1202": {
    "provinceCode": "BDU",
    "districtCode": "DAN",
    "precinctCode": "DIAN"
  },
  "1203": {
    "provinceCode": "SLA",
    "districtCode": "PYE",
    "precinctCode": "PYEN"
  },
  "1204": {
    "provinceCode": "HDU",
    "districtCode": "THA",
    "precinctCode": "TBIN"
  },
  "1205": {
    "provinceCode": "AGI",
    "districtCode": "CMO",
    "precinctCode": "KIAN"
  },
  "1206": {
    "provinceCode": "HPH",
    "districtCode": "ADU",
    "precinctCode": "PADO"
  },
  "1207": {
    "provinceCode": "BRV",
    "districtCode": "VTA",
    "precinctCode": "RDUA"
  },
  "1208": {
    "provinceCode": "HYE",
    "districtCode": "TPHYEN",
    "precinctCode": "XTHUN"
  },
  "1209": {
    "provinceCode": "TBI",
    "districtCode": "QPH",
    "precinctCode": "AKHE"
  },
  "1210": {
    "provinceCode": "BPH",
    "districtCode": "TPDXOA",
    "precinctCode": "TTHA"
  },
  "1211": {
    "provinceCode": "HCM",
    "districtCode": "TPH",
    "precinctCode": "TSNH"
  },
  "1212": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "GNIN"
  },
  "1214": {
    "provinceCode": "TQU",
    "districtCode": "TQU",
    "precinctCode": "LVUO"
  },
  "1215": {
    "provinceCode": "TNI",
    "districtCode": "TBA",
    "precinctCode": "ATIN"
  },
  "1216": {
    "provinceCode": "PYE",
    "districtCode": "SCA",
    "precinctCode": "XCAN"
  },
  "1217": {
    "provinceCode": "KGI",
    "districtCode": "PQU",
    "precinctCode": "GDAU"
  },
  "1218": {
    "provinceCode": "TGI",
    "districtCode": "CBE",
    "precinctCode": "HKHA"
  },
  "1219": {
    "provinceCode": "BDI",
    "districtCode": "QNH",
    "precinctCode": "NVCU"
  },
  "1220": {
    "provinceCode": "HYE",
    "districtCode": "VGI",
    "precinctCode": "NTRU"
  },
  "1221": {
    "provinceCode": "TTH",
    "districtCode": "QPXU",
    "precinctCode": "PTHO"
  },
  "1222": {
    "provinceCode": "HNO",
    "districtCode": "BDI",
    "precinctCode": "GIVO"
  },
  "1223": {
    "provinceCode": "QTR",
    "districtCode": "TPH",
    "precinctCode": "AITU"
  },
  "1224": {
    "provinceCode": "BDU",
    "districtCode": "BCA",
    "precinctCode": "PHAN"
  },
  "1225": {
    "provinceCode": "BRV",
    "districtCode": "PHMY",
    "precinctCode": "XCPA"
  },
  "1227": {
    "provinceCode": "KON",
    "districtCode": "NHO",
    "precinctCode": "BO Y"
  },
  "1228": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "HKHA"
  },
  "1229": {
    "provinceCode": "BTH",
    "districtCode": "PTH",
    "precinctCode": "PNAM"
  },
  "1231": {
    "provinceCode": "THO",
    "districtCode": "NCO",
    "precinctCode": "TBIN"
  },
  "1232": {
    "provinceCode": "QBI",
    "districtCode": "QTR",
    "precinctCode": "QHOP"
  },
  "1233": {
    "provinceCode": "VLO",
    "districtCode": "TBI",
    "precinctCode": "BMIN"
  },
  "1234": {
    "provinceCode": "THO",
    "districtCode": "TGI",
    "precinctCode": "HTHA"
  },
  "1235": {
    "provinceCode": "HNO",
    "districtCode": "PXU",
    "precinctCode": "PDUC"
  },
  "1236": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "KNIE"
  },
  "1237": {
    "provinceCode": "YBA",
    "districtCode": "TYE",
    "precinctCode": "HCUO"
  },
  "1238": {
    "provinceCode": "HDU",
    "districtCode": "GLO",
    "precinctCode": "TTIE"
  },
  "1239": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "VG"
  },
  "1241": {
    "provinceCode": "DNA",
    "districtCode": "NHS",
    "precinctCode": "KHMY"
  },
  "1242": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "TCAU"
  },
  "1243": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "TTRI"
  },
  "1244": {
    "provinceCode": "PTH",
    "districtCode": "TTH",
    "precinctCode": "HOXA"
  },
  "1245": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "VG"
  },
  "1246": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "AKHE"
  },
  "1247": {
    "provinceCode": "SLA",
    "districtCode": "MCH",
    "precinctCode": "CLON"
  },
  "1248": {
    "provinceCode": "BDU",
    "districtCode": "BTU",
    "precinctCode": "BIMY"
  },
  "1249": {
    "provinceCode": "QNI",
    "districtCode": "QHA",
    "precinctCode": "QMIN"
  },
  "1251": {
    "provinceCode": "HPH",
    "districtCode": "LCH",
    "precinctCode": "ABIE"
  },
  "1252": {
    "provinceCode": "BTH",
    "districtCode": "TLI",
    "precinctCode": "DBIN"
  },
  "1253": {
    "provinceCode": "TNG",
    "districtCode": "DTU",
    "precinctCode": "PXUY"
  },
  "1255": {
    "provinceCode": "LDO",
    "districtCode": "BLO",
    "precinctCode": "DBRI"
  },
  "1256": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "BKHE"
  },
  "1257": {
    "provinceCode": "DBI",
    "districtCode": "DBP",
    "precinctCode": "MTHA"
  },
  "1258": {
    "provinceCode": "HNO",
    "districtCode": "TTI",
    "precinctCode": "TMIN"
  },
  "1259": {
    "provinceCode": "NAN",
    "districtCode": "KSO",
    "precinctCode": "BTHA"
  },
  "1261": {
    "provinceCode": "HYE",
    "districtCode": "TXMHA",
    "precinctCode": "PPDP"
  },
  "1262": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "VNIN"
  },
  "1263": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "VEAN"
  },
  "1264": {
    "provinceCode": "LAN",
    "districtCode": "THO",
    "precinctCode": "TNHO"
  },
  "1265": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "NTRA"
  },
  "1266": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "LLOI"
  },
  "1267": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "TLIE"
  },
  "1268": {
    "provinceCode": "QNI",
    "districtCode": "UBI",
    "precinctCode": "TSON"
  },
  "1269": {
    "provinceCode": "THO",
    "districtCode": "NGSO",
    "precinctCode": "PTLAM"
  },
  "1270": {
    "provinceCode": "BKA",
    "districtCode": "BBE",
    "precinctCode": "PLOC"
  },
  "1271": {
    "provinceCode": "BTH",
    "districtCode": "PTH",
    "precinctCode": "MUNE"
  },
  "1272": {
    "provinceCode": "LAN",
    "districtCode": "DHO",
    "precinctCode": "TPTA"
  },
  "1273": {
    "provinceCode": "NTH",
    "districtCode": "PRT",
    "precinctCode": "DVIN"
  },
  "1274": {
    "provinceCode": "YBA",
    "districtCode": "VYE",
    "precinctCode": "XUAI"
  },
  "1275": {
    "provinceCode": "HNO",
    "districtCode": "TTR",
    "precinctCode": "YEMY"
  },
  "1276": {
    "provinceCode": "HTI",
    "districtCode": "HKH",
    "precinctCode": "HKHE"
  },
  "1277": {
    "provinceCode": "LAN",
    "districtCode": "TAN",
    "precinctCode": "0003"
  },
  "1278": {
    "provinceCode": "AGI",
    "districtCode": "LXU",
    "precinctCode": "MLON"
  },
  "1279": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "DAMI"
  },
  "1280": {
    "provinceCode": "HYE",
    "districtCode": "VGI",
    "precinctCode": "NTRU"
  },
  "1281": {
    "provinceCode": "BRV",
    "districtCode": "CDU",
    "precinctCode": "KLON"
  },
  "1282": {
    "provinceCode": "HBI",
    "districtCode": "MCH",
    "precinctCode": "DBAN"
  },
  "1283": {
    "provinceCode": "HDU",
    "districtCode": "NGI",
    "precinctCode": "XHPH"
  },
  "1285": {
    "provinceCode": "LDO",
    "districtCode": "LHA",
    "precinctCode": "GLAM"
  },
  "1286": {
    "provinceCode": "HYE",
    "districtCode": "KCH",
    "precinctCode": "VHOA"
  },
  "1287": {
    "provinceCode": "BPH",
    "districtCode": "HQU",
    "precinctCode": "TKHA"
  },
  "1288": {
    "provinceCode": "STR",
    "districtCode": "CTH",
    "precinctCode": "ANIN"
  },
  "1289": {
    "provinceCode": "TGI",
    "districtCode": "CBE",
    "precinctCode": "HKHA"
  },
  "1290": {
    "provinceCode": "HTI",
    "districtCode": "KAN",
    "precinctCode": "STRI"
  },
  "1291": {
    "provinceCode": "BDU",
    "districtCode": "DAN",
    "precinctCode": "DHOA"
  },
  "1293": {
    "provinceCode": "STR",
    "districtCode": "LPH",
    "precinctCode": "TBIN"
  },
  "1294": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "HXUA"
  },
  "1295": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "PHOA"
  },
  "1296": {
    "provinceCode": "HPH",
    "districtCode": "AHA",
    "precinctCode": "VNIE"
  },
  "1297": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "NK"
  },
  "1298": {
    "provinceCode": "TQU",
    "districtCode": "YSO",
    "precinctCode": "HKHA"
  },
  "1299": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "HNA0"
  },
  "1300": {
    "provinceCode": "HNO",
    "districtCode": "BVI",
    "precinctCode": "SODA"
  },
  "1301": {
    "provinceCode": "PYE",
    "districtCode": "DHO",
    "precinctCode": "HHNA"
  },
  "1302": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "TMA1"
  },
  "1303": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "TLIE"
  },
  "1304": {
    "provinceCode": "PTH",
    "districtCode": "CKH",
    "precinctCode": "DLUN"
  },
  "1305": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "0003"
  },
  "1306": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "YHOA"
  },
  "1307": {
    "provinceCode": "HNO",
    "districtCode": "TLI",
    "precinctCode": "TAHO"
  },
  "1308": {
    "provinceCode": "BRV",
    "districtCode": "BRI",
    "precinctCode": "PHUN"
  },
  "1309": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "TIAN"
  },
  "1310": {
    "provinceCode": "HYE",
    "districtCode": "YMY",
    "precinctCode": "089"
  },
  "1311": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "NIXA"
  },
  "1312": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "TIAN"
  },
  "1313": {
    "provinceCode": "KGI",
    "districtCode": "VTH",
    "precinctCode": "VPHO"
  },
  "1314": {
    "provinceCode": "PTH",
    "districtCode": "LTH",
    "precinctCode": "HCUO"
  },
  "1315": {
    "provinceCode": "TBI",
    "districtCode": "HHA",
    "precinctCode": "HNHA"
  },
  "1316": {
    "provinceCode": "QNA",
    "districtCode": "HAN"
  },
  "1317": {
    "provinceCode": "PTH",
    "districtCode": "VTR",
    "precinctCode": "BHAC"
  },
  "1318": {
    "provinceCode": "HDU",
    "districtCode": "KMO",
    "precinctCode": "LNIN"
  },
  "1319": {
    "provinceCode": "STR",
    "districtCode": "STR",
    "precinctCode": "0009"
  },
  "1320": {
    "provinceCode": "HCM",
    "districtCode": "CCH",
    "precinctCode": "CCHI"
  },
  "1321": {
    "provinceCode": "QNI",
    "districtCode": "CPH",
    "precinctCode": "CTAY"
  },
  "1322": {
    "provinceCode": "VPH",
    "districtCode": "VPH",
    "precinctCode": "VPH"
  },
  "1323": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "BODE"
  },
  "1324": {
    "provinceCode": "KHO",
    "districtCode": "DKH",
    "precinctCode": "DPH1"
  },
  "1326": {
    "provinceCode": "BDU",
    "districtCode": "TPDAN",
    "precinctCode": "DIAN"
  },
  "1327": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "TLIE"
  },
  "1328": {
    "provinceCode": "HBI",
    "districtCode": "KBO",
    "precinctCode": "TNON"
  },
  "1329": {
    "provinceCode": "HNO",
    "districtCode": "DAN",
    "precinctCode": "XCAN"
  },
  "1330": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "TIAN"
  },
  "1331": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "YESO"
  },
  "1332": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "TCHA"
  },
  "1333": {
    "provinceCode": "HNO",
    "districtCode": "HDO",
    "precinctCode": "KHUN"
  },
  "1334": {
    "provinceCode": "QNG",
    "districtCode": "NHA",
    "precinctCode": "HTTA"
  },
  "1335": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1338": {
    "provinceCode": "HNO",
    "districtCode": "DAN",
    "precinctCode": "KCHU"
  },
  "1339": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "TTIEN"
  },
  "1340": {
    "provinceCode": "TBI",
    "districtCode": "HHA",
    "precinctCode": "HOAN"
  },
  "1341": {
    "provinceCode": "PTH",
    "districtCode": "TAS",
    "precinctCode": "MTHU"
  },
  "1342": {
    "provinceCode": "HPH",
    "districtCode": "KAN",
    "precinctCode": "LNHA"
  },
  "1343": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "0003"
  },
  "1344": {
    "provinceCode": "HGA",
    "districtCode": "DVA",
    "precinctCode": "DVAN"
  },
  "1345": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "HHAI"
  },
  "1346": {
    "provinceCode": "LCA",
    "districtCode": "BTH",
    "precinctCode": "PNHU"
  },
  "1347": {
    "provinceCode": "BLI",
    "districtCode": "BLI",
    "precinctCode": "TPBLI"
  },
  "1348": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "KBAC"
  },
  "1349": {
    "provinceCode": "QNA",
    "districtCode": "NTH",
    "precinctCode": "TANH"
  },
  "1350": {
    "provinceCode": "HDU",
    "districtCode": "NSA",
    "precinctCode": "TDAT"
  },
  "1351": {
    "provinceCode": "HDU",
    "districtCode": "GLO",
    "precinctCode": "THUN"
  },
  "1352": {
    "provinceCode": "LCH",
    "districtCode": "TDU",
    "precinctCode": "BILU"
  },
  "1353": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "PTHUN"
  },
  "1354": {
    "provinceCode": "HDU",
    "districtCode": "NSA",
    "precinctCode": "QTUA"
  },
  "1355": {
    "provinceCode": "KGI",
    "districtCode": "PQU",
    "precinctCode": "HNIN"
  },
  "1356": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "NTRA"
  },
  "1357": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "XHUA"
  },
  "1358": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "VHOA"
  },
  "1359": {
    "provinceCode": "HDU",
    "districtCode": "CGI",
    "precinctCode": "CAAN"
  },
  "1360": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNT"
  },
  "1361": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "VHOA"
  },
  "1362": {
    "provinceCode": "HPH",
    "districtCode": "NQU",
    "precinctCode": "MATO"
  },
  "1363": {
    "provinceCode": "HYE",
    "districtCode": "YMY",
    "precinctCode": "XNVL"
  },
  "1364": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1365": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "HLIN"
  },
  "1366": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1367": {
    "provinceCode": "HDU",
    "districtCode": "NSA",
    "precinctCode": "TTAN"
  },
  "1368": {
    "provinceCode": "LDO",
    "districtCode": "DLI",
    "precinctCode": "DTHO"
  },
  "1369": {
    "provinceCode": "GLA",
    "districtCode": "CPA",
    "precinctCode": "IKHU"
  },
  "1370": {
    "provinceCode": "HNA",
    "districtCode": "LNH",
    "precinctCode": "BALY"
  },
  "1371": {
    "provinceCode": "HPH",
    "districtCode": "HAN",
    "precinctCode": "CABI"
  },
  "1372": {
    "provinceCode": "NAN",
    "districtCode": "HNG",
    "precinctCode": "NHUN"
  },
  "1373": {
    "provinceCode": "QNI",
    "districtCode": "YHUN",
    "precinctCode": "LHOA"
  },
  "1374": {
    "provinceCode": "TNI",
    "districtCode": "DMC",
    "precinctCode": "SUDA"
  },
  "1375": {
    "provinceCode": "HDU",
    "districtCode": "BGI",
    "precinctCode": "KSAT"
  },
  "1376": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "BHAN"
  },
  "1377": {
    "provinceCode": "HDU",
    "districtCode": "CLI",
    "precinctCode": "TDAN"
  },
  "1378": {
    "provinceCode": "HDU",
    "districtCode": "CLI",
    "precinctCode": "VAAN"
  },
  "1379": {
    "provinceCode": "HDU",
    "districtCode": "CLI",
    "precinctCode": "VAAN"
  },
  "1380": {
    "provinceCode": "HPH",
    "districtCode": "",
    "precinctCode": ""
  },
  "1381": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "TMIN"
  },
  "1382": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HKHA"
  },
  "1384": {
    "provinceCode": "BDU",
    "districtCode": "TAN",
    "precinctCode": "TBIN"
  },
  "1385": {
    "provinceCode": "HGI",
    "districtCode": "PHI",
    "precinctCode": "PPHU"
  },
  "1387": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNA"
  },
  "1389": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "0005"
  },
  "1390": {
    "provinceCode": "LDO",
    "districtCode": "DLA",
    "precinctCode": "THAN"
  },
  "1391": {
    "provinceCode": "NAN",
    "districtCode": "HNG",
    "precinctCode": "HTAY"
  },
  "1392": {
    "provinceCode": "PTH",
    "districtCode": "TAS",
    "precinctCode": "LDON"
  },
  "1393": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "QUVO"
  },
  "1394": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "HNA0"
  },
  "1395": {
    "provinceCode": "HDU",
    "districtCode": "NSA",
    "precinctCode": "XAP"
  },
  "1396": {
    "provinceCode": "TTH",
    "districtCode": "PDI",
    "precinctCode": "PHIE"
  },
  "1397": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "VCUO"
  },
  "1398": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1399": {
    "provinceCode": "HDU",
    "districtCode": "CLI",
    "precinctCode": "SADO"
  },
  "1400": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "VHOA"
  },
  "1401": {
    "provinceCode": "BKA",
    "districtCode": "NRI",
    "precinctCode": "ATIN"
  },
  "1402": {
    "provinceCode": "CTH",
    "districtCode": "BTH",
    "precinctCode": "BTHU"
  },
  "1403": {
    "provinceCode": "HDU",
    "districtCode": "THA",
    "precinctCode": "THAI"
  },
  "1404": {
    "provinceCode": "DNA",
    "districtCode": "CLE",
    "precinctCode": "HOAN"
  },
  "1405": {
    "provinceCode": "DTH",
    "districtCode": "TBI",
    "precinctCode": "PLOI"
  },
  "1406": {
    "provinceCode": "HDU",
    "districtCode": "KTH",
    "precinctCode": "DDUC"
  },
  "1407": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HKHA"
  },
  "1408": {
    "provinceCode": "HDU",
    "districtCode": "KMO",
    "precinctCode": "ASIN"
  },
  "1409": {
    "provinceCode": "TBI",
    "districtCode": "TBI",
    "precinctCode": "TLAM"
  },
  "1410": {
    "provinceCode": "HDU",
    "districtCode": "TXKMO",
    "precinctCode": "QATHANH"
  },
  "1411": {
    "provinceCode": "PTH",
    "districtCode": "TNO",
    "precinctCode": "TVAN"
  },
  "1412": {
    "provinceCode": "BTH",
    "districtCode": "HTN",
    "precinctCode": "TLAP"
  },
  "1413": {
    "provinceCode": "CTH",
    "districtCode": "OMO",
    "precinctCode": "OMON"
  },
  "1414": {
    "provinceCode": "TTH",
    "districtCode": "HTR",
    "precinctCode": "HVIN"
  },
  "1415": {
    "provinceCode": "BPH",
    "districtCode": "BDA",
    "precinctCode": "DNAI"
  },
  "1416": {
    "provinceCode": "HCM",
    "districtCode": "CCH",
    "precinctCode": "CCHI"
  },
  "1417": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "QCHA"
  },
  "1418": {
    "provinceCode": "KHO",
    "districtCode": "NHO",
    "precinctCode": "NTHA"
  },
  "1420": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1430": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1437": {
    "provinceCode": "HTI",
    "districtCode": "DTH",
    "precinctCode": "DUAN"
  },
  "1438": {
    "provinceCode": "CTH",
    "districtCode": "BTH",
    "precinctCode": "BHNG"
  },
  "1439": {
    "provinceCode": "KGI",
    "districtCode": "PQU",
    "precinctCode": "GDAU"
  },
  "1440": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "APHU"
  },
  "1441": {
    "provinceCode": "THO",
    "districtCode": "HTR",
    "precinctCode": "HLON"
  },
  "1442": {
    "provinceCode": "VLO",
    "districtCode": "VLO",
    "precinctCode": "0009"
  },
  "1443": {
    "provinceCode": "TNI",
    "districtCode": "HTH",
    "precinctCode": "LHO"
  },
  "1444": {
    "provinceCode": "THO",
    "districtCode": "TGI",
    "precinctCode": "BMIN"
  },
  "1445": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "QTRU"
  },
  "1446": {
    "provinceCode": "PTH",
    "districtCode": "VTR",
    "precinctCode": "TMIE"
  },
  "1447": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "CTHU"
  },
  "1448": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "HNI1"
  },
  "1449": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "TNHT"
  },
  "1450": {
    "provinceCode": "TNI",
    "districtCode": "CTH",
    "precinctCode": "TDIE"
  },
  "1451": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "VTHC"
  },
  "1452": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "CTHU"
  },
  "1453": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "CXAN"
  },
  "1454": {
    "provinceCode": "HPH",
    "districtCode": "NQU",
    "precinctCode": "LKTH"
  },
  "1455": {
    "provinceCode": "QNI",
    "districtCode": "HBO",
    "precinctCode": "LLOI"
  },
  "1456": {
    "provinceCode": "VPH",
    "districtCode": "LTH",
    "precinctCode": "XHOA"
  },
  "1457": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "TLIE"
  },
  "1458": {
    "provinceCode": "TBI",
    "districtCode": "DHU",
    "precinctCode": "HOLU"
  },
  "1460": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "TGIA"
  },
  "1461": {
    "provinceCode": "NBI",
    "districtCode": "YMO",
    "precinctCode": "YEMY"
  },
  "1462": {
    "provinceCode": "DLA",
    "districtCode": "KPA",
    "precinctCode": "KBUK"
  },
  "1463": {
    "provinceCode": "HDU",
    "districtCode": "GLO",
    "precinctCode": "THUN"
  },
  "1465": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "PTHUN"
  },
  "1466": {
    "provinceCode": "DNA",
    "districtCode": "NHS",
    "precinctCode": "KHMY"
  },
  "1467": {
    "provinceCode": "DNA",
    "districtCode": "NHS",
    "precinctCode": "BMAN"
  },
  "1468": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1469": {
    "provinceCode": "TGI",
    "districtCode": "CTH",
    "precinctCode": "THUO"
  },
  "1470": {
    "provinceCode": "VLO",
    "districtCode": "LHO",
    "precinctCode": "THAN"
  },
  "1471": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "BHAN"
  },
  "1474": {
    "provinceCode": "HNA",
    "districtCode": "TLI",
    "precinctCode": "LTUY"
  },
  "1475": {
    "provinceCode": "HYE",
    "districtCode": "TPHYEN",
    "precinctCode": "PVP"
  },
  "1476": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "NHCH"
  },
  "1477": {
    "provinceCode": "HNO",
    "districtCode": "SSO"
  },
  "1478": {
    "provinceCode": "TBI",
    "districtCode": "TBI",
    "precinctCode": "THDA"
  },
  "1481": {
    "provinceCode": "BPH",
    "districtCode": "PLN",
    "precinctCode": "LBIN"
  },
  "1482": {
    "provinceCode": "HTI",
    "districtCode": "HLI",
    "precinctCode": "DLIE"
  },
  "1483": {
    "provinceCode": "HNO",
    "districtCode": "TXU",
    "precinctCode": "HDIN"
  },
  "1484": {
    "provinceCode": "LDO",
    "districtCode": "DTR",
    "precinctCode": "HTHA"
  },
  "1485": {
    "provinceCode": "HNO",
    "districtCode": "SSO"
  },
  "1486": {
    "provinceCode": "BRV",
    "districtCode": "CDU",
    "precinctCode": "BTRU"
  },
  "1487": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "PTHUN"
  },
  "1488": {
    "provinceCode": "TGI",
    "districtCode": "CTH",
    "precinctCode": "LHUN"
  },
  "1489": {
    "provinceCode": "HDU",
    "districtCode": "BGI",
    "precinctCode": "THON"
  },
  "1491": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1492": {
    "provinceCode": "DNO",
    "districtCode": "DRL",
    "precinctCode": "QTIN"
  },
  "1493": {
    "provinceCode": "HTI",
    "districtCode": "HKH",
    "precinctCode": "HUTR"
  },
  "1495": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "CXAN"
  },
  "1496": {
    "provinceCode": "KGI",
    "districtCode": "PQU",
    "precinctCode": "CDUO"
  },
  "1497": {
    "provinceCode": "BGI",
    "districtCode": "BGI",
    "precinctCode": "PTMY"
  },
  "1498": {
    "provinceCode": "VPH",
    "districtCode": "PYE",
    "precinctCode": "TTRA"
  },
  "1499": {
    "provinceCode": "NBI",
    "districtCode": "NBI",
    "precinctCode": "TNAM"
  },
  "1500": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "PDHUO"
  },
  "1501": {
    "provinceCode": "GLA",
    "districtCode": "CSE",
    "precinctCode": "IHRU"
  },
  "1502": {
    "provinceCode": "CTH",
    "districtCode": "OMO",
    "precinctCode": "LHUN"
  },
  "1503": {
    "provinceCode": "TGI",
    "districtCode": "CTH",
    "precinctCode": "LHUN"
  },
  "1504": {
    "provinceCode": "GLA",
    "districtCode": "CSE",
    "precinctCode": "HBON"
  },
  "1505": {
    "provinceCode": "PTH",
    "districtCode": "CKH",
    "precinctCode": "PKHE"
  },
  "1506": {
    "provinceCode": "PTH",
    "districtCode": "TTH",
    "precinctCode": "KHTHTHUY"
  },
  "1507": {
    "provinceCode": "PTH",
    "districtCode": "TTH",
    "precinctCode": "TTHU"
  },
  "1508": {
    "provinceCode": "BPH",
    "districtCode": "BDA",
    "precinctCode": "DNAI"
  },
  "1509": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "BTHA"
  },
  "1511": {
    "provinceCode": "NDI",
    "districtCode": "NDI",
    "precinctCode": "NML"
  },
  "1512": {
    "provinceCode": "HTI",
    "districtCode": "HTI",
    "precinctCode": "PLOC"
  },
  "1513": {
    "provinceCode": "HPH",
    "districtCode": "HBA",
    "precinctCode": "PDB"
  },
  "1515": {
    "provinceCode": "HPH",
    "districtCode": "ADU",
    "precinctCode": "LSON"
  },
  "1516": {
    "provinceCode": "AGI",
    "districtCode": "APH",
    "precinctCode": "KBIN"
  },
  "1517": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "AKHA"
  },
  "1518": {
    "provinceCode": "DLA",
    "districtCode": "KBU",
    "precinctCode": "BUHO"
  },
  "1519": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "NHA"
  },
  "1530": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "DTIE"
  },
  "1531": {
    "provinceCode": "LCA",
    "districtCode": "LCA",
    "precinctCode": "LCAI"
  },
  "1532": {
    "provinceCode": "DNI",
    "districtCode": "VCU",
    "precinctCode": "TRAN"
  },
  "1533": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "BCHA"
  },
  "1534": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "AKHE"
  },
  "1535": {
    "provinceCode": "PTH",
    "districtCode": "PTH",
    "precinctCode": "AUCO"
  },
  "1536": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "TADO"
  },
  "1537": {
    "provinceCode": "DLA",
    "districtCode": "KPA",
    "precinctCode": "EKNU"
  },
  "1538": {
    "provinceCode": "QNI",
    "districtCode": "VDO",
    "precinctCode": "HLON"
  },
  "1539": {
    "provinceCode": "QTR",
    "districtCode": "QTR",
    "precinctCode": "HALE"
  },
  "1540": {
    "provinceCode": "QBI",
    "districtCode": "QNI",
    "precinctCode": "GNIN"
  },
  "1541": {
    "provinceCode": "HBI",
    "districtCode": "LSO",
    "precinctCode": "PLUO"
  },
  "1542": {
    "provinceCode": "DNI",
    "districtCode": "BHO",
    "precinctCode": "LBIN"
  },
  "1543": {
    "provinceCode": "QNI",
    "districtCode": "YHU",
    "precinctCode": "QYEN"
  },
  "1544": {
    "provinceCode": "HTI",
    "districtCode": "DTH",
    "precinctCode": "DUAN"
  },
  "1545": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "TCHA"
  },
  "1546": {
    "provinceCode": "TGI",
    "districtCode": "MTH",
    "precinctCode": "DTHA"
  },
  "1547": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "TMIN"
  },
  "1548": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1549": {
    "provinceCode": "HPH",
    "districtCode": "NQU",
    "precinctCode": "GVIE"
  },
  "1550": {
    "provinceCode": "HPH",
    "districtCode": "VBA",
    "precinctCode": "THUN"
  },
  "1551": {
    "provinceCode": "DNI",
    "districtCode": "VCU",
    "precinctCode": "TAAN"
  },
  "1552": {
    "provinceCode": "HPH",
    "districtCode": "NQU",
    "precinctCode": "GVIE"
  },
  "1553": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "BHAN"
  },
  "1554": {
    "provinceCode": "HDU",
    "districtCode": "TMI",
    "precinctCode": "NQUY"
  },
  "1555": {
    "provinceCode": "HDU",
    "districtCode": "TCLIN",
    "precinctCode": "XHDAO"
  },
  "1556": {
    "provinceCode": "DNA",
    "districtCode": "NHS",
    "precinctCode": "HQUY"
  },
  "1557": {
    "provinceCode": "HTI",
    "districtCode": "KAN",
    "precinctCode": "KKHA"
  },
  "1558": {
    "provinceCode": "VPH",
    "districtCode": "VYE",
    "precinctCode": "NQUY"
  },
  "1559": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1560": {
    "provinceCode": "HYE",
    "districtCode": "TXMHA",
    "precinctCode": "PPDP"
  },
  "1561": {
    "provinceCode": "HNO",
    "districtCode": "TTI",
    "precinctCode": "HVAN"
  },
  "1562": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1563": {
    "provinceCode": "HBI",
    "districtCode": "HBI",
    "precinctCode": "HBIN"
  },
  "1564": {
    "provinceCode": "TGI",
    "districtCode": "MTH",
    "precinctCode": "DTHA"
  },
  "1565": {
    "provinceCode": "BDU",
    "districtCode": "TPDAN",
    "precinctCode": "BDUO"
  },
  "1566": {
    "provinceCode": "DLA",
    "districtCode": "KPA",
    "precinctCode": "HDON"
  },
  "1567": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "LLOI"
  },
  "1568": {
    "provinceCode": "BRV",
    "districtCode": "PHMY",
    "precinctCode": "PHMY"
  },
  "1569": {
    "provinceCode": "HPH",
    "districtCode": "ALA",
    "precinctCode": "ATHI"
  },
  "1570": {
    "provinceCode": "BPH",
    "districtCode": "LNI",
    "precinctCode": "LDIE"
  },
  "1571": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "PCUO"
  },
  "1572": {
    "provinceCode": "HCM",
    "districtCode": "001",
    "precinctCode": "BTHA"
  },
  "1573": {
    "provinceCode": "CTH",
    "districtCode": "CTH",
    "precinctCode": "CRAN"
  },
  "1574": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "TCHA"
  },
  "1576": {
    "provinceCode": "AGI",
    "districtCode": "LXU",
    "precinctCode": "MXUY"
  },
  "1577": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "TAAN"
  },
  "1578": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "VTRU"
  },
  "1579": {
    "provinceCode": "QNG",
    "districtCode": "QNG",
    "precinctCode": "TATA"
  },
  "1580": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "CXAN"
  },
  "1581": {
    "provinceCode": "DNI",
    "districtCode": "TBO",
    "precinctCode": "STHA"
  },
  "1582": {
    "provinceCode": "SLA",
    "districtCode": "SMA",
    "precinctCode": "SOMA"
  },
  "1583": {
    "provinceCode": "VLO",
    "districtCode": "VLO",
    "precinctCode": "TRAN"
  },
  "1584": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "HYEN"
  },
  "1588": {
    "provinceCode": "HPH",
    "districtCode": "LCH",
    "precinctCode": "DHAI"
  },
  "1589": {
    "provinceCode": "VLO",
    "districtCode": "TON",
    "precinctCode": "VXUA"
  },
  "1590": {
    "provinceCode": "HDU",
    "districtCode": "KMO",
    "precinctCode": "MTAN"
  },
  "1591": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "HPHU"
  },
  "1592": {
    "provinceCode": "AGI",
    "districtCode": "LXU",
    "precinctCode": "MBIN"
  },
  "1593": {
    "provinceCode": "VLO",
    "districtCode": "MTH",
    "precinctCode": "NPHU"
  },
  "1594": {
    "provinceCode": "CTH",
    "districtCode": "BTH",
    "precinctCode": "LTUY"
  },
  "1595": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "HTHA"
  },
  "1596": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "ABIN"
  },
  "1597": {
    "provinceCode": "CTH",
    "districtCode": "CTH",
    "precinctCode": "CRAN"
  },
  "1598": {
    "provinceCode": "LCA",
    "districtCode": "LCA",
    "precinctCode": "CDUO"
  },
  "1599": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "TTIE"
  },
  "1600": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "APHU"
  },
  "1605": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "ABIN"
  },
  "1606": {
    "provinceCode": "HCM",
    "districtCode": "012",
    "precinctCode": "TTHI"
  },
  "1607": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "NPHU"
  },
  "1608": {
    "provinceCode": "CTH",
    "districtCode": "CTH",
    "precinctCode": "CRAN"
  },
  "1609": {
    "provinceCode": "HYE",
    "districtCode": "ATH",
    "precinctCode": "XTRU"
  },
  "1610": {
    "provinceCode": "NAN",
    "districtCode": "TDU",
    "precinctCode": "KIDA"
  },
  "1611": {
    "provinceCode": "SLA",
    "districtCode": "SCO",
    "precinctCode": "SCOP"
  },
  "1612": {
    "provinceCode": "QNI",
    "districtCode": "HLO",
    "precinctCode": "THDA"
  },
  "1613": {
    "provinceCode": "HPH",
    "districtCode": "LCH",
    "precinctCode": "ADUO"
  },
  "1614": {
    "provinceCode": "CTH",
    "districtCode": "BTH",
    "precinctCode": "LTUY"
  },
  "1615": {
    "provinceCode": "QBI",
    "districtCode": "BTR",
    "precinctCode": "HTR2"
  },
  "1616": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "TAAN"
  },
  "1617": {
    "provinceCode": "SLA",
    "districtCode": "MCH",
    "precinctCode": "LLUO"
  },
  "1618": {
    "provinceCode": "BNI",
    "districtCode": "QVO",
    "precinctCode": "LIEU"
  },
  "1619": {
    "provinceCode": "YBA",
    "districtCode": "TYE",
    "precinctCode": "QMON"
  },
  "1620": {
    "provinceCode": "DLA",
    "districtCode": "KPA",
    "precinctCode": "EAUY"
  },
  "1621": {
    "provinceCode": "SLA",
    "districtCode": "SLA",
    "precinctCode": "CCOI"
  },
  "1622": {
    "provinceCode": "CTH",
    "districtCode": "CTH",
    "precinctCode": "CRAN"
  },
  "1623": {
    "provinceCode": "DBI",
    "districtCode": "DBP",
    "precinctCode": "TMIN"
  },
  "1624": {
    "provinceCode": "CTH",
    "districtCode": "CTH",
    "precinctCode": "CRAN"
  },
  "1625": {
    "provinceCode": "KHO",
    "districtCode": "NHO",
    "precinctCode": "NHOA"
  },
  "1626": {
    "provinceCode": "LAN",
    "districtCode": "TTA",
    "precinctCode": "TTH1"
  },
  "1627": {
    "provinceCode": "NAN",
    "districtCode": "QLU",
    "precinctCode": "HMA0"
  },
  "1628": {
    "provinceCode": "TNG",
    "districtCode": "DHY",
    "precinctCode": "LSON"
  },
  "1629": {
    "provinceCode": "HPH",
    "districtCode": "LCH",
    "precinctCode": "CDAI"
  },
  "1630": {
    "provinceCode": "TNI",
    "districtCode": "TNI",
    "precinctCode": "0002"
  },
  "1631": {
    "provinceCode": "BNI",
    "districtCode": "TTH",
    "precinctCode": "TKHU"
  },
  "1632": {
    "provinceCode": "DNI",
    "districtCode": "LTH",
    "precinctCode": "TPHU"
  },
  "1633": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "ALDO"
  },
  "1634": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "TAAN"
  },
  "1635": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "TLIE"
  },
  "1636": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1637": {
    "provinceCode": "CBA",
    "districtCode": "HLA",
    "precinctCode": "DQUA"
  },
  "1638": {
    "provinceCode": "HPH",
    "districtCode": "HAN",
    "precinctCode": "DHA0"
  },
  "1639": {
    "provinceCode": "HPH",
    "districtCode": "AHA",
    "precinctCode": "DHA0"
  },
  "1640": {
    "provinceCode": "CMA",
    "districtCode": "CMA",
    "precinctCode": "AXUY"
  },
  "1641": {
    "provinceCode": "SLA",
    "districtCode": "TCH",
    "precinctCode": "TCHA"
  },
  "1648": {
    "provinceCode": "HNO",
    "districtCode": "HKI",
    "precinctCode": "CNAM"
  },
  "1649": {
    "provinceCode": "DNA",
    "districtCode": "TKH",
    "precinctCode": "TGIA"
  },
  "1650": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "DVAN"
  },
  "1651": {
    "provinceCode": "HNO",
    "districtCode": "DDA",
    "precinctCode": "PVM-QTG"
  },
  "1652": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HKHA"
  },
  "1654": {
    "provinceCode": "HNO",
    "districtCode": "HDU",
    "precinctCode": "AKHA"
  },
  "1657": {
    "provinceCode": "LDO",
    "districtCode": "BLO",
    "precinctCode": "PBL"
  },
  "1658": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HNIN"
  },
  "1659": {
    "provinceCode": "CBA",
    "districtCode": "HAN",
    "precinctCode": "NHUE"
  },
  "1660": {
    "provinceCode": "HNA",
    "districtCode": "TLI",
    "precinctCode": "LTUY"
  },
  "1661": {
    "provinceCode": "HPH",
    "districtCode": "DSO",
    "precinctCode": "NXUY"
  },
  "1662": {
    "provinceCode": "HNO",
    "districtCode": "HDU",
    "precinctCode": "DGIA"
  },
  "1663": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "PDHUO"
  },
  "1664": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "QPHU"
  },
  "1665": {
    "provinceCode": "STR",
    "districtCode": "MTU",
    "precinctCode": "HPHU"
  },
  "1667": {
    "provinceCode": "BTH",
    "districtCode": "PTH",
    "precinctCode": "PTHU"
  },
  "1668": {
    "provinceCode": "DLA",
    "districtCode": "KBU",
    "precinctCode": "BUHO"
  },
  "1669": {
    "provinceCode": "DLA",
    "districtCode": "KBU",
    "precinctCode": "BUHO"
  },
  "1670": {
    "provinceCode": "HPH",
    "districtCode": "HAN",
    "precinctCode": "TTO"
  },
  "1671": {
    "provinceCode": "HDU",
    "districtCode": "NSA",
    "precinctCode": "HPHO"
  },
  "1672": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TLUO"
  },
  "1674": {
    "provinceCode": "HNO",
    "districtCode": "TOA",
    "precinctCode": "TTHU"
  },
  "1678": {
    "provinceCode": "VPH",
    "districtCode": "TDU",
    "precinctCode": "HHO0"
  },
  "1679": {
    "provinceCode": "HCM",
    "districtCode": "BCH",
    "precinctCode": "TTAO"
  },
  "1680": {
    "provinceCode": "THO",
    "districtCode": "THA",
    "precinctCode": "TTRU"
  },
  "1681": {
    "provinceCode": "HCM",
    "districtCode": "HMO",
    "precinctCode": "DHTH"
  },
  "1682": {
    "provinceCode": "LCH",
    "districtCode": "TUY",
    "precinctCode": "MTHA"
  },
  "1683": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "GSAN"
  },
  "1684": {
    "provinceCode": "BGI",
    "districtCode": "BGI",
    "precinctCode": "MYDO"
  },
  "1685": {
    "provinceCode": "TNI",
    "districtCode": "TNI",
    "precinctCode": "TTAN"
  },
  "1686": {
    "provinceCode": "YBA",
    "districtCode": "VYE",
    "precinctCode": "MAUA"
  },
  "1689": {
    "provinceCode": "DBI",
    "districtCode": "DBP",
    "precinctCode": "TMIN"
  },
  "1690": {
    "provinceCode": "BGI",
    "districtCode": "YDU",
    "precinctCode": "DVIE"
  },
  "1691": {
    "provinceCode": "THO",
    "districtCode": "NCO",
    "precinctCode": "TVAN"
  },
  "1692": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "QPHU"
  },
  "1693": {
    "provinceCode": "HCM",
    "districtCode": "BTA",
    "precinctCode": "BTDO"
  },
  "1695": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "HTHA"
  },
  "1696": {
    "provinceCode": "HCM",
    "districtCode": "PNH",
    "precinctCode": "0002"
  },
  "1697": {
    "provinceCode": "HNO",
    "districtCode": "LBI",
    "precinctCode": "LBIE"
  },
  "1698": {
    "provinceCode": "BDU",
    "districtCode": "TAN",
    "precinctCode": "BHOA"
  },
  "1699": {
    "provinceCode": "HCM",
    "districtCode": "TPH",
    "precinctCode": "TSNH"
  },
  "1700": {
    "provinceCode": "CTH",
    "districtCode": "BTH",
    "precinctCode": "LTUY"
  },
  "1701": {
    "provinceCode": "TNG",
    "districtCode": "DHY",
    "precinctCode": "LSON"
  },
  "1702": {
    "provinceCode": "BDU",
    "districtCode": "TPDAN",
    "precinctCode": "DIAN"
  },
  "1703": {
    "provinceCode": "DLA",
    "districtCode": "BMT",
    "precinctCode": "TALO"
  },
  "1704": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "GXUY"
  },
  "1705": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "TBIN"
  },
  "1706": {
    "provinceCode": "HCM",
    "districtCode": "007",
    "precinctCode": "TPHN"
  },
  "1707": {
    "provinceCode": "HCM",
    "districtCode": "BCH",
    "precinctCode": "ALAC"
  },
  "1708": {
    "provinceCode": "HPH",
    "districtCode": "HAN",
    "precinctCode": "LDU"
  },
  "1709": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "DHUO"
  },
  "1710": {
    "provinceCode": "HCM",
    "districtCode": "012",
    "precinctCode": "TMTA"
  },
  "1711": {
    "provinceCode": "HCM",
    "districtCode": "008",
    "precinctCode": "0016"
  },
  "1713": {
    "provinceCode": "HCM",
    "districtCode": "BTA",
    "precinctCode": "ALAC"
  },
  "1714": {
    "provinceCode": "TVI",
    "districtCode": "CTH",
    "precinctCode": "NHOA"
  },
  "1715": {
    "provinceCode": "DBI",
    "districtCode": "TGI",
    "precinctCode": "MDAN"
  },
  "1716": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "TTHI"
  },
  "1717": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "TLAP"
  },
  "1718": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "QTHA"
  },
  "1719": {
    "provinceCode": "BDU",
    "districtCode": "TPTAN",
    "precinctCode": "TGIA"
  },
  "1724": {
    "provinceCode": "VPH",
    "districtCode": "VYE",
    "precinctCode": "TSON"
  },
  "1725": {
    "provinceCode": "QNI",
    "districtCode": "CPH",
    "precinctCode": "CONG"
  },
  "1726": {
    "provinceCode": "QBI",
    "districtCode": "BDO",
    "precinctCode": "BDON"
  },
  "1729": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "ATAO"
  },
  "1730": {
    "provinceCode": "LDO",
    "districtCode": "DTE",
    "precinctCode": "DPAL"
  },
  "1731": {
    "provinceCode": "HYE",
    "districtCode": "VGI",
    "precinctCode": "NTRU"
  },
  "1732": {
    "provinceCode": "LDO",
    "districtCode": "DLI",
    "precinctCode": "DTTH"
  },
  "1733": {
    "provinceCode": "BNI",
    "districtCode": "BNI",
    "precinctCode": "SHOA"
  },
  "1734": {
    "provinceCode": "HYE",
    "districtCode": "VGI",
    "precinctCode": "NTRU"
  },
  "1735": {
    "provinceCode": "NBI",
    "districtCode": "PHL",
    "precinctCode": "PNT"
  },
  "1736": {
    "provinceCode": "HNO",
    "districtCode": "DAN",
    "precinctCode": "KCHU"
  },
  "1737": {
    "provinceCode": "HNO",
    "districtCode": "HDU",
    "precinctCode": "AKHA"
  },
  "1738": {
    "provinceCode": "KHO",
    "districtCode": "CLA",
    "precinctCode": "CHBA"
  },
  "1739": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "PBIN"
  },
  "1740": {
    "provinceCode": "HCM",
    "districtCode": "HMO",
    "precinctCode": "DHTH"
  },
  "1741": {
    "provinceCode": "DNI",
    "districtCode": "CMY",
    "precinctCode": "XQUE"
  },
  "1742": {
    "provinceCode": "KHO",
    "districtCode": "CLA",
    "precinctCode": "CHDO"
  },
  "1743": {
    "provinceCode": "THO",
    "districtCode": "NLA",
    "precinctCode": "KTHO"
  },
  "1744": {
    "provinceCode": "TBI",
    "districtCode": "TBI",
    "precinctCode": "VCHI"
  },
  "1745": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TLUO"
  },
  "1746": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "QTHA"
  },
  "1747": {
    "provinceCode": "HPH",
    "districtCode": "LCH",
    "precinctCode": "TCAU"
  },
  "1748": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TLUO"
  },
  "1749": {
    "provinceCode": "NTH",
    "districtCode": "TNA",
    "precinctCode": "NHHA"
  },
  "1750": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "GSAN"
  },
  "1751": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "HSON"
  },
  "1752": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TLUO"
  },
  "1753": {
    "provinceCode": "NTH",
    "districtCode": "PRT",
    "precinctCode": "MHAI"
  },
  "1754": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "HDUHDUPBH"
  },
  "1755": {
    "provinceCode": "LSO",
    "districtCode": "BSO",
    "precinctCode": "VULE"
  },
  "1756": {
    "provinceCode": "DLA",
    "districtCode": "CMG",
    "precinctCode": "QPHU"
  },
  "1757": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TLON"
  },
  "1758": {
    "provinceCode": "VLO",
    "districtCode": "VLO",
    "precinctCode": "TNGA"
  },
  "1759": {
    "provinceCode": "NTH",
    "districtCode": "PRT",
    "precinctCode": "TTAI"
  },
  "1760": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "PTRI"
  },
  "1761": {
    "provinceCode": "NTH",
    "districtCode": "NHA",
    "precinctCode": "XHAI"
  },
  "1762": {
    "provinceCode": "DBI",
    "districtCode": "DBI",
    "precinctCode": "THAN"
  },
  "1763": {
    "provinceCode": "VPH",
    "districtCode": "VYE",
    "precinctCode": "TSON"
  },
  "1764": {
    "provinceCode": "KGI",
    "districtCode": "RGI",
    "precinctCode": "VTVA"
  },
  "1765": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "VTHH"
  },
  "1766": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "BKHE"
  },
  "1767": {
    "provinceCode": "NTH",
    "districtCode": "PRT",
    "precinctCode": "DLON"
  },
  "1768": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TLUO"
  },
  "1769": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "HTHA"
  },
  "1770": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "QTHA"
  },
  "1771": {
    "provinceCode": "HCM",
    "districtCode": "TDU",
    "precinctCode": "CLAI"
  },
  "1772": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "HNA0"
  },
  "1773": {
    "provinceCode": "TNG",
    "districtCode": "DHY",
    "precinctCode": "LSON"
  },
  "1774": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "QTHA"
  },
  "1775": {
    "provinceCode": "KGI",
    "districtCode": "RGI",
    "precinctCode": "VTVA"
  },
  "1776": {
    "provinceCode": "TNG",
    "districtCode": "PBI",
    "precinctCode": "TKHA"
  },
  "1777": {
    "provinceCode": "HNO",
    "districtCode": "HDU",
    "precinctCode": "DNOI"
  },
  "1778": {
    "provinceCode": "HCM",
    "districtCode": "012",
    "precinctCode": "THAN"
  },
  "1779": {
    "provinceCode": "DNI",
    "districtCode": "NTR",
    "precinctCode": "NHT3"
  },
  "1780": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "LENIN"
  },
  "1781": {
    "provinceCode": "HPH",
    "districtCode": "HBA",
    "precinctCode": "PBCH"
  },
  "1782": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "LTNG"
  },
  "1783": {
    "provinceCode": "BTR",
    "districtCode": "CTH",
    "precinctCode": "PTUC"
  },
  "1784": {
    "provinceCode": "THO",
    "districtCode": "NCO",
    "precinctCode": "MKHO"
  },
  "1785": {
    "provinceCode": "BPH",
    "districtCode": "BDA",
    "precinctCode": "TNHA"
  },
  "1786": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TLUO"
  },
  "1787": {
    "provinceCode": "HCM",
    "districtCode": "012",
    "precinctCode": "DHTH"
  },
  "1788": {
    "provinceCode": "HCM",
    "districtCode": "012",
    "precinctCode": "TTHI"
  },
  "1789": {
    "provinceCode": "BRV",
    "districtCode": "CDU",
    "precinctCode": "KLON"
  },
  "1790": {
    "provinceCode": "HPH",
    "districtCode": "TPTN",
    "precinctCode": "PALU"
  },
  "1791": {
    "provinceCode": "HPH",
    "districtCode": "HAN",
    "precinctCode": "LDU"
  },
  "1792": {
    "provinceCode": "DNI",
    "districtCode": "CMY",
    "precinctCode": "XQUE"
  },
  "1793": {
    "provinceCode": "HPH",
    "districtCode": "LCH",
    "precinctCode": "DHAN"
  },
  "1794": {
    "provinceCode": "HCM",
    "districtCode": "TPH",
    "precinctCode": "TTHN"
  },
  "1795": {
    "provinceCode": "HCM",
    "districtCode": "HMO",
    "precinctCode": "HMON"
  },
  "1796": {
    "provinceCode": "CTH",
    "districtCode": "BTH",
    "precinctCode": "TADO"
  },
  "1798": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "QTRI"
  },
  "1800": {
    "provinceCode": "VPH",
    "districtCode": "VTU",
    "precinctCode": "TTAN"
  },
  "1801": {
    "provinceCode": "HDU",
    "districtCode": "TMI",
    "precinctCode": "NQUY"
  },
  "1802": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "HTHA"
  },
  "1803": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "037"
  },
  "1804": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "QTRI"
  },
  "1805": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "MKHA"
  },
  "1806": {
    "provinceCode": "QNI",
    "districtCode": "CPH",
    "precinctCode": "CHAI"
  },
  "1807": {
    "provinceCode": "QNI",
    "districtCode": "VDO",
    "precinctCode": "HLON"
  },
  "1808": {
    "provinceCode": "TBI",
    "districtCode": "TBI",
    "precinctCode": "DTHO"
  },
  "1809": {
    "provinceCode": "BTH",
    "districtCode": "PTH"
  },
  "1810": {
    "provinceCode": "HCM",
    "districtCode": "TBI",
    "precinctCode": "0015"
  },
  "1811": {
    "provinceCode": "HNO",
    "districtCode": "NTL",
    "precinctCode": "TAMO"
  },
  "1812": {
    "provinceCode": "BTH",
    "districtCode": "PTH"
  },
  "1814": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "HTHA"
  },
  "1815": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "TMA0"
  },
  "1816": {
    "provinceCode": "PTH",
    "districtCode": "PTH",
    "precinctCode": "AUCO"
  },
  "1817": {
    "provinceCode": "QNI",
    "districtCode": "CPH",
    "precinctCode": "CONG"
  },
  "1818": {
    "provinceCode": "HNO",
    "districtCode": "TLI",
    "precinctCode": "TAMO"
  },
  "1819": {
    "provinceCode": "HNO",
    "districtCode": "NTL",
    "precinctCode": "TAMO"
  },
  "1820": {
    "provinceCode": "DNI",
    "districtCode": "LTH",
    "precinctCode": "LOA1"
  },
  "1821": {
    "provinceCode": "DNA",
    "districtCode": "CLE",
    "precinctCode": "HTTA"
  },
  "1822": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "CGIA"
  },
  "1823": {
    "provinceCode": "HNO",
    "districtCode": "HDO",
    "precinctCode": "PHL1"
  },
  "1824": {
    "provinceCode": "HPH",
    "districtCode": "NQU",
    "precinctCode": "GVIE"
  },
  "1825": {
    "provinceCode": "HCM",
    "districtCode": "TPH",
    "precinctCode": "PTHA"
  },
  "1826": {
    "provinceCode": "BTH",
    "districtCode": "HTH",
    "precinctCode": "TNAM"
  },
  "1827": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "HTHA"
  },
  "1828": {
    "provinceCode": "DNI",
    "districtCode": "TBO",
    "precinctCode": "HTHI"
  },
  "1829": {
    "provinceCode": "HCM",
    "districtCode": "012",
    "precinctCode": "TMTA"
  },
  "1830": {
    "provinceCode": "LSO",
    "districtCode": "BSO",
    "precinctCode": "VULE"
  },
  "1831": {
    "provinceCode": "HNO",
    "districtCode": "NTL",
    "precinctCode": "XPHU"
  },
  "1832": {
    "provinceCode": "TBI",
    "districtCode": "TBI",
    "precinctCode": "THDA"
  },
  "1833": {
    "provinceCode": "QNI",
    "districtCode": "VDO",
    "precinctCode": "HLON"
  },
  "1834": {
    "provinceCode": "BTH",
    "districtCode": "HTB",
    "precinctCode": "HTHA"
  },
  "1835": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "TLON"
  },
  "1836": {
    "provinceCode": "HNO",
    "districtCode": "TLI",
    "precinctCode": "XPHU"
  },
  "1837": {
    "provinceCode": "THO",
    "districtCode": "THO",
    "precinctCode": "AHUN"
  },
  "1838": {
    "provinceCode": "HCM",
    "districtCode": "BTA",
    "precinctCode": "BTDO"
  },
  "1839": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "PTLAP"
  },
  "1840": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "CGIA"
  },
  "1841": {
    "provinceCode": "BTH",
    "districtCode": "PTH"
  },
  "1842": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "VHUN"
  },
  "1843": {
    "provinceCode": "HCM",
    "districtCode": "012",
    "precinctCode": "APDO"
  },
  "1844": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "QTRI"
  },
  "1845": {
    "provinceCode": "KGI",
    "districtCode": "RGI",
    "precinctCode": "VLAC"
  },
  "1846": {
    "provinceCode": "KGI",
    "districtCode": "GRI",
    "precinctCode": "VTHA"
  },
  "1847": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HKHA"
  },
  "1848": {
    "provinceCode": "DNA",
    "districtCode": "NHS",
    "precinctCode": "DMAN"
  },
  "1849": {
    "provinceCode": "HCM",
    "districtCode": "BCH",
    "precinctCode": "BHUN"
  },
  "1850": {
    "provinceCode": "QNA",
    "districtCode": "TKY",
    "precinctCode": "HHUO"
  },
  "1852": {
    "provinceCode": "HNO",
    "districtCode": "BVI",
    "precinctCode": "YBAI"
  },
  "1853": {
    "provinceCode": "HNO",
    "districtCode": "HDO",
    "precinctCode": "PHL1"
  },
  "1854": {
    "provinceCode": "HCM",
    "districtCode": "012",
    "precinctCode": "TTHI"
  },
  "1855": {
    "provinceCode": "TNG",
    "districtCode": "TNG",
    "precinctCode": "HVTH"
  },
  "1858": {
    "provinceCode": "BTH",
    "districtCode": "PTH",
    "precinctCode": "THAI"
  },
  "1859": {
    "provinceCode": "HDU",
    "districtCode": "HDU",
    "precinctCode": "THUG"
  },
  "1860": {
    "provinceCode": "QNI",
    "districtCode": "HBO",
    "precinctCode": "BACA"
  },
  "1861": {
    "provinceCode": "HPH",
    "districtCode": "TPTN",
    "precinctCode": "PHLA"
  },
  "1862": {
    "provinceCode": "LAN",
    "districtCode": "CGI",
    "precinctCode": "LOAN"
  },
  "1863": {
    "provinceCode": "LAN",
    "districtCode": "TTA",
    "precinctCode": "TNIN"
  },
  "1864": {
    "provinceCode": "LDO",
    "districtCode": "DDU",
    "precinctCode": "0PRO"
  },
  "1865": {
    "provinceCode": "LAN",
    "districtCode": "CGI",
    "precinctCode": "LOAN"
  },
  "1866": {
    "provinceCode": "CTH",
    "districtCode": "NKI",
    "precinctCode": "TAAN"
  },
  "1867": {
    "provinceCode": "QNI",
    "districtCode": "HHA",
    "precinctCode": "QUHA"
  },
  "1868": {
    "provinceCode": "CTH",
    "districtCode": "CTH",
    "precinctCode": "CRAN"
  },
  "1869": {
    "provinceCode": "HYE",
    "districtCode": "HYE",
    "precinctCode": "MKHA"
  },
  "1870": {
    "provinceCode": "DTH",
    "districtCode": "CAH",
    "precinctCode": "TTDO"
  },
  "1871": {
    "provinceCode": "LSO",
    "districtCode": "BSO",
    "precinctCode": "VULE"
  },
  "1872": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "NKIM"
  },
  "1873": {
    "provinceCode": "HNO",
    "districtCode": "BTL",
    "precinctCode": "DNGA"
  },
  "1874": {
    "provinceCode": "DNA",
    "districtCode": "HVA",
    "precinctCode": "HKHA"
  },
  "1875": {
    "provinceCode": "THO",
    "districtCode": "HLO",
    "precinctCode": "HLO1"
  },
  "1876": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "DCUN"
  },
  "1877": {
    "provinceCode": "HPH",
    "districtCode": "TNG",
    "precinctCode": "HBIN"
  },
  "1878": {
    "provinceCode": "NAN",
    "districtCode": "VIN",
    "precinctCode": "NDC"
  },
  "1879": {
    "provinceCode": "QNA",
    "districtCode": "TKY",
    "precinctCode": "TNGO"
  },
  "1880": {
    "provinceCode": "AGI",
    "districtCode": "TTO",
    "precinctCode": "NUTO"
  },
  "1881": {
    "provinceCode": "NTH",
    "districtCode": "PRT",
    "precinctCode": "DHAI"
  },
  "1882": {
    "provinceCode": "HCM",
    "districtCode": "TPH",
    "precinctCode": "TSNH"
  },
  "1883": {
    "provinceCode": "HNO",
    "districtCode": "CGI",
    "precinctCode": "TLIE"
  },
  "1884": {
    "provinceCode": "QNI",
    "districtCode": "CPH",
    "precinctCode": "CPHU"
  },
  "1885": {
    "provinceCode": "KHO",
    "districtCode": "NTR",
    "precinctCode": "BTAN"
  },
  "1886": {
    "provinceCode": "HNO",
    "districtCode": "HMA",
    "precinctCode": "DCON"
  },
  "1887": {
    "provinceCode": "VPH",
    "districtCode": "VYE",
    "precinctCode": "DTAM"
  },
  "1888": {
    "provinceCode": "TBI",
    "districtCode": "TBI",
    "precinctCode": "DHOA"
  },
  "1889": {
    "provinceCode": "QNI",
    "districtCode": "MCA",
    "precinctCode": "TPHU"
  },
  "1890": {
    "provinceCode": "HNO",
    "districtCode": "HDO",
    "precinctCode": "KHUN"
  },
  "1891": {
    "provinceCode": "HCM",
    "districtCode": "BCH",
    "precinctCode": "ALAC"
  }
};
