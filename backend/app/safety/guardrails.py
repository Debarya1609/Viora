def enforce_safety(response):
    response["disclaimer"] = (
        "This guidance is informational and not a medical diagnosis."
    )
    return response
