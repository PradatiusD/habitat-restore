import React from 'react';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import ImageUploading from 'react-images-uploading';
import Button from '@mui/material/Button';
import './Capture.css';

function Capture() {
  const handleTakePhoto = function (dataUri) {
    console.log(dataUri)
  }

  const [images, setImages] = React.useState([]);
  const [useCamera, setUseCamera] = React.useState(false);
  const maxNumberOfImages = 1;

  const onChange = (imageList, addUpdateIndex) => {
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  return (
    <div className="Capture-Page">
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
