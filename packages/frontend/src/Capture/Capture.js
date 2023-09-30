import React from 'react';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import ImageUploading from 'react-images-uploading';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import './Capture.css';

function Capture() {
  const [imageData, setImageData] = React.useState(null)
  const [images, setImages] = React.useState([]);
  const [showCamera, setShowCamera] = React.useState(false);
  const maxNumberOfImages = 1;

  const onChange = (imageList, addUpdateIndex) => {
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  function getSignedS3UploadImageURL () {
    const url = "https://h6h6v7uald.execute-api.us-east-1.amazonaws.com/prod/images"
    const params = {
      method: "POST"
    }
    return fetch(url, params).then(function (response) {
      return response.json()
    })
  }

  const onTakePhoto = function (dataUri) {
    setImageData(dataUri)
    setShowCamera(false)
    getSignedS3UploadImageURL().then(function (signedURLData) {
      return fetch(signedURLData.presignedUrl, {
        method: "PUT",
        body: dataUri
      })
    }).then(function (output) {
      debugger
    })
  }


  return (
    <div className="Capture-Page">
      {
        imageData && (
          <Paper elevation={3}>
            <img src={imageData} />
          </Paper>
        )
      }
      {
        showCamera && <Camera onTakePhoto={onTakePhoto} />
      }
      {
        !showCamera && <Button variant="contained" onClick={() => {
          setShowCamera(true);
        }}>Use Camera</Button>
      }

      <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumberOfImages}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          <Button
            variant="contained"
            onClick={onImageUpload}
            {...dragProps}
          >
            Upload From Media Library
          </Button>
        )}
      </ImageUploading>
    </div>
  );
}

export default Capture;
