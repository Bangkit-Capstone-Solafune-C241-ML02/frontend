import json
import sys
import os

def update_base_url(file_path, new_base_url):
    # Membaca file JSON
    with open(file_path, 'r') as file:
        config = json.load(file)
    
    # Memperbarui nilai BASE_URL
    config['BASE_URL'] = new_base_url
    
    # Menyimpan perubahan kembali ke file JSON
    with open(file_path, 'w') as file:
        json.dump(config, file, indent=4)
    
    print(f"BASE_URL telah diperbarui menjadi {new_base_url}")

if __name__ == "__main__":
    # Mengecek apakah argumen sudah benar
    if len(sys.argv) != 2:
        print("Penggunaan: python change_config.py <new_base_url>")
        sys.exit(1)
    
    new_base_url = sys.argv[1]
    wd = os.getcwd()
    file_path = os.path.join(wd,'json','config.json')  # Nama file JSON
    
    update_base_url(file_path, new_base_url)
