import urllib.request
import json
import ssl

def download_map():
    # Ignore SSL certificate verification if needed
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    urls = [
        "https://unpkg.com/world-atlas@2/countries-110m.json",
        "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
        "https://raw.githubusercontent.com/topojson/world-atlas/master/countries-110m.json"
    ]
    
    success = False
    log_messages = []
    
    for url in urls:
        try:
            log_messages.append(f"Attempting to download from: {url}")
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            )
            with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
                data = response.read()
                # Parse to ensure it is valid JSON
                parsed = json.loads(data.decode('utf-8'))
                
                # Save locally to frontend public folder
                dest_path = "d:/lombapuai/frontend/public/world-110m.json"
                with open(dest_path, "w", encoding="utf-8") as f:
                    json.dump(parsed, f)
                
                log_messages.append(f"Successfully saved to: {dest_path}")
                success = True
                break
        except Exception as e:
            log_messages.append(f"Failed download from {url}: {e}")
            
    with open("d:/lombapuai/scratch/map_download_log.txt", "w", encoding="utf-8") as lf:
        lf.write("\n".join(log_messages))

if __name__ == "__main__":
    download_map()
