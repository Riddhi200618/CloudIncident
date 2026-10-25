
import json
import os
from datetime import datetime, timezone

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


def response(code, success, message, data=None):
    return {
        "statusCode": code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "success": success,
            "message": message,
            "data": data
        })
    }


def lambda_handler(event, context):
    try:
        incident_id = (
            event.get("pathParameters") or {}
        ).get("id")

        if not incident_id:
            return response(400, False, "Incident ID is required")

        body = event.get("body", {})

        if isinstance(body, str):
            body = json.loads(body)

        if not isinstance(body, dict):
            return response(400, False, "Invalid request body")

        allowed = {"status", "assignedTo", "resolutionRemarks"}

        if not body or any(k not in allowed for k in body):
            return response(400, False, "Invalid update fields")

        result = table.get_item(Key={"incidentId": incident_id})
        incident = result.get("Item")

        if not incident:
            return response(404, False, "Incident not found")

        old_status = incident["status"]
        new_status = body.get("status", old_status)

        if new_status not in STATUSES:
            return response(400, False, "Invalid status")

        old_index = STATUSES.index(old_status)
        new_index = STATUSES.index(new_status)

        if new_index < old_index or new_index > old_index + 1:
            return response(
                400, False,
                "Invalid status transition"
            )

        assigned_to = body.get(
            "assignedTo", incident.get("assignedTo", "")
        )

        if not isinstance(assigned_to, str):
            return response(400, False, "Invalid assignee")

        if new_status in STATUSES[1:] and not assigned_to.strip():
            return response(
                400, False,
                "Assignment is required before progressing"
            )

        remarks = body.get(
            "resolutionRemarks",
            incident.get("resolutionRemarks", "")
        )

        if not isinstance(remarks, str):
            return response(400, False, "Invalid remarks")

        if new_status in ("Resolved", "Closed") and not remarks.strip():
            return response(
                400, False,
                "Resolution remarks are required"
            )

        timestamp = datetime.now(timezone.utc).isoformat()

        timeline = incident.get("timeline", [])

        if new_status != old_status:
            timeline.append({
                "status": new_status,
                "timestamp": timestamp,
                "remarks": remarks if new_status == "Resolved"
                else f"Status changed to {new_status}"
            })

        incident["status"] = new_status
        incident["assignedTo"] = assigned_to.strip()
        incident["resolutionRemarks"] = remarks.strip()
        incident["updatedAt"] = timestamp
        incident["timeline"] = timeline

        table.put_item(Item=incident)

        return response(
            200,
            True,
            "Incident updated successfully",
            incident
        )

    except (json.JSONDecodeError, TypeError):
        return response(400, False, "Invalid JSON body")

    except ClientError as error:
        print("DynamoDB error:", str(error))
        return response(500, False, "Database operation failed")

    except Exception as error:
        print("Unexpected error:", str(error))
        return response(500, False, "Internal server error")
