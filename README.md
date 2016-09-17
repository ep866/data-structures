# data-structures

##Data structures assignments

###Assignment 1 [Due 9/5 at 4:00pm]:
- Using Node.js (in Cloud 9), make a request for each of the ten "Meeting List Agenda" pages for Manhattan
- For each of the ten files you requested, save the body as a text file to your "local" environment
- Study the HTML structure and begin to think about how you might parse these files (Document Object Model) to extract the relevant data for each meeting


###Assignment 2 [Due 9/12 at 4:00pm]:
Last week, you studied the HTML structure of this file and began to think about how you might parse it to extract the relevant data for each meeting. Using this knowledge about its structure, write a program in Node.js that will print to the console the street address for every meeting in your text file.

###Assignment 3 [Level 2] [Due 9/19 at 4:00pm]:
You will now work with the new interface to AA's meeting list for the New York metro area: http://meetings.nyintergroup.org/.

- Scrape *all* the meetings for the New York metro area. Include all available information about each meeting, including "type", "notes", and full address.
- Use the Google Maps API to geocode each meeting. Do not make redundant requests to the API.
- Your final output should be a single JSON file with all relevant data, structured sensibly.
- Be prepared to talk about how you structured the JSON file, and why.
What is the size of this file?
- Be mindful of:
	- API rate limits
	- Keeping your API key off of GitHub (use a Linux environment variable instead)
- Update your GitHub repository with the relevant file(s)