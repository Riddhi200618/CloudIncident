
import json
import os
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

STATUSES = [
    "Open",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed"
]

PRIORITIES = ["Low", "Medium", "High", "Critical"]


def response(code, success, message, data=None):
    return {
        "statusCode": code,
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
        status_counts = {status: 0 for status in STATUSES}
        priority_counts = {priority: 0 for priority in PRIORITIES}
        total = 0

        scan_args = {
            "ProjectionExpression": "#s, priority",
            "ExpressionAttributeNames": {
                "#s": "status"
            }
        }

        while True:
            result = table.scan(**scan_args)

            for incident in result.get("Items", []):
                total += 1

                status = incident.get("status")
                priority = incident.get("priority")

                if status in status_counts:
                    status_counts[status] += 1

                if priority in priority_counts:
                    priority_counts[priority] += 1

            if "LastEvaluatedKey" not in result:
                break

            scan_args["ExclusiveStartKey"] = result["LastEvaluatedKey"]

        stats = {
            "total": total,
            "byStatus": status_counts,
            "byPriority": priority_counts
        }

        return response(
            200,
            True,
            "Dashboard statistics retrieved successfully",
            stats
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
