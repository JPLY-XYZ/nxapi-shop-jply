import json

file_path = 'prisma/data/product_images.json'

try:
    with open(file_path, 'r') as f:
        data = json.load(f)

    for item in data:
        if 'id' in item:
            del item['id']

    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)
    
    print("Successfully removed ids")
except Exception as e:
    print(f"Error: {e}")
