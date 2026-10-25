
import json
import os
import uuid
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

REQUIRED_FIELDS = [
    "title", "description", "category",
    "location", "priority", "reportedBy"
]

VALID_PRIORITIES = {"Low", "Medium", "High", "Critical"}


def response(status_code, success, message, data=None):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "success": success,
            "message": message,
            "data": data
        })
    }


def lambda_handler(event, context):
    try:
        body = event.get("body", event)

        if isinstance(body, str):
            body = json.loads(body)

        if not isinstance(body, dict):
            return response(400, False, "Invalid request body")

        for field in REQUIRED_FIELDS:
            value = body.get(field)

            if not isinstance(value, str) or not value.strip():
                return response(
                    400, False,
                    f"Missing or invalid field: {field}"
                )

        if body["priority"] not in VALID_PRIORITIES:
            return response(
                400, False, "Invalid priority value"
            )

        incident_id = "INC-" + str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()

        incident = {
            "incidentId": incident_id,
            "title": body["title"].strip(),
            "description": body["description"].strip(),
            "category": body["category"].strip(),
            "location": body["location"].strip(),
            "priority": body["priority"],
            "reportedBy": body["reportedBy"].strip(),
            "assignedTo": "",
            "status": "Open",
            "createdAt": timestamp,
            "updatedAt": timestamp,
            "resolutionRemarks": "",
            "timeline": [{
                "status": "Open",
                "timestamp": timestamp,
                "remarks": "Incident reported"
            }]
        }

        table.put_item(
            Item=incident,
            ConditionExpression="attribute_not_exists(incidentId)"
        )

        return response(
            201,
            True,
            "Incident created successfully",
            {
                "incidentId": incident_id,
                "status": "Open"
            }
        )

    except (json.JSONDecodeError, TypeError):
        return response(400, False, "Invalid JSON body")

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
