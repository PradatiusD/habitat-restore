import React from 'react';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import ImageUploading from 'react-images-uploading';
import Button from '@mui/material/Button';

function Capture() {
  const handleTakePhoto = function (dataUri) {
    console.log(dataUri)
  }

  const [images, setImages] = React.useState([]);
  const [useCamera, setUseCamera] = React.useState(false);
  const maxNumber = 69;

  const onChange = (imageList, addUpdateIndex) => {
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  return (
    <div className="Capture">
      <Button variant="contained" onClick={() => {
        setUseCamera(true);
      }}>Use Camera</Button>
      {
        useCamera && <Camera onTakePhoto = { (dataUri) => { handleTakePhoto(dataUri); } } />
      }
      <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
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
          // write your building UI
          <div className="upload__image-wrapper">
            <Button
              variant="contained"
              onClick={onImageUpload}
              {...dragProps}
            >
              Upload own image
            </Button>
          </div>
        )}
      </ImageUploading>
    </div>
  );
}

export default Capture;
