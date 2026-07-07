import urllib.request
import json
import base64
import os

B2_KEY_ID = "d60a580d3241"
B2_APPLICATION_KEY = "005dabe5d03949ad4906e4631824fd8ccbd98be4dc"
B2_BUCKET_NAME = "crm2026"
FILENAME = "arlikat_all_databases_backup.sql.gz"
DEST = "arlikat_all_databases_backup.sql.gz"

def main():
    print("Authorizing with B2...")
    url = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account"
    req = urllib.request.Request(url)
    auth_str = f"{B2_KEY_ID}:{B2_APPLICATION_KEY}"
    auth_b64 = base64.b64encode(auth_str.encode()).decode()
    req.add_header("Authorization", f"Basic {auth_b64}")
    
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        download_url = data["downloadUrl"]
        auth_token = data["authorizationToken"]
        
    download_file_url = f"{download_url}/file/{B2_BUCKET_NAME}/{FILENAME}"
    print(f"Downloading {FILENAME} from {download_file_url}...")
    
    req_dl = urllib.request.Request(download_file_url)
    req_dl.add_header("Authorization", auth_token)
    
    with urllib.request.urlopen(req_dl) as response, open(DEST, "wb") as f_out:
        f_out.write(response.read())
        
    print("Download completed!")

if __name__ == "__main__":
    main()
