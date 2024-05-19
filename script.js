function uploadImage() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image file');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('http://192.168.56.1:5000/predict', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            const base64Image = data.base64Image;
            console.log(base64Image)
            const imageElement = document.createElement('img');
            imageElement.src = `data:image/jpeg;base64,${base64Image}`;
            document.getElementById('imageContainer').appendChild(imageElement);
        })
        .catch(error => {
            console.error('Error uploading image:', error);
        });
}
