require('dotenv').config();
//import express from 'express';
const express = require('express');
//express for the website and pug to create the pages
const app = express();
const pug = require('pug');
const path = require('path');
var publicDir = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','pug');
app.use(express.static('public'));

var request = require("request");

//to get and save and resubmit the VTT file
const http = require('http');
const fs = require('fs');
let threshold = 0.9;

//apivideo
const apiVideo = require('@api.video/nodejs-sdk');


const apiVideoKey = process.env.apivideoKeyProd;


// website demo
//get request is the initial request - load the HTML page with the form
app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, '../public', 'index.html'));  
});


app.post('/', (req, res) => {
	//console.log(req);
	//get values from POST body
	let videoName=req.body.videoName;
	var videoCount =3;
	let videoTag = [];
	videoTag.push(req.body.videoTag);
	console.log("videoName", videoName);
	console.log('video tag', videoTag);


	client = new apiVideo.Client({ apiKey: apiVideoKey});
	
	

	let result = client.videos.search({currentPage: 1, pageSize: videoCount, title: videoName, sortBy:"publishedAt", sortOrder:"asc"});

	result.then(function(videos) {
	
	   console.log(videos);
		var responseJson = {}
		var videoList="videos";
		responseJson[videoList] = [];
		var video=[];
		for (let x = 0; x < videos.length; x += 1) {
			//console.log(videos[x]);
			var videoId = videos[x].videoId;
			var title = videos[x].title;
			var thumbnail = videos[x].assets.thumbnail;
			var data = {'videoId': videoId,
						"title": title, 
						"thumbnail":thumbnail
						};
			responseJson[videoList].push(data);
			video.push(data);
			
			/*
			let deleteVideo = client.videos.delete(videoId);
			deleteVideo.then(function(statusCode) {
			  console.log(videoId, "deleted");
			  console.log(statusCode);
			}).catch(function(error) {
			  console.error(error);
			}); 

			*/
		}
		responseJson = JSON.stringify(responseJson);
		console.log("JSON", responseJson);
		console.log("video array", video);
		return res.render('videolist', {video});
	});
		

});

app.post('/delete', (req, res) => {
	client = new apiVideo.Client({ apiKey: apiVideoKey});
	var filesToGo = JSON.parse(req.body.videos);
	 console.log(filesToGo);
	 deleteVideo(0, filesToGo.length, filesToGo);

	 return res.sendFile(path.join(__dirname, '../public', 'index.html')); 

});

function deleteVideo(counter, count, fileArray){
	if(counter < count){
		//files to delete
		let videoId = fileArray[counter].videoId;

		let deleteVid = client.videos.delete(videoId);
		deleteVid.then(function(statusCode) {
		  console.log(videoId, "deleted");
		  console.log(statusCode);
		  counter++;
		  //recurslively delete the next one
		  deleteVideo(counter, count, fileArray);
		}).catch(function(error) {
		  console.error(error);
		});	
	}else{
		//all files deleted  load the start page
		 

	}






}


//testing on 3001
app.listen(3002, () =>
  console.log('Example app listening on port 3002!'),
);
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err)
    // Note: after client disconnect, the subprocess will cause an Error EPIPE, which can only be caught this way.
});

