# Health Check of webservices

This widget checks the status of your webservices.

Feature:
* History
* Push Notification
* Custom Header
* Custom Timeout Interval

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Webservices-Health-Check/Webservices-Health-Check.js)

## Setup
Run the script from the Scriptable App. After this, you will find an example configuration in your scriptable folder (iCloud or local) with the name 'health-check-settings.example.json'.
Rename the json file to 'health-check-settings.json' and add your configuration to the json file. Example:

```
[
  {
    "name": "Service 1",
    "endpoint": "https://example.com/api/health",
    "expectedContentType": "application/json",
    "timeoutInterval": 1,
    "notification": true,
    "headers": [
      {
        "key": "x-api-key",
        "value": "12345678"
      }
    ]
  },
  {
    "name": "Service 2",
    "endpoint": "https://hello.com/api/health",
    "expectedContentType": "application/json",
    "timeoutInterval": 5,
    "notification": false,
    "headers": [
      {
        "key": "x-api-key",
        "value": "098765"
      }
    ]
  }
]
```
