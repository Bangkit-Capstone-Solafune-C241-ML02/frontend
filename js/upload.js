createInputFields();

const convertBtn = document.getElementById('convertBtn');
convertBtn.disabled = true;

// Fungsi untuk membuat input fields
function createInputFields() {
    document.getElementById('SelectBand').style.display = 'block';
    const container = document.getElementById('dynamicFields');
    container.innerHTML = '';
  
    const bandOptions = [
        'B1 (Aerosols)',
        'B2 (Blue)',
        'B3 (Green)',
        'B4 (Red)',
        'B5 (Red Edge 1)',
        'B6 (Red Edge 2)',
        'B7 (Red Edge 3)',
        'B8 (NIR)',
        'B8A (Red Edge 4)',
        'B9 (Water vapor)',
        'B11 (SWIR 1)',
        'B12 (SWIR 2)',
    ];
  
    const defaultValues = ['B1 (Aerosols)', 'B2 (Blue)', 'B3 (Green)'];
  
    for (let i = 1; i <= 3; i++) {
        const select = document.createElement('select');
        select.classList.add('form-select', 'my-2');
        select.id = `dropdownField${i}`;
  
        bandOptions.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            if (optionText === defaultValues[i - 1]) {
                option.selected = true;
            }
            select.appendChild(option);
        });
  
        container.appendChild(select);
    }
  
    // Create Convert Button
    const convertButtonContainer = document.getElementById('convertButtonContainer');
    convertButtonContainer.innerHTML = ''; // Clear previous button if any
  
    const convertBtn = document.createElement('button');
    convertBtn.id = 'convertBtn';
    convertBtn.classList.add('btn', 'btn-primary', 'my-2');
    convertBtn.innerHTML = '<span id="convertText">Convert</span><span id="convertSpinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display: none;"></span> <i class="bi bi-arrow-repeat" id="convertIcon"></i>';
  
    convertBtn.addEventListener('click', async () => {
        const convertText = document.getElementById('convertText');
        const convertSpinner = document.getElementById('convertSpinner');
        const convertIcon = document.getElementById('convertIcon');
  
        convertBtn.disabled = true;
        convertText.textContent = "Loading...";
        convertIcon.style.display = "none";
        convertSpinner.style.display = "inline-block";
  
        const selectedValues = [];
        for (let i = 1; i <= 3; i++) {
            const dropdown = document.getElementById(`dropdownField${i}`);
            selectedValues.push(dropdown.value);
        }
  
        await sendDropdownValues(mapDropdownValues(selectedValues));
  
        // Reset button
        convertText.textContent = "Convert";
        convertSpinner.style.display = "none";
        convertIcon.style.display = "inline-block";
        convertBtn.disabled = false;
    });
  
    convertButtonContainer.appendChild(convertBtn);
}
  
// Fungsi untuk mengirim nilai dropdown
async function sendDropdownValues(values) {
    const config = await loadConfig();
    const endpoint = `${config.BASE_URL}${config.ENDPOINTS.CONVERT_UPLOAD}`; // Placeholder endpoint
  
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values })
        });
  
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
  
        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
  
        const imgElement = document.getElementById('upload-image');
        imgElement.src = imgUrl;
        imgElement.style.display = 'block';
  
        // Menampilkan gambar dalam modal
        setupModal("upload-image", "modalUpload", "img01", "caption");
    } catch (error) {
        console.error('Error sending dropdown values:', error);
    }
}
  
// Fungsi untuk memetakan nilai dropdown
function mapDropdownValues(values) {
    const mapping = {
        'B1 (Aerosols)': 1,
        'B2 (Blue)': 2,
        'B3 (Green)': 3,
        'B4 (Red)': 4,
        'B5 (Red Edge 1)': 5,
        'B6 (Red Edge 2)': 6,
        'B7 (Red Edge 3)': 7,
        'B8 (NIR)': 8,
        'B8A (Red Edge 4)': 9,
        'B9 (Water vapor)': 10,
        'B11 (SWIR 1)': 11,
        'B12 (SWIR 2)': 12
    };
  
    return values.map(value => mapping[value]);
}
  
// Fungsi untuk memuat konfigurasi dari file config.json
async function loadConfig() {
    const response = await fetch('./json/config.json');
    const config = await response.json();
    return config;
}
  
function setupModal(imageId, modalId, modalImgId, captionId) {
    var modal = document.getElementById(modalId);
    var img = document.getElementById(imageId);
    var modalImg = document.getElementById(modalImgId);
    var captionText = document.getElementById(captionId);
  
    img.onclick = function(){
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
    }
  
    var span = modal.getElementsByClassName("close")[0];
    span.onclick = function() { 
        modal.style.display = "none";
    }
}
  
// Fungsi untuk mengirim file .tif
async function handleUpload(event) {
    event.preventDefault();
    const formData = new FormData();
    const fileField = document.getElementById('tifFile');
  
    formData.append('tifFile', fileField.files[0]);
    const config = await loadConfig();
    const endpoint = `${config.BASE_URL}${config.ENDPOINTS.UPLOAD}`; // Placeholder endpoint

    const uploadBtn = document.getElementById('uploadBtn');
    const uploadText = document.getElementById('uploadText');
    const uploadSpinner = document.getElementById('uploadSpinner');
    
    uploadBtn.disabled = true;
    uploadText.textContent = "Loading...";
    uploadSpinner.style.display = "inline-block";
  
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
  
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Menampilkan gambar dalam modal
        setupModal("upload-image", "modalUpload", "img01", "caption");
        setupModal("mask-image", "modalMask", "img02", "caption");
  
        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
  
        const imgElement = document.getElementById('upload-image');
        imgElement.src = imgUrl;
        imgElement.style.display = 'block';

        const imgElementMask = document.getElementById('mask-image');
        imgElementMask.src = imgUrl;
        imgElementMask.style.display = 'block'
  

        // Mengatur ulang field upload
        fileField.value = '';

        const convertBtn = document.getElementById('convertBtn');
        convertBtn.disabled = false;

        // Reset button
        uploadText.textContent = "upload";
        uploadSpinner.style.display = "none";
        uploadBtn.disabled = false;
    } catch (error) {
        console.error('Error:', error);
    }
}
  
document.getElementById('uploadForm').addEventListener('submit', handleUpload);