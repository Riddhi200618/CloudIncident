
import json
import os
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


def response(status_code, success, message, data=None):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "success": success,
            "message": message,
            "data": data
        })
    }


def lambda_handler(event, context):
    try:
        path_parameters = event.get("pathParameters") or {}
        incident_id = path_parameters.get("id")

        if not incident_id:
            return response(
                400, False,
                "Incident ID is required"
            )

        result = table.get_item(
            Key={"incidentId": incident_id}
        )

        incident = result.get("Item")

        if not incident:
            return response(
                404, False,
                "Incident not found"
            )

        return response(
            200,
            True,
            "Incident retrieved successfully",
            incident
        )

    except ClientError as error:
        print("DynamoDB error:", str(error))
        return response(
            500, False, "Database operation failed"
        )

    except Exception as error:
        print("Unexpected error:", str(error))
        return response(
            500, False, "Internal server error"
        )
