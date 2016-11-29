//************** Local Packages *********//
// before running the script
// brew ffmpeg
// brew imagemagic with png delegate
//*********** MODULES ******************//

var FF_mpeg = require("fluent-ffmpeg");
var easyimg = require("easyimage");
var fs = require("fs");
var request = require("request");
var async = require("async");
var _ = require("underscore");

//*********** Process video & capture one shot per second ******************//

var VideoProcessor = function(settings) {
  this.timemarks = [];
  this.video = settings.video;
  this.output = settings.saveTo;
  this.videoDuration = 0;
  this.skipBeginning = settings.skipBeginning;
  this.initShots = FF_mpeg()
                      .input(this.video)
                      .seekInput(this.skipBeginning)
                      .noAudio();

  this.processReset = function() {
    return FF_mpeg()
              .input(this.video)
              .seekInput(this.skipBeginning)
              .noAudio();
  }

  this.init = function() {
    var that = this;

      this.setVideoDuration(function(){

        var recursive = function(timeSet) {

            if( that.timemarks.length == 0 ) {
              console.log("END!");
              return;
            } else {

              var thisMark = timeSet.shift();
              that.getShots([thisMark]);

              setTimeout(function(){
                return recursive(timeSet);
              }, 5000);

            }
        }

        recursive(that.timemarks);

      });
  }
    console.log("************************************");
    console.log("Initilizing Video Processor");
    console.log("************************************");

  if(settings.init) { this.init(); }
}

VideoProcessor.prototype = {
    constructor: VideoProcessor,
    setVideoDuration: function(cb) {
      var that = this;

      this.initShots
        .ffprobe(function(err, data) {
            console.log('Collecting Metadata:');
            //console.dir(data);
            that.videoDuration = data.streams[0].duration;
            console.log("Duration: ", that.videoDuration);

            console.log("************************************");
            console.log("Setting Time Marks");
            console.log("************************************");

            that.setTimeMarks();

            return cb();

        });
    },
    setTimeMarks: function() {
      // each second
      for(var frame = this.skipBeginning; frame <= this.videoDuration; frame++) {
        this.timemarks.push(frame);
      }
    },
    getShots: function(mark) {
      var logFrame = this.skipBeginning;

        this.initShots = this.processReset();

        this.initShots
            .on('error', function(err) {
                console.log('An error occurred: ' + err.message);
            })
            .on('start', function(commandLine){
                console.log('******************************');
                console.log('Spawned Ffmpeg with command: ' + commandLine);
                console.log('******************************');
            })
            // .on('progress', function(progress) {
            //     console.log('Timemark: ' + progress.timemark);
            //     console.log('Frame: ' + logFrame + ' done');
            //     logFrame++;
            // })
            .screenshots({
                timemarks: mark,
                folder: this.output,
                filename: '%s-shot',
                size: "1280x780"
            })
            .on('end', function() {
                console.log("Processing second ", mark, " finished!");
                console.log("\n");
            });
    }

};


//**************** SPLIT DOUBLE FRAMES AND RESIZE *****************//
var ShotsEditor = function(settings, id) {
  this.splitSettings = {
     src: settings.src,
     dst: settings.dst,
     width:1280, height:780,
     //cropwidth:630, cropheight:780,
     // Trump -645 | Hilary 649 - this is for last debate
     // other debates should follow the same aspect ratio
     // or logic of passing x needs to change
     x: settings.x == "isTrump" ? -645 : 649,
     y:0
  }

  this.resizeSettings = {
    shotsSrc: settings.shotsSrc,
    destSrc: settings.destSrc,
  };

  console.log("**** Init shot editor *****");
  if(settings.split) { this.splitter(id); }
  if(settings.resize) { this.resizer(); }
};

ShotsEditor.prototype = {
  constructor: ShotsEditor,
  splitter: function(id) {
    // Get Trump
    easyimg.rescrop(this.splitSettings)
      .then(
      function(image) {

        if( id == "isTrump" ) {
          console.log("Extracting Trump!");
        } else {
          console.log("Extracting Hillary!");
        }

        // console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
      },
      function (err) {
        console.log(err);
      }
    );
  },
  resizer: function() {
    var images = JSON.parse( fs.readFileSync(this.resizeSettings.shotsSrc) );
    var that = this;

    var resize = function() {
      if( images.length == 0 ) {
        console.log("Finished resizing images");
        return;
      } else {
        var thisImage = images.shift();
        var sets = {
          width: 297,
          height: 367
        };
        var imgName = "";

        if( thisImage.isDouble ) {
          sets.width = 297;
         // sets.height = 367;
          imgName = thisImage.location.split("/")[3];
        } else {
          sets.width = 599;
         // sets.height = 367;
          imgName = thisImage.location.split("/")[2];
        }

        easyimg.resize({
             src: thisImage.location,
             dst: that.resizeSettings.destSrc + imgName,
             width: sets.width,
             height: sets.height,
             x: 0,
             y: 0
          }).then(
          function(image) {
             console.log('Resized : ', thisImage.id, imgName);
          },
          function (err) {
            console.log(err);
          }
        );

         setTimeout(function(){
          resize();
        }, 200);

      }
    }
    resize();
    console.log("**** Init Image Resizer *****");
  }
};


//**************** CREATE METADATA OBJECT *****************//

var ProcessShots = function(settings) {
  this.files = settings.files;
  this.debateDate = settings.debateDate;
  this.splitShots = settings.splitShots;
  this.resizeShots = settings.resizeShots;
  this.getMetaData = settings.getMetaData;

  console.log("***** Init Image and Metadata Editor ********");
  this.parser();
};

ProcessShots.prototype = {
  constructor: ProcessShots,
  parser: function() {

    // split Hillary from Trump
    if( this.splitShots ) {
      this.extractCandidate();
    }

    // extract metadata
    if( this.getMetaData ) {
      this.extractMetadata();
    }

  },
  formatTime: function(secs) {
    var sec_num = parseInt(secs, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
  },
  extractMetadata: function() {
    var that = this;
    var metadata = [];

    // build json object with metadata
    fs.readdir(this.files, function(err, shots) {
      if(err) {
        throw err;
      }

      for(index in shots) {
        var thisImage = shots[index];
        var id = thisImage.split("-");

        if( id.indexOf("isDouble") >= 0) {

          metadata.push({
            id: id[1],
            img: thisImage,
            sec: id[1],
            time: that.formatTime(parseInt(id[1])),
            debateDate: that.debateDate,
            who: "isHillary",
            isDouble: true,
            location: that.files + 'doubles_split/isHillary-' + id[1] + '-shot.png'
          });

          metadata.push({
            id: id[1],
            img: thisImage,
            sec: id[1],
            time: that.formatTime(parseInt(id[1])),
            debateDate: that.debateDate,
            who: "isTrump",
            isDouble: true,
            location: that.files + 'doubles_split/isTrump-' + id[1] + '-shot.png'
          });


        } else {
          metadata.push({
            id: id[1],
            img: thisImage,
            sec: id[1],
            time: that.formatTime(parseInt(id[1])),
            debateDate: that.debateDate,
            who: id[0],
            isDouble: false,
            location: that.files + thisImage
          });

        }

      } // for loop

      // console.log(metadata)
      return that.save(metadata);

    });
  },
  extractCandidate: function() {
    var that = this;
    var doubles = [];
    // loop through all files
    fs.readdir(this.files, function(err, shots) {
      if(err) {
        throw err;
      }
      // find all images that contain both candidates
      for(var index in shots) {
        var id = shots[index].split("-");
        if( id.indexOf("isDouble") >= 0) {
          doubles.push(shots[index]);
        }
      }

      var recursiveExtract = function() {
          if( doubles.length == 0 ) {
            console.log("Successfully split Hillary from Trump!");
            return;
          } else {
            var thisImage = doubles.shift();
            var id = thisImage.split("-");

            console.log("**** Processing: ", thisImage, "**********");

            var Hillary = new ShotsEditor({
              src: that.files + thisImage,
              dst: that.files + "doubles_split/isHillary-"+id[1]+"-shot.png",
              x: "isHillary",
              split: true
            }, "isHillary");

            var Trump = new ShotsEditor({
              src: that.files + thisImage,
              dst: that.files + "doubles_split/isTrump-"+id[1]+"-shot.png",
              x: "isTrump",
              split: true
            }, "isTrump");

            setTimeout(function(){
              return recursiveExtract(doubles);
            }, 3000);

          }
        };

        recursiveExtract();

    });
  },
  save: function(data) {
    // save object to computer
    console.log("********Saving Metadata Object********");
    fs.writeFileSync('metadata/debate_'+ this.debateDate +'.json', JSON.stringify(data, null, 2) , 'utf-8');
  }
};


//**************** MICROSOFT COGNITIVE SERVICES *****************//
// v0.12.7

var Emotions = function(file, init) {
  this.collection = JSON.parse( fs.readFileSync("metadata/"+file) );

  this.result = [];
  this.forProcessing = [];

  this.cognitiveServices = function(img) {
    var apiKey = process.env.CSKEY;
    var that = this;
    var count = 0;

    // first collect all shots that have been successfully augmented
    // on first run none will have a sentiment
    // for conseq runs it will single out the shots
    // that the api errored on
    that.collection.forEach(function(shot){
      if(shot.sentiment) {
        if(!shot.sentiment.error && !shot.sentiment.statusCode) {
        // console.log("Shot ", shot._id, " is processed!");
          that.result.push(shot);
        } else {
        // if it errored put back in processing batch
          that.forProcessing.push(shot);
        }

        if(shot.sentiment.length == 0) {
          // this means the api did not detect the faces
          shot.sentiment.push({"scores": {
            "anger": null,
            "contempt": null,
            "disgust": null,
            "fear": null,
            "happiness": null,
            "neutral": null,
            "sadness": null,
            "surprise": null
          }});

          that.result.push(shot);
        }

      } else {
        // if sentiment is missing add to processing batch
        // console.log("Shot ", shot._id, " moved to processing pipe!");
        that.forProcessing.push(shot);
      }
    });

    console.log("Processed count: ", that.result.length);
    console.log("Pending processing count: ",that.forProcessing.length);
    console.log("Total number of shots: ", that.forProcessing.length + that.result.length);

    // save the processed shots
      that.save(that.result);

    // get each metadata object, augment with sentiment
    if(that.forProcessing.length != 0) {
      async.eachSeries(that.forProcessing, function(shot, callback){
        // request the once that failed
          request.post({
                uri: "https://api.projectoxford.ai/emotion/v1.0/recognize",
                headers: {
                    'Ocp-Apim-Subscription-Key': apiKey,
                    'Content-Type': 'application/octet-stream'
                },
                body: fs.readFileSync(shot.location)
            },  function(error, response) {
              if(error) {

                console.log("*** error ****");
                console.log(error);

                // save the shots that errored
                // to be requested again
                that.result.push(shot);
                that.save(that.result);

              } else {
                response.body = JSON.parse(response.body);
                console.log("response length", response.body.length);
                // augment with sentiment
                shot.sentiment = response.body;

               // save successfull result after each request
                that.result.push(shot);
                that.save(that.result);
                console.log("****** saved", shot.img, shot.who ," ********");

              }

              console.log("Processing image ", count);

              count++;

            });

        setTimeout(callback, 4000);

        }, function() {
            console.log("************************************");
            console.log('Processed all shots');
            console.log("************************************");
        });
    } else {
        console.log("************************************");
        console.log('Successfully augmented all shots');
        console.log("************************************");
    }

  }


  this.save = function(data) {
   fs.writeFileSync('metadata/' + file, JSON.stringify(data, null, 2) , 'utf-8');
  }

  console.log("*********** Init Cognitive Services ***********");

  if(init) {this.cognitiveServices();}

}

//**************** Sort & Remove Dups *****************//

var PostProcessingData = function(file, init) {
  this.file = "metadata/" + file;

  this.process = function() {
      var data = JSON.parse(fs.readFileSync(this.file));

      var uniqueList = _.uniq(data, function(item, key, a) {
          return item.location;
      });

      var sorted = _.sortBy(uniqueList, function(o){ return parseInt(o.id); });

      fs.writeFileSync('metadata/finalDataset.json', JSON.stringify(sorted, null, 2) , 'utf-8');
  }

  console.log("**** Data were sorted and cleaned from dups! *****");

  if(init) { this.process(); }
}



//**************** DB *****************//
// flatten json to csv
// insert into postgres
// process all images and expand the object with emotion
// create DB and Feed Images





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
//  @ returns a metadata json file containing the location of each //    shot and its metadata if getMetaData is enabled
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
//  @ return a json with emotions analysis
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
//  @ gets the json returned from postProcess
//  @ returns the images resized for browser view
//*****//
var resizer = new ShotsEditor({
  shotsSrc: "metadata/finalDataset.json",
  destSrc: "/Volumes/SmartBox/DebatesShotsResized/",
  resize: false // flip this to start the process
});

//***** Upload to S3 Bucket on AWS *****************//
//  @ I did this last step manually as it is faster
//  but it could be done with the npm aws-sdk
//*****//









