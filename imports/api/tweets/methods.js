import { Meteor } from "meteor/meteor";
import { Tweets } from "./tweets";
import {
  USER_ID_BLACK_LIST_TO_SHOW,
  TWITTER_BLACKLIST_USERNAME
} from "./constants.js";

Meteor.methods({
  "tweets.upsert"(tweet) {
    Tweets.upsert({ tId: tweet.tId }, { $set: tweet });
  }
});

Meteor.methods({
  "tweets.remove.blacklist"() {
    USER_ID_BLACK_LIST_TO_SHOW.forEach(userId => {
      Tweets.remove({ "user.id_str": userId });
    });

    TWITTER_BLACKLIST_USERNAME.forEach(username => {
      Tweets.remove({ content: new RegExp(`@${username}`) });
    });
  }
});

Meteor.methods({
  "tweets.remove.oldTweets"() {
    Tweets.remove(
      { createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } },
      err => {
        if (err) {
          console.error(err);
        }
      }
    );
  }
});
