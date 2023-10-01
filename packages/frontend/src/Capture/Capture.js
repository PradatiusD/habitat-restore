import React from 'react';
import Camera, {FACING_MODES, IMAGE_TYPES} from 'react-html5-camera-photo';
import { useNavigate } from "react-router-dom";
import 'react-html5-camera-photo/build/css/index.css';
import ImageUploading from 'react-images-uploading';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import './Capture.css';

function Capture() {
  const [imageData, setImageData] = React.useState(null)
  const [images, setImages] = React.useState([]);
  const [showCamera, setShowCamera] = React.useState(false);
  const [canContinueWithPhoto, setCanContinueWithPhoto] = React.useState(false);
  const maxNumberOfImages = 1;
  const navigate = useNavigate();

  const onChange = (imageList, addUpdateIndex) => {
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  function getSignedS3UploadImageURL () {
    const url = "https://h6h6v7uald.execute-api.us-east-1.amazonaws.com/prod/donations"
    const params = {
      method: "POST"
    }
    return fetch(url, params).then(function (response) {
      return response.json()
    })
  }

  const convertDataURIToBinary = (dataURI) => {
    let BASE64_MARKER = ';base64,';
    let base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    let base64 = dataURI.substring(base64Index);
    let raw = window.atob(base64);
    let rawLength = raw.length;
    let array = new Uint8Array(new ArrayBuffer(rawLength));

    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  };

  const onTakePhoto = function (dataUri) {
    setImageData(dataUri)
    setShowCamera(false)
    if (!canContinueWithPhoto) {
      return
    }
    let signedUrlData
    getSignedS3UploadImageURL().then(function (signedURLResponse) {
      signedUrlData = signedURLResponse
      return fetch(signedUrlData.presignedUrl, {
        method: "PUT",
        body: convertDataURIToBinary(dataUri)
      })
    }).then(function (output) {
      navigate("/describe?id=" + signedUrlData.pk);
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
        showCamera && (
          <Camera
            imageType={IMAGE_TYPES.JPG}
            idealFacingMode={FACING_MODES.ENVIRONMENT}
            // imageCompression={0.97}
            onTakePhoto={onTakePhoto} />
        )
      }
      {
        !showCamera && !imageData && (
            <Button
              variant="contained"
              onClick={() => {
              setShowCamera(true);
              }}>Use Camera</Button>
        )
      }

      {
        imageData && (
          <div>
            <Button
              variant="contained"
              onClick={() => {
                setCanContinueWithPhoto(true);
                setShowCamera(false);
                onTakePhoto(imageData);
              }}>Confirm</Button>

            <Button
              variant="contained"
              onClick={() => {
                setImageData(null)
                setCanContinueWithPhoto(false);
                setShowCamera(true);
              }}>Retake</Button>
          </div>
        )
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
