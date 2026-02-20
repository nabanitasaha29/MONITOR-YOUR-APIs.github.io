
# import requests
# import time
# import json
# import os
# import sys

# import uuid
# from datetime import datetime

# DEFAULT_THRESHOLD = 500

# CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config.json")

# with open(CONFIG_FILE, "r") as f:
#     apis = json.load(f)

# # Optional group filter
# selected_group = None
# if len(sys.argv) > 1 and sys.argv[1].strip():
#     selected_group = sys.argv[1].strip()

# results = []
# tokens = {}

# # Use Session
# session = requests.Session()

# # Browser-like defaults (prevents gateway reset)
# session.headers.update({
#     "User-Agent": "Mozilla/5.0",
#     "Accept": "application/json",
#     "Connection": "keep-alive"
# })

# def extract_value(obj, path):
#     """Safer JSON extractor supporting $.token / $.data.token"""
#     try:
#         keys = path.replace("$.", "").split(".")
#         value = obj
#         for key in keys:
#             value = value.get(key)
#             if value is None:
#                 return None
#         return value
#     except:
#         return None

# for group, api_list in apis.items():

#     if selected_group and group != selected_group:
#         continue

#     print(f"\n📦 Running group: {group}", file=sys.stderr)

#     for api in api_list:

#         print(f"➡ Calling API: {api.get('name')}", file=sys.stderr)

#         start_time = time.time()
#         error_message = None
#         response_body = None

#         # Replace header variables {{token}}
#         headers = api.get("headers", {}).copy()
#         for key, value in headers.items():
#             if isinstance(value, str):
#                 for token_key, token_value in tokens.items():
#                     placeholder = f"{{{{{token_key}}}}}"
#                     if placeholder in value:
#                         headers[key] = value.replace(placeholder, token_value)

#         try:
#             response = session.request(
#                 method=api.get("method", "GET"),
#                 url=api["url"],
#                 json=api.get("payload"),
#                 headers=headers,
#                 timeout=15
#             )

#             status = response.status_code

#             try:
#                 response_body = response.json()
#             except:
#                 response_body = response.text

#             # Extract tokens if defined
#             if "extract" in api and isinstance(response_body, dict):
#                 for token_name, json_path in api["extract"].items():
#                     extracted = extract_value(response_body, json_path)
#                     if extracted:
#                         tokens[token_name] = extracted
#                         print(
#                             f"🔑 Extracted {token_name}: {extracted[:25]}...",
#                             file=sys.stderr
#                         )
#                     else:
#                         print(
#                             f"⚠ Failed to extract {token_name} using {json_path}",
#                             file=sys.stderr
#                         )

#         except Exception as e:
#             status = "ERROR"
#             error_message = str(e)
#             print(f"❌ ERROR: {error_message}", file=sys.stderr)

#         latency = round((time.time() - start_time) * 1000, 2)
#         threshold = api.get("threshold", DEFAULT_THRESHOLD)

#         results.append({
#             "group": group,
#             "name": api.get("name"),
#             "api": api["url"],
#             "method": api.get("method", "GET"),
#             "status": status,
#             "latency": latency,
#             "slow": latency > threshold,
#             "threshold": threshold,
#             "body": response_body,
#             "error": error_message
#         })

      
#         time.sleep(0.6)

# print(json.dumps(results))



































import requests
import time
import json
import os
import sys
import uuid
from datetime import datetime

DEFAULT_THRESHOLD = 500
CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config.json")

with open(CONFIG_FILE, "r") as f:
    apis = json.load(f)

# Optional group filter
selected_group = None
if len(sys.argv) > 1 and sys.argv[1].strip():
    selected_group = sys.argv[1].strip()

results = []
tokens = {}

# Use Session
session = requests.Session()

# Browser-like defaults (prevents gateway reset)
session.headers.update({
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
    "Connection": "keep-alive"
})


def extract_value(obj, path):
    """Safer JSON extractor supporting $.token / $.data.token"""
    try:
        keys = path.replace("$.", "").split(".")
        value = obj
        for key in keys:
            value = value.get(key)
            if value is None:
                return None
        return value
    except:
        return None


def replace_placeholders(obj, dynamic_tokens):
    """Recursively replace {{placeholders}} in dict/list/str"""
    if isinstance(obj, dict):
        return {k: replace_placeholders(v, dynamic_tokens) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_placeholders(i, dynamic_tokens) for i in obj]
    elif isinstance(obj, str):
        for token_key, token_value in dynamic_tokens.items():
            placeholder = f"{{{{{token_key}}}}}"
            if placeholder in obj:
                obj = obj.replace(placeholder, token_value)
        return obj
    else:
        return obj


for group, api_list in apis.items():

    if selected_group and group != selected_group:
        continue

    print(f"\n📦 Running group: {group}", file=sys.stderr)

    for api in api_list:

        print(f"➡ Calling API: {api.get('name')}", file=sys.stderr)

        start_time = time.time()
        error_message = None
        response_body = None

        #  Generate dynamic values per call
        dynamic_tokens = tokens.copy()
        dynamic_tokens["message_id"] = str(uuid.uuid4())
        dynamic_tokens["transaction_id"] = str(uuid.uuid4())
        dynamic_tokens["reference_id"] = str(uuid.uuid4())
        dynamic_tokens["message_ts"] = datetime.now().isoformat()

        #  Replace header variables {{token}}
        headers = api.get("headers", {}).copy()
        for key, value in headers.items():
            if isinstance(value, str):
                for token_key, token_value in dynamic_tokens.items():
                    placeholder = f"{{{{{token_key}}}}}"
                    if placeholder in value:
                        headers[key] = value.replace(placeholder, token_value)

        #  Replace payload placeholders
        payload = replace_placeholders(api.get("payload"), dynamic_tokens)

        try:
            response = session.request(
                method=api.get("method", "GET"),
                url=api["url"],
                json=payload,
                headers=headers,
                timeout=15
            )

            status = response.status_code
            status_text = response.reason

            try:
                response_body = response.json()
            except:
                response_body = response.text

            #  Extract tokens if defined
            if "extract" in api and isinstance(response_body, dict):
                for token_name, json_path in api["extract"].items():
                    extracted = extract_value(response_body, json_path)
                    if extracted:
                        tokens[token_name] = extracted
                        print(
                            f"🔑 Extracted {token_name}: {str(extracted)[:25]}...",
                            file=sys.stderr
                        )
                    else:
                        print(
                            f"⚠ Failed to extract {token_name} using {json_path}",
                            file=sys.stderr
                        )

        except Exception as e:
            status = "ERROR"
            error_message = str(e)
            print(f"❌ ERROR: {error_message}", file=sys.stderr)

        latency = round((time.time() - start_time) * 1000, 2)
        threshold = api.get("threshold", DEFAULT_THRESHOLD)

        results.append({
            "group": group,
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

print(json.dumps(results, indent=2))