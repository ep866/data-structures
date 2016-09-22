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
- meetings' raw files are in the data folder

###N meetings:
As of 9/16/2016 there are 3,654 meetings in 1,013 unique locations.

### MONGO v1 in dbinsert.js
