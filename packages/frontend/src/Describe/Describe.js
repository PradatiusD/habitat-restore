import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
// import MockData from './google-vision-mock-response'
import './Describe.css';
import {useEffect, useState} from "react";
function fetchStatus () {
  const id = new URL(window.location.href).searchParams.get('id')
  const url = "https://h6h6v7uald.execute-api.us-east-1.amazonaws.com/prod/donations/" + id
  console.log('Querying id ' + id)
  return fetch(url).then(function (res) {
    return res.json()
  })
}

function delay (time) {
  return new Promise((fulfill, reject) => {
    setTimeout(function () {
      fulfill()
    }, time || 1000)
  })
}

function pollUntilValidStatus () {
  return delay().then(() => {
    return fetchStatus()
  }).then(function (response) {
    if (response.status === 'ready') {
      return response
    }
    return pollUntilValidStatus()
  })
}

function Describe() {
  // const googleVisionResponse = MockData
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [googleVisionResponse, setGoogleVisionResponse] = useState(null)
  const [product, setProduct] = useState(null)

  useEffect(function () {
    pollUntilValidStatus().then(function (response) {
      setIsLoading(false)
      setGoogleVisionResponse(response)
      setImageUrl(response.url)
    })
  }, [isLoading])

  if (isLoading) {
    return (
      <div>
        Loading
      </div>
    )
  }

  return (
    <section className="Describe-Page">
      {
        imageUrl && <img className="user-image" src={imageUrl}/>
      }
      {
        product && (
          <div>
            <TextField
              value={product && product.title ? product.title :''}
              variant="outlined"
              multiline
              rows={3}
              fullWidth
              onChange={(e) => {
                const copyProduct = JSON.parse(JSON.stringify(product))
                copyProduct.title = e.target.value
                setProduct(product)
              }}
            />
            <Button variant="outlined" onClick={() => {}}>Create</Button>
          </div>
        )
      }
      <div className="visual-matches-container">
        {
          googleVisionResponse && (
            googleVisionResponse.visual_matches.map(function (data) {
              return (
                <Card key={data.position} className="card-result">
                  <CardContent>
                    <img className="product-thumbnail" src={data.thumbnail} />
                    <Typography>{data.title}</Typography>
                    {
                      data.price && (
                        <Typography variant="h6">{data.price.value}</Typography>
                      )
                    }
                    <img src={data.source_icon} className="image-source-icon" />
                    <a href={data.link} target="_blank">{data.source}</a>
                    <div className="select-container">
                      <Button variant="outlined" onClick={() => {
                        setProduct(data)
                      }}>Select</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )
        }
      </div>
    </section>
  );
}

export default Describe;
