import json
from decimal import Decimal

import boto3
from models import Movies
from serpapi import GoogleSearch

# Initialize dynamodb
dynamodb = boto3.resource("dynamodb")
images_table = Movies(dyn_resource=dynamodb)


class Lens(object):
    ENGINE = "google_lens"
    API_KEY = "cc41959e23592cc44b2aee4513b754c9b72b82343d578b10c50da6ab376a682a"

    def __init__(self):
        self.params = {
            "engine": self.ENGINE,
            "api_key": self.API_KEY,
        }

    def search_image(self, image_url):
        self.params["url"] = image_url
        search = GoogleSearch(self.params)
        return search.get_dict()


def lambda_handler(event, context):
    lens = Lens()
    for record in event["Records"]:
        image_name = record.get("s3").get("object").get("key")
        id = image_name.rstrip(".jpg")
        bucket_name = record.get("s3").get("bucket").get("name")
        image_url = f"https://{bucket_name}.s3.amazonaws.com/{image_name}"

        response = lens.search_image(image_url)

        response = json.loads(json.dumps(response), parse_float=Decimal)
        response["pk"] = id
        response["sk"] = "results"
        images_table.add_image_data(response)

    # response = lens.search_image(
    #     "https://habitat-restore-images.s3.amazonaws.com/20230930_095354.jpg"
    # )
    return {"statusCode": 200}


# lambda_handler("a", "a")
