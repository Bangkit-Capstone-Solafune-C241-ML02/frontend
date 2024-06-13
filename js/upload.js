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
            body: JSON.stringify({ values:values, uid: getUID()})
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
        'B1 (Aerosols)': 0,
        'B2 (Blue)': 1,
        'B3 (Green)': 2,
        'B4 (Red)': 3,
        'B5 (Red Edge 1)': 4,
        'B6 (Red Edge 2)': 5,
        'B7 (Red Edge 3)': 6,
        'B8 (NIR)': 7,
        'B8A (Red Edge 4)': 8,
        'B9 (Water vapor)': 9,
        'B11 (SWIR 1)': 10,
        'B12 (SWIR 2)': 11
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
document.getElementById('tifFile').addEventListener('change', function () {
    const file = this.files[0];
    const uploadBtn = document.getElementById('uploadBtn');
    const fileError = document.getElementById('fileError');

    if (file && (file.type === 'image/tiff' || file.name.endsWith('.tif') || file.name.endsWith('.tiff')) && file.size <= 5 * 1024 * 1024) {
        uploadBtn.disabled = false;
        fileError.style.display = 'none';
    } else {
        uploadBtn.disabled = true;
        fileError.style.display = 'block';
    }
});

async function handleUpload(event) {
    event.preventDefault();
    const formData = new FormData();
    const fileField = document.getElementById('tifFile');

    if (!fileField.files[0]) {
        alert('Please select a file to upload.');
        return;
    }

    formData.append('tifFile', fileField.files[0]);
    formData.append('uid', getUID());
    const config = await loadConfig();
    const endpoint_upload = `${config.BASE_URL}${config.ENDPOINTS.UPLOAD}`;
    const endpoint_mask = `${config.BASE_URL}${config.ENDPOINTS.MASK_UPLOAD}`;
    const endpoint_painting = `${config.BASE_URL}${config.ENDPOINTS.PAINTING_UPLOAD}`;

    const uploadBtn = document.getElementById('uploadBtn');
    const uploadText = document.getElementById('uploadText');
    const uploadSpinner = document.getElementById('uploadSpinner');

    uploadBtn.disabled = true;
    uploadText.textContent = "Loading...";
    uploadSpinner.style.display = "inline-block";

    
    // for (let [key, value] of formData.entries()) {
    //     console.log(`${key}: ${value}`);
    // }

    try {
        // Upload file
        const response_upload = await fetch(endpoint_upload, {
            method: 'POST',
            body: formData,
        });

        if (!response_upload.ok) {
            throw new Error('Network response was not ok');
        }

        const blob_upload = await response_upload.blob();
        const imgUrl_upload = URL.createObjectURL(blob_upload);

        uploadText.textContent = "Detecting...";

        // Upload mask
        const response_mask = await fetch(endpoint_mask, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({uid: getUID() })
        });

        if (!response_mask.ok) {
            throw new Error('Network response was not ok');
        }

        const blob_mask = await response_mask.blob();
        const imgUrl_mask = URL.createObjectURL(blob_mask);

        
        // Upload painting
        const response_painting = await fetch(endpoint_painting, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({uid: getUID() })
        });

        if (!response_painting.ok) {
            throw new Error('Network response was not ok');
        }

        const blob_painting = await response_painting.blob();
        const imgUrl_painting = URL.createObjectURL(blob_painting);


        // Display images upload
        const imgElement = document.getElementById('upload-image');
        imgElement.src = imgUrl_upload;
        imgElement.style.display = 'block';

        // Display images mask
        const imgElementMask = document.getElementById('mask-image');
        imgElementMask.src = imgUrl_mask;
        imgElementMask.style.display = 'block';

        // Display images painting
        const imgElementPainting = document.getElementById('painting-image');
        imgElementPainting.src = imgUrl_painting;
        imgElementPainting.style.display = 'block';

        // Mengosongkan field value upload
        fileField.value = '';

        const convertBtn = document.getElementById('convertBtn');
        convertBtn.disabled = false;

        uploadText.textContent = "Upload";
        uploadSpinner.style.display = "none";
        uploadBtn.disabled = false;
        showDiv();
        setupModal("upload-image", "modalUpload", "img01", "caption");
        setupModal("mask-image", "modalUpload", "img01", "caption");
        setupModal("painting-image", "modalUpload", "img01", "caption");
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('uploadForm').addEventListener('submit', handleUpload);

function hideDiv() {
    var div = document.getElementById("image-container");
    div.style.display = "none";
}

function showDiv() {
    var div = document.getElementById("image-container");
    div.style.display = "flex"; // Revert to default 'block' if originalDisplayStyle is undefined
}

// Fungsi untuk mendapatkan UID
function getUID() {
    return localStorage.getItem('userUID') || 'defaultUID';
  }
  
// Menyimpan UID di Frontend
document.addEventListener('DOMContentLoaded', () => {
if (!localStorage.getItem('userUID')) {
    const uid = generateUID();  // Fungsi untuk membuat UID
    localStorage.setItem('userUID', uid);
}
});

// Fungsi sederhana untuk membuat UID
function generateUID() {
return 'uid-' + Math.random().toString(36).substr(2, 16);
}

hideDiv();
