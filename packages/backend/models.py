# snippet-start:[python.example_code.dynamodb.helper.Movies.imports]
from decimal import Decimal
from io import BytesIO
import json
import logging
import os
from pprint import pprint
import requests
from zipfile import ZipFile

from botocore.exceptions import ClientError


logger = logging.getLogger(__name__)


class Movies:
    """Encapsulates an Amazon DynamoDB table of movie data."""

    def __init__(self, dyn_resource):
        """
        :param dyn_resource: A Boto3 DynamoDB resource.
        """
        self.dyn_resource = dyn_resource
        # The table variable is set during the scenario in the call to
        # 'exists' if the table exists. Otherwise, it is set by 'create_table'.
        self.table_name = "habitat-restore"
        self.table = self.dyn_resource.Table(self.table_name)

    # snippet-start:[python.example_code.dynamodb.PutItem]
    def add_image_data(self, response):
        try:
            # self.table.put_item(Item={"uuid": "123", "response": response})
            self.table.put_item(Item=response)
            return True
        except Exception as err:
            print("ClientError ", err)
            raise Exception("ClientError", err)

    # snippet-end:[python.example_code.dynamodb.PutItem]

    # snippet-start:[python.example_code.dynamodb.GetItem]
    def get_movie(self, id):
        """
        Gets movie data from the table for a specific movie.

        :param title: The title of the movie.
        :param year: The release year of the movie.
        :return: The data about the requested movie.
        """
        try:
            response = self.table.get_item(
                Key={
                    "id": id,
                }
            )
        except ClientError as err:
            logger.error(
                "Couldn't get movie %s from table %s. Here's why: %s: %s",
                self.table.name,
                err.response["Error"]["Code"],
                err.response["Error"]["Message"],
            )
            raise
        else:
            return response["Item"]
