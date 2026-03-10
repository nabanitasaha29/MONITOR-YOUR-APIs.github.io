
import requests, time, json, os, uuid, re
from datetime import datetime
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from functools import lru_cache

DEFAULT_THRESHOLD = 500

# Base directories (matches your folder layout)
BASE_DIR = os.path.dirname(__file__)
CONFIG_BASE = os.path.join(BASE_DIR, "configFiles")

TYPE_DIR = {
    "fr": "FR_configs",
    "mappers": "Mappers_configs",
    "dcs": "DCS_configs",     
    "dpe": "DPE_configs",     
}

# For FR files: FR_<StateName>_config.json
STATE_CODE_TO_NAME = {
    "RJ": "Rajasthan",
    "TN": "TamilNadu",
    "BR": "Bihar",
    "UP": "UttarPradesh",
    "MH": "Maharashtra",
    "AS": "Assam",
    "CG": "Chhattisgarh",
    "GJ": "Gujarat",
    "OD": "Odisha",
    "AP": "AndhraPradesh",
    "MP": "MadhyaPradesh",
}

def build_config_path_by_type(type_key: str, code: str) -> str:
    type_key = type_key.lower()
    if type_key not in TYPE_DIR:
        raise ValueError(f"Unsupported type: {type_key}")
    subdir = TYPE_DIR[type_key]
    folder = os.path.join(CONFIG_BASE, subdir)

    if type_key == "fr":
        state_name = STATE_CODE_TO_NAME.get(code.upper())
        if not state_name:
            raise ValueError(f"No FR state mapping for code: {code}")
        filename = f"FR_{state_name}_config.json"
    elif type_key == "mappers":
        # Your mapper file naming: MAPPER_<CODE>_config.json (e.g., MAPPER_UP_config.json)
        filename = f"MAPPER_{code.upper()}_config.json"
    elif type_key == "dcs":
        filename = f"DCS_{code.upper()}_config.json"
    elif type_key == "dpe":
        filename = f"DPE_{code.upper()}_config.json"
    else:
        raise ValueError(f"Unknown type: {type_key}")

    return os.path.join(folder, filename)

def extract_value(obj, path):
    try:
        keys = path.replace("$.", "").split(".")
        value = obj
        for key in keys:
            if not isinstance(value, dict):
                return None
            value = value.get(key)
            if value is None:
                return None
        return value
    except Exception:
        return None

def replace_placeholders(obj, dynamic_tokens):
    if isinstance(obj, dict):
        return {k: replace_placeholders(v, dynamic_tokens) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_placeholders(i, dynamic_tokens) for i in obj]
    elif isinstance(obj, str):
        for token_key, token_value in dynamic_tokens.items():
            ph = f"{{{{{token_key}}}}}"
            if ph in obj:
                obj = obj.replace(ph, token_value)
        return obj
    else:
        return obj

@lru_cache(maxsize=64)
def load_config(config_path: str) -> dict:
    if not os.path.isabs(config_path):
        config_path = os.path.join(BASE_DIR, config_path)
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Config not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)

def build_session() -> requests.Session:
    session = requests.Session()
    retries = Retry(
        total=3,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        raise_on_status=False,
    )
    session.mount("https://", HTTPAdapter(max_retries=retries, pool_maxsize=10))
    session.mount("http://", HTTPAdapter(max_retries=retries, pool_maxsize=10))
    session.headers.update({
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
    })
    return session

def run_monitor(selected_group: str | None = None,
                config_path: str | None = None,
                apis: dict | None = None):
    if apis is None:
        if not config_path:
            raise ValueError("Either `apis` or `config_path` must be provided.")
        apis = load_config(config_path)

    tokens = {}
    results = []
    session = build_session()

    for group, api_list in apis.items():
        if selected_group and group != selected_group:
            continue

        for api in api_list:
            start_time = time.time()
            error_message = None
            response_body = None

            dynamic_tokens = tokens.copy()
            dynamic_tokens["message_id"] = str(uuid.uuid4())
            dynamic_tokens["transaction_id"] = str(uuid.uuid4())
            dynamic_tokens["reference_id"] = str(uuid.uuid4())
            dynamic_tokens["message_ts"] = datetime.now().astimezone().isoformat()

            headers = api.get("headers", {}).copy()
            for key, value in headers.items():
                if isinstance(value, str):
                    for tk, tv in dynamic_tokens.items():
                        ph = f"{{{{{tk}}}}}"
                        if ph in value:
                            headers[key] = value.replace(ph, tv)

            payload = replace_placeholders(api.get("payload"), dynamic_tokens)

            status = None
            status_text = None

            try:
                response = session.request(
                    method=api.get("method", "GET"),
                    url=api["url"],
                    json=payload,
                    headers=headers,
                    timeout=30,
                    allow_redirects=True
                )
                status = response.status_code
                status_text = response.reason
                try:
                    response_body = response.json()
                except ValueError:
                    response_body = response.text

                if "extract" in api and isinstance(response_body, (dict, str)):
                    if isinstance(api["extract"], dict):
                        for token_name, rule in api["extract"].items():
                            extracted = None
                            if isinstance(rule, str):
                                if isinstance(response_body, dict):
                                    extracted = extract_value(response_body, rule)
                            elif isinstance(rule, dict):
                                src = None
                                if "from" in rule and isinstance(response_body, dict):
                                    src = extract_value(response_body, rule["from"])
                                elif isinstance(response_body, str):
                                    src = response_body
                                if src is not None and "regex" in rule:
                                    m = re.search(rule["regex"], json.dumps(src))
                                    if m:
                                        extracted = m.group(1) if m.groups() else m.group(0)
                                elif isinstance(src, (str, int, float)):
                                    extracted = str(src)
                            if extracted:
                                tokens[token_name] = extracted

            except requests.exceptions.RequestException as e:
                status = "ERROR"
                status_text = f"{type(e).__name__}: {e}"
                error_message = str(e)

            latency = round((time.time() - start_time) * 1000, 2)
            threshold = api.get("threshold", DEFAULT_THRESHOLD)

            results.append({
                "group": group,
                "category": api.get("category"),
                "state": api.get("state"),
                "group-type": api.get("group-type"),
                "name": api.get("name"),
                "api": api["url"],
                "method": api.get("method", "GET"),
                "status": status,
                "statusText": status_text,
                "latency": latency,
                "slow": latency > threshold,
                "threshold": threshold,
                "body": response_body,
                "payload": payload,
                "error": error_message
            })

            time.sleep(0.6)

    return results