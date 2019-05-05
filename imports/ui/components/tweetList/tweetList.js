import { Meteor } from "meteor/meteor";
import { Tweets } from "/imports/api/tweets/tweets.js";
import "./tweetList.html";

Template.tweetList.onCreated(function() {
  Meteor.subscribe("tweets.all");
});

Template.tweetList.helpers({
  tweets() {
    return Tweets.find();
  }
});
