
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
        incidents = []
        scan_args = {}

        while True:
            result = table.scan(**scan_args)
            incidents.extend(result.get("Items", []))

            if "LastEvaluatedKey" not in result:
                break

            scan_args["ExclusiveStartKey"] = result["LastEvaluatedKey"]

        incidents.sort(
            key=lambda item: item.get("createdAt", ""),
            reverse=True
        )

        return response(
            200,
            True,
            "Incidents retrieved successfully",
            incidents
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
