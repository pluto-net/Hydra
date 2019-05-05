import { Meteor } from "meteor/meteor";
import { TweetKeywords } from "/imports/api/tweetKeywords/tweetKeywords.js";
import "./tweetKeywordList.scss";
import "./tweetKeywordList.html";

Template.tweetKeywordList.onCreated(function() {
  Meteor.subscribe("tweetKeywords.all");
});

Template.tweetKeywordList.helpers({
  tweetKeywords() {
    return TweetKeywords.find();
  }
});

Template.tweetKeywordList.events({
  "submit .keyword-add"(event) {
    event.preventDefault();

    const target = event.target;
    const keyword = target.keyword;

    Meteor.call("keyword.insert", keyword.value, error => {
      if (error) {
        console.error(error);
        alert(error.message);
      } else {
        keyword.value = "";
      }
    });
  },
  "click .del-btn"(event) {
    Meteor.call("keyword.remove", this, error => {
      if (error) {
        console.error(error);
        alert(error.message);
      }
    });
  }
});
