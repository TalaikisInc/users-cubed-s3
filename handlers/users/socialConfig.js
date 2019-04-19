import { URL, FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../config'

export default {
  facebook: {
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: `${URL}auth/facebook/callback`
  },
  twitter: {
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: `${URL}/auth/twitter/callback`
  },
  google: {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${URL}/auth/google/callback`
  }
}
