### Scrapper v2 in parsor.js

### Changes:
- Sanitized address
- Added better error handling for Google maps API
- Now completly automated - no manual address fixes
- Switched Google Maps API to run on sanitized address
	- the previous version was making uncaught errors and dislocating some of the locations 
- Added stats file that counts meetings per location meetings_stats.json


###Files:
- Find all extracted meetings in all_meetings.json
- Find augmented data [with lat, long and formatted address] in augmented_meetings.json
- Stats file for meetings count in meetings_stats.json

###Stats:
As of 9/16/2016 there are 3,654 meetings in 1,013 unique locations.

- meetings' raw files are in the data folder