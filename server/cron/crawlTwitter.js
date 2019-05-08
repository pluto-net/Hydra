import Axios from "axios";
import { Meteor } from "meteor/meteor";
import { SyncedCron } from "meteor/littledata:synced-cron";
import { TweetKeywords } from "/imports/api/tweetKeywords/tweetKeywords";
import {
  USER_ID_BLACK_LIST_TO_SHOW,
  TWITTER_BLACKLIST_USERNAME
} from "/imports/api/tweets/constants.js";

class TwitterWatcher {
  constructor() {
    this.token = "";
  }

  async getTwitterToken() {
    const TWITTER_SERVICE_KEY = Meteor.settings.private.TWITTER_SERVICE_KEY;
    const TWITTER_SECRET_KEY = Meteor.settings.private.TWITTER_SECRET_KEY;
    const rawBearerToken = `${TWITTER_SERVICE_KEY}:${TWITTER_SECRET_KEY}`;
    const bearerToken = new Buffer(rawBearerToken).toString("base64");

    const tokenRes = await Axios.post(
      "https://api.twitter.com/oauth2/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${bearerToken}`,
          ["Content-Type"]: "application/x-www-form-urlencoded;charset=UTF-8"
        }
      }
    );
    const tokenInfo = tokenRes.data;
    this.token = tokenInfo.access_token;
    return tokenInfo.access_token;
  }

  async searchTweets(query) {
    if (!this.token) {
      await this.getTwitterToken();
    }

    const result = await Axios.get(
      "https://api.twitter.com/1.1/search/tweets.json",
      {
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        params: {
          q: encodeURIComponent(query),
          result_type: "recent",
          count: 30,
          include_entities: true
        }
      }
    );

    const titleTweetResponse = result.data;
    const rawTweets = titleTweetResponse.statuses;
    const tweets = rawTweets.map(t => this.makeTweetObject(t, query));
    return tweets
      .filter(t => !USER_ID_BLACK_LIST_TO_SHOW.includes(t.user.id_str))
      .filter(t => {
        t =>
          TWITTER_BLACKLIST_USERNAME.every(
            username => !t.content.includes(`@${username}`)
          );
      });
  }

  makeTweetObject(rawTweet, query) {
    const tId = rawTweet.id_str;
    const content = rawTweet.text;
    const destURL = "https://twitter.com/statuses/" + tId;
    const createdAt = new Date(rawTweet.created_at);
    const user = rawTweet.user;

    return {
      tId,
      content,
      destURL,
      createdAt,
      user,
      query
    };
  }
}

const twitterWatcher = new TwitterWatcher();

SyncedCron.add({
  name: "crawl relevant keywords from twitter",
  schedule: function(parser) {
    // parser is a later.parse object
    // http://bunkat.github.io/later/parsers.html#text
    return parser.text("every 5 mins");
  },
  job: () => {
    const keywordList = TweetKeywords.find().fetch();
    if (keywordList && keywordList.length > 0) {
      keywordList.forEach(async keyword => {
        const tweets = await twitterWatcher.searchTweets(keyword.keyword);
        tweets.forEach(tweet => {
          Meteor.call("tweets.upsert", tweet, err => {
            if (err) {
              console.error(err);
            }
          });
        });
      });
    }

    Meteor.call("tweets.remove.blacklist", err => {
      if (err) {
        console.error(err);
      }
    });

    Meteor.call("tweets.remove.oldTweets", err => {
      if (err) {
        console.error(err);
      }
    });
  }
});
