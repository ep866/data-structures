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


###Assignment 4 [Level 2] [Due 9/26 at 4:00pm]:

- Start MongoDB by opening a new terminal window in your Cloud 9 workspace and running the command ./mongod
- Access the Mongo shell prompt by opening another new terminal window and running the command mongo
- In the Mongo shell, create and switch to a new database for the data you prepared in the previous assignment.
- In this new database, create a new collection that will hold a "document" (JSON style data structure) for each "meeting" (however you decide to structure and represent meetings, groups, and or locations).
- Use the mongodb module in Node to insert these documents to the collection you created in the database you created. Hint: check to make sure you have the correct number of documents!
- Update your GitHub repository with the relevant file(s)



###Assignment 5 [Level 2] [Due 10/03 at 4:00pm]:


- Revisit your previous assignments and modify them to expand the data you are collecting to include all available information (about each meeting group and the meetings they hold each week).
- Write all this data to a Mongo database, having decided upon your unit of analysis and appropriate data structures.
- Using the aggregation pipeline, write a query that returns all meetings that start on Tuesdays at or after 7:00pm. Include relevant information about the meeting group, the location, special instructions, and details about the meetings.
- Report on the latency of the query. Run the same query at least 25 times and graphically show the distribution of latency (measured in milliseconds). If you experimented with multiple data structures and/or query formats, generate a graph for each experiment. If you created an index, show the latency graph of the distribution for prior to creating the index and again for after its creation.
- Update your GitHub repository with the relevant file(s)

###Assignment 6 [Due 10/10 at 4:00pm]:

- A function that takes a meeting name from your web scrape and returns a cleanly formatted meeting name. The function should:
	- Remove redundancies.
	- Remove unnecessary punctuation, such as parentheses, hyphens, redundant commas, and symbols.
Correct misspellings.
Example: "LIVING NOW - Living Now (:II)" should be "LIVING NOW"
- A function that takes address data from your web scrape and returns a formatted address that is appropriate for input to the Google Geocoding API. The function should:
	- 	Remove unnecessary address elements such as floor, room number, or directions.
	- 	Remove unnecessary punctuation, such as parentheses, hyphens, redundant commas, and symbols.
	- 	Correct misspellings.


###Assignment 7 [Due 10/25 at 4:00pm]:
- Switching gears from previous assignments, you will use a microcontroller and sensors to collect and log data to your local computer. You will also design (in concept only) an interactive visualization of the data you will collect from the sensor.

###Assignments 8&9 [Due 11/7 at 4:00pm]:
- You will create a SQL database (using a managed database service) and begin writing your sensor data to it.
- You will query data from the SQL database you have created, restructuring the data in the process.




 
