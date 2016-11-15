### Assignment 8 & 9

###About:
AI Emotions analysis of static images

- Source: The last Presidential Debate on October 19th, 2016
- Output: 10,977 images captured
- Analysis: Microsoft Cognitive Services API


Postgres DB:

- The final debate is represented by 11,972 rows
- The number of unique shots is 10,977
- Some of them (at the end of the debate where they show multiple people) have multiple faces and hence multiple emotions

Sample images in:

- sample_shots/

All images:
- The entire collection is in an S3 bucket on AWS

###Files:
- metadata/debate_October_19_2016.json - contains the metadata associated with each image 
- metadata/finalDataset.json - contains each image with the emotion detected. I settled on Microsoft Cognitive Services eventually. Google Vision did not perform nearly as accurately and has less emotions it can detect. 
- metadata/withVision.json - contains some results from Google Vision

###Pipeline for video processing:
- script: pipeline.js
- local dependencies: ffmpeg and imagemagic with the png delegate
- npm dependencies in package.json
- caution: to run the entire pipeline from start to finish takes about ~20 hours.

#####Metadata object - one for each of the 10,977 images
- My work was complicated by the frames that contained both Hillary and the Donald. I have split the images programmatically and _isDouble_ pertains to the image source being a double frame containing both.
- Time is time elapsed since start of debate

```js
{
    "id": "1820",
    "img": "isDouble-1820-shot.png",
    "sec": "1820",
    "time": "00:30:20",
    "debateDate": "October_19_2016",
    "who": "isTrump",
    "isDouble": true,
    "location": "shots/October_19_2016/doubles_split/isTrump-1820-shot.png",
    "sentiment": [
      {
        "faceRectangle": {
          "height": 226,
          "left": 227,
          "top": 144,
          "width": 226
        },
        "scores": {
          "anger": 0.04052857,
          "contempt": 0.0263373815,
          "disgust": 0.004114543,
          "fear": 0.0000316101432,
          "happiness": 0.00000184808732,
          "neutral": 0.436605871,
          "sadness": 0.492295146,
          "surprise": 0.00008503882
        }
      }
    ]
  }
```
#####The pipeline

```js
//**************** PIPELINE DEBATE *****************//

//***** Get the shots *****************//
//  @ accepts a local video file as an argument
//  @ returns a screenshot for each second of video
//*****//

var Oct_19 = new VideoProcessor({
  video: "debates/The_Third_Presidential_Debate_October_19_2016.mp4",
  skipBeginning: (7.3 * 60),
  saveTo: "shots/October_19_2016",
  // flip init boolean to start the image capturing process
  // it takes ~5 hours to finish processing
  init: false
});

//***** Edit images and get metadata *****************//
//  @ pass the folder with the images returned from VideoProcessor
//  @ returns a split version of the frames that contain both the
//    Donald and Hillary if splitShots is enabled
//  @ returns a metadata json file containing the location 
//    of each shot and its metadata if getMetaData is enabled
//*****//

var processor = new ProcessShots({
  // location of shots returned from VideoProcessor
  files: "shots/October_19_2016/",
  debateDate: "October_19_2016",
  // flip boolean to execute any of the function
  splitShots: false, // takes about ~3 hours
  getMetaData: false
});

//***** Process Emotions *****************//
//  @ pass the metadata json returned from processor
//  @ returns a json with emotions analysis
//  @ this takes about ~10 hours to complete
//  @ there are 10,977 shots to process
//*****//

var processEmotions = new Emotions("debate_October_19_2016.json", false);

//  @ then pass the json returned from processEmotions
//  @ run as many times as needed to make the requests that failed
//  @ the constructor will output a message when all checks are
//    passed and all shots are processed
//*****//

var fixMissingEmotions = new Emotions("withEmotionsFinal.json", false);

//***** Post Processing  *****************//
//  @ pass the json returned from fixMissingEmotions
//  @ returns a json that is sorted and duplicates are removed
//*****//

var postProcess = new PostProcessingData("withEmotionsFinal.json", false);

//***** Resize Shots  *****************//
//  @ pass the json returned from postProcess
//  @ returns the images resized for browser view
//*****//
var resizer = new ShotsEditor({
  shotsSrc: "metadata/finalDataset.json",
  destSrc: "/Volumes/SmartBox/DebatesShotsResized/",
  resize: false // flip this to start the process
});

//***** Upload to S3 Bucket on AWS *****************//
//  @ I did this last step via the browser ftp 
//  as I had to move on to the database schema and setup
//  but it could be done with the npm aws-sdk
//*****//

```

####Postgres:
- script: db.js


- table definition


```
var createTableQuery = "CREATE TABLE debates (id smallint, image_name varchar(500), image_link varchar(1500), date_debate date, is_double_shot boolean, time_shot_secs smallint, time_shot varchar(30), who varchar(100), anger decimal(5,2), contempt decimal(5,2), disgust decimal(5,2), fear decimal(5,2), happiness decimal(5,2), neutral decimal(5,2), sadness decimal(5,2), surprise decimal(5,2));"
```

- table check

```
SELECT COUNT(*) AS nrows FROM DEBATES
```

- result

```
Row count: Result {
  command: 'SELECT',
  rowCount: 1,
  oid: NaN,
  rows: [ anonymous { nrows: '11972' } ],
  fields: 
   [ Field {
       name: 'nrows',
       tableID: 0,
       columnID: 0,
       dataTypeID: 20,
       dataTypeSize: 8,
       dataTypeModifier: -1,
       format: 'text' } ],
  _parsers: [ [Function: parseBigInteger] ],
  RowCtor: [Function: anonymous],
  rowAsArray: false,
  _getTypeParser: [Function: bound ] }
```

#### Next to do - EXPRESS API & QUERIES:







