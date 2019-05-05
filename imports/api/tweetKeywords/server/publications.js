import { Meteor } from "meteor/meteor";
import { TweetKeywords } from "../tweetKeywords";

Meteor.publish("tweetKeywords.all", function() {
  if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.admin) {
    return TweetKeywords.find();
  } else {
    // Declare that no data is being published. If you leave this line out,
    // Meteor will never consider the subscription ready because it thinks
    // you're using the `added/changed/removed` interface where you have to
    // explicitly call `this.ready`.
    return [];
  }
});
