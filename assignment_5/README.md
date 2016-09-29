### SCRAPPER v2 in scrapper.js
[to run node scrapper.js or npm packages --> "start": "node scrapper.js" ]

### Changes:
- Sanitized addresses
- Added better error handling for Google maps API
- Now completly automated - no manual address fixes
- Switched Google Maps API to run on sanitized full address
	- the previous version, which ran on partial address, was making uncaught errors and dislocating some of the locations 
- Added stats file that counts meetings per location in meetings_stats.json


###Files:
- Find all extracted meetings in all_meetings.json
- Find augmented data [with lat, long and formatted address] in augmented_meetings.json
- Stats file for meetings count in meetings_stats.json
- meetings' raw files are in the cachedFiles folder

###N meetings:
As of 9/16/2016 there are 3,652 meetings in 1,013 unique locations.

### MONGO v1 in dbinsert.js

Db name is AAmeetings

Running the script dbinsert.js

- First formats the meetings
- And then inserts them in the database
- The final collection format is:

```
{
    "location": "220 West Houston Street",
    "group": "MIDNITE (Group #12920)",
    "region": "Greenwich Village",
    "type": "Candlelight, Open, Topic Discussion",
    "meetingNotes": "Pitch meeting",
    "locationNotes": "2nd Floor. Between 6th Avenue & Varick Street.",
    "lastContact": "6/13/14",
    "fullLocation": "220 West Houston Street, New York, NY 10014",
    "day": "Sunday",
    "startTime": "2:00 am",
    "endTime": "3:15 am",
    "latLong": {
      "lat": 40.7287153,
      "lng": -74.004578
    },
    "formattedLocation": "220 W Houston St, New York, NY 10014, USA"
  }
```

  
  - Running db check produces:
  
```
  > db.meetings.find().count()
  > 3652
```

