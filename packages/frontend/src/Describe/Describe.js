import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import MockData from './google-vision-mock-response'
import './Describe.css';
import {useEffect, useState} from "react";
function fetchStatus () {
  const id = new URL(window.location.href).searchParams.get('id')
  const url = "https://h6h6v7uald.execute-api.us-east-1.amazonaws.com/prod/images/" + id
  console.log('Querying id ' + id)
  return fetch(url).then(function (res) {
    return res.json()
  })
}

function delay (time) {
  return new Promise((fulfill, reject) => {
    setTimeout(fulfill, time || 1000)
  })
}

function pollUntilValidStatus () {
  return fetchStatus().then((response) => {
    if (response.status !== 'results-not-ready') {
      return response
    }
    return delay()
  }).then(function () {
    return pollUntilValidStatus()
  })
}

function Describe() {
  const imageURL = 'https://habitat-restore-images.s3.amazonaws.com/20230930_095354.jpg'
  const googleVisionResponse = MockData
  const [isLoading, setIsLoading] = useState(true)

  useEffect(function () {
    pollUntilValidStatus().then(function (response) {
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <div>
        Loading
      </div>
    )
  }

  return (
    <section className="Describe-Page">
      <img className="user-image" src={imageURL}/>
      <div>
        <TextField label="Product Title" variant="outlined" />
      </div>
      <div>
        <TextField label="Product Description" variant="outlined" multiline rows={3} />
      </div>
      {
        googleVisionResponse.visual_matches.map(function (data) {
          return (
            <Card key={data.position} className="card-result">
              <CardContent>
                <img src={data.thumbnail} />
                <Typography>{data.title}</Typography>
                <a href={data.link}>{data.source}</a>
                <img src={data.source_icon} className="image-source-icon" />
              </CardContent>
            </Card>
          )
        })
      }
    </section>
  );
}

export default Describe;
