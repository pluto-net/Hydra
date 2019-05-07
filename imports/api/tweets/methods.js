import { Meteor } from "meteor/meteor";
import { Tweets } from "./tweets";
import { USER_ID_BLACK_LIST_TO_SHOW } from "./constants.js";

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
  }
});

Meteor.methods({
  "tweets.remove.oldTweets"() {
    // TODO: remove below change date
    const changeDate = new Promise((resolve, reject) => {
      const cursors = Tweets.find({ createdAt: { $exists: true, $type: 2 } });

      if (cursors.count() === 0) {
        return resolve();
      }

      cursors.forEach(doc => {
        doc.createdAt = new Date(doc.createdAt);
        Tweets.updateOne({ tId: doc.tId }, doc, err => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log("updated all changes");
            resolve();
          }
        });
      });
    });

    changeDate.then(() => {
      Tweets.remove(
        { createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } },
        err => {
          if (err) {
            console.error(err);
          }
        }
      );
    });
  }
});
