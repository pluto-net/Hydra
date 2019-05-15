import { Meteor } from "meteor/meteor";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import { Tweets } from "/imports/api/tweets/tweets.js";
import "./tweetList.html";
import "./tweetList.scss";

Template.tweetList.onCreated(function() {
  Meteor.subscribe("tweets.all");
});

Template.tweetList.helpers({
  tweets() {
    const rawTweets = Tweets.find().fetch();
    const tweets = rawTweets.map(t => ({
      ...t,
      createdAt: distanceInWordsToNow(t.createdAt, { addSuffix: true })
    }));
    return tweets;
  }
});
