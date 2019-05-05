import { Meteor } from "meteor/meteor";
import { Tweets } from "./tweets";

Meteor.methods({
  "tweets.upsert"(tweet) {
    Tweets.upsert({ tId: tweet.tId }, { $set: tweet });
  }
});
