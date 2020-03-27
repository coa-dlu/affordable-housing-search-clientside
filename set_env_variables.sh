[ -f data_hub_api_endpoint.js ] || echo "const data_hub_api_endpoint = "$DATA_HUB_API_ENDPOINT";" > data_hub_api_endpoint.js
[ -f mapbox_public_key.js ] || echo "const mapbox_public_key = "$MAPBOX_PUBLIC_KEY";" > mapbox_public_key.js
