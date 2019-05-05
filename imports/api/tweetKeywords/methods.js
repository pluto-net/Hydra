import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Tweets } from "../tweets/tweets.js";
import { TweetKeywords } from "./tweetKeywords.js";

Meteor.methods({
  "keyword.insert"(keyword) {
    if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.admin) {
      check(keyword, String);
      return TweetKeywords.insert({
        keyword,
        createdAt: new Date()
      });
    } else {
      throw new Error("You are not proper user");
    }
  },

  "keyword.remove"(keyword) {
    if (
      Meteor.user() &&
      Meteor.user().profile &&
      Meteor.user().profile.admin &&
      keyword
    ) {
      Tweets.remove({ query: keyword.keyword });
      return TweetKeywords.remove(keyword._id);
    } else {
      throw new Error("You are not proper user");
    }
  }
});
