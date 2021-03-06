//mongo DB
var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;




var totalUser = 0;
var totalSumOfVoting = 0;
const votingFactor = 3;
const distributionForDay = 5000;
const postingDistributionForDay = 7500;
const votingDistributionForDay = 2500;
const stakingDistributionForDay = 10000;

//distribution by voted article
function getUserVoting(){
	MongoClient.connect(url, (err, db) => {
		sumVoting(db, (result) => {
			db.close();
			console.log("getUserVoting", result);
		});
	});
	var sumVoting = (db, callback) => {
		var tod = Date.now() - 1000*60*60*24;
		var tod1 = Date.now();
		var agr = [
			{$match: {account: {$exists:true, $ne: null}}},
			{$match : {date : {$gt:tod, $lt:tod1} }},
			{$group: {_id:"$account", vote : { $sum : "$voting"}}}];
		var dbo = db.db("heroku_dg3d93pq");
		var cursor = dbo.collection('board').aggregate(agr).toArray( (err, res) => {
			console.log(res);
			totalUser = res.length;
			//update each users token in their wallet
			getTotalVoting(res);
			for(i = 0; i < res.length;i++){
				setWallet(res[i]._id, res[i].vote, distributionForDay);
			}
		});
	};
}

//distribution by my voting acitivity
function getUserVoting2(){
	MongoClient.connect(url, (err, db) => {
		sumVoting(db, (result) => {
			db.close();
			console.log("getUserVoting2", result);
		});
	});
	var sumVoting = (db, callback) => {
		var tod = Date.now() - 1000*60*60*24;
		var tod1 = Date.now();
		var agr = [
			{$match: {account: {$exists:true, $ne: null}}},
			{$match : {date : {$gt:tod, $lt:tod1} }},
			{$group: {_id:"$account", vote : { $sum : 1}}}];
		var dbo = db.db("heroku_dg3d93pq");
		var cursor = dbo.collection('voting').aggregate(agr).toArray( (err, res) => {
			console.log(res);
			totalUser = res.length;
			//update each users token in their wallet
			getTotalVoting(res);
			for(i = 0; i < res.length;i++){
				setWallet(res[i]._id, res[i].vote,votingDistributionForDay);
			}
		});
	};
}

function getTotalVoting(res){
	totalSumOfVoting = 0;
	for(i = 0;i < res.length; i++)
		totalSumOfVoting += parseFloat(res[i].vote);
	return totalSumOfVoting;
}

function setWallet(account, vote, distSize){
	console.log("setWallet", account, vote);

	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		const dbo = db.db("heroku_dg3d93pq");
		const findQuery = {account : account};
		dbo.collection('user').findOne(findQuery, (err, result) => {
			console.log(result);
			if(err){ 
				throw err;
				console.log(err);
			}
			if(result === null){
				db.close();
				return;
			}
			const updatequery = {account : account};
			
			var tokenSize = (vote / totalSumOfVoting) * distSize + parseFloat(result.wallet);
			//var tokenSize = (vote / totalSumOfVoting) * distributionForDay;
			console.log("tokenSize", tokenSize, vote, totalSumOfVoting, result.wallet);
			tokenSize = tokenSize.toFixed(4);
			const myobj = { $set : {wallet : tokenSize}};
			console.log("update wallet", account, tokenSize);

			dbo.collection('user').updateOne(updatequery, myobj, (err,res) =>{
				if(err){ 
					throw err;
					console.log(err);
				}				
				db.close();
			});

		});
			
	});
}

function setWallet2(account, vote){
	console.log("setWallet2", account, vote);

	MongoClient.connect(url, (err, db) => {
		if(err) throw err;
		const dbo = db.db("heroku_dg3d93pq");
		const findQuery = {account : account};
		dbo.collection('user').findOne(findQuery, (err, result) => {
			console.log(result);
			if(err){ 
				throw err;
				console.log(err);
			}
			if(result === null){
				db.close();
				return;
			}
			const updatequery = {account : account};
			
			var tokenSize = parseFloat(vote) + parseFloat(result.wallet);
			//var tokenSize = parseFloat(vote);
			console.log("tokenSize", tokenSize, vote, result.wallet);
			tokenSize = tokenSize.toFixed(4);
			const myobj = { $set : {wallet : tokenSize}};
			console.log("update wallet2", account, tokenSize);
			
			dbo.collection('user').updateOne(updatequery, myobj, (err,res) =>{
				if(err){ 
					throw err;
					console.log(err);
				}				
				db.close();
			});
		});
			
	});
}


function setShareLog(){
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_dg3d93pq");
		const dropTime = Date.now();
		const myObj = {date : dropTime};
		dbo.collection('droplog').insertOne(myObj,(err, res) => {
			console.log("insert drop history");
			db.close();
		});
	});		
}

function checkTime(){
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_dg3d93pq");
		dbo.collection('droplog').find().limit(1).sort({_id:-1}).toArray(function(err, result){
			if(err) throw err;
			console.log("last record", result[0]);
			const currentTime = Date.now();
			if(currentTime - result[0].date > 1000 * 60 * 60 * 24){
				console.log("do airdrop");
				getUserVoting();
				setShareLog();
				setTimeout(airdropByWriting, 1000*60*2);
				setTimeout(airdropByStaking, 1000*60*3);				
				setTimeout(getUserVoting2, 1000*60*4);
				
			}else{
				console.log("do not do airdrop");
			}
			db.close();
		});
	});
}

//aidrop for dabble writing base
function airdropByWriting(){
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_dg3d93pq");
		var tod = Date.now() - 1000*60*60*24;
		var tod1 = Date.now();

		const agr = [
			{$match: {account: {$exists:true, $ne: null}}},
			{$match : {date : {$gt:tod, $lt:tod1} }},
			{$group: {_id:"$account", count : { $sum : 1}}}
			];
		dbo.collection("board").aggregate(agr).toArray(function(err, result){
			if(err){
				throw err;
				console.log("db error", err);
				db.close();
			}
			//console.log("db result", result);
			var totalPosting = 0;
			console.log("number of users for posting", result.length);
			for(i = 0;i<result.length;i++)
				totalPosting += result[i].count;	
			console.log("airdropByWriting totalPosting", totalPosting);
			for(i=0;i<result.length;i++){
				var tokenSize = result[i].count * parseFloat(postingDistributionForDay) / parseFloat(totalPosting);
				tokenSize = parseFloat(tokenSize);
				tokenSize = tokenSize.toFixed(4);			
				setWallet2(result[i]._id, tokenSize);
				console.log("airdropByWriting", result[i]._id, tokenSize);
			}
			db.close();
		});
	});
}

function airdropByStaking(){
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_dg3d93pq");
		dbo.collection("user").find({}).toArray(function(err, result){
			var totalStaking = 0;
			for(i = 0; i < result.length ; i++)
				totalStaking += parseFloat(result[i].wallet);
			
			for(i = 0; i < result.length; i++){
				var tokenSize = parseFloat(result[i].wallet) * parseFloat(stakingDistributionForDay) / parseFloat(totalStaking);
				tokenSize = parseFloat(tokenSize);
				tokenSize = tokenSize.toFixed(4);
				const account = result[i].account;
				setWallet2(account, tokenSize);				
				console.log("airdropByStaking", account, tokenSize, totalStaking);
			}
			db.close();
		});
	});
}

	
		
function communityAirDrop(amount){
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_dg3d93pq");
		var tod = Date.now() - 1000*60*60*24*16;
		var tod1 = Date.now() - 1000*60*60*24*12;
		const findquery = { date : {$gt:tod, $lt:tod1} };
		dbo.collection("user").find(findquery).toArray(function(err, result){
			for(i = 0; i< result.length; i++){
				console.log("time airdrop ", result[i].account, result[i].wallet);
				setWallet2(result[i].account, 1000);
			}
		});
	});	
}
	
setInterval(checkTime, 1000*60*10);
//getUserVoting();
//getUserVoting2();
//setShareLog();
//setTimeout(airdropByWriting, 1000*60*2);
//communityAirDrop(1000);
//airdropByStaking();
			    
							       
