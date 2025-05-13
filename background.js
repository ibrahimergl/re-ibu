const twitterUrls = ["*://twitter.com/*", "*://mobile.twitter.com/*"];
const instagramUrls = ["*://instagram.com/*", "*://www.instagram.com/*"];
const redditUrls = ["*://reddit.com/*", "*://www.reddit.com/*"];
const youtubeUrls = [
  "*://youtube.com/*",
  "*://m.youtube.com/*",
  "*://www.youtube.com/*",
  "*://youtu.be/*",
];

// Default and original domains
const defaultInstances = {
  twitter: {
    target: "nitter.net",
    original: "twitter.com"
  },
  instagram: {
    target: "imginn.com",
    original: "instagram.com"
  },
  youtube: {
    target: "yewtu.be",
    original: "youtube.com"
  },
  reddit: {
    target: "old.reddit.com",
    original: "reddit.com"
  }
};

let currentInstances = {
  twitter: "nitter.net",
  instagram: "imginn.com",
  youtube: "yewtu.be",
  reddit: "old.reddit.com",
  disable: false,
  disable_twitter: false,
  disable_instagram: false,
  disable_youtube: false,
  disable_reddit: false,
  custom_twitter: "",
  custom_instagram: "",
  custom_youtube: "",
  custom_reddit: ""
};

function replaceUrl(url, regex, newDomain) {
  return url.replace(regex, `$1://${newDomain}/$3`);
}

function redirect(requestDetails) {
  if (currentInstances.disable) return null;

  const originalUrl = requestDetails.url;

  // Twitter -> Nitter
  if (!currentInstances.disable_twitter && /(https?):\/\/(twitter.com|mobile.twitter.com)\/(.*)/.test(originalUrl)) {
    // When PIN is on, use target domain; when PIN is off, use original domain
    if (currentInstances.disable_twitter) {
      return null; // PIN is off, don't redirect
    } else {
      // Use the target domain (which may already be set to custom domain)
      const targetDomain = currentInstances.twitter;

      return {
        redirectUrl: replaceUrl(
          originalUrl,
          /(https?):\/\/(twitter.com|mobile.twitter.com)\/(.*)/,
          targetDomain
        )
      };
    }
  }

  // Instagram -> Imginn
  if (!currentInstances.disable_instagram && /(https?):\/\/(instagram.com|www.instagram.com)\/(.*)/.test(originalUrl)) {
    // When PIN is on, use target domain; when PIN is off, use original domain
    if (currentInstances.disable_instagram) {
      return null; // PIN is off, don't redirect
    } else {
      // Use the target domain (which may already be set to custom domain)
      const targetDomain = currentInstances.instagram;

      return {
        redirectUrl: replaceUrl(
          originalUrl,
          /(https?):\/\/(instagram.com|www.instagram.com)\/(.*)/,
          targetDomain
        )
      };
    }
  }

  // YouTube -> Invidious
  if (!currentInstances.disable_youtube && /(https?):\/\/(youtube.com|m.youtube.com|www.youtube.com|youtu.be)\/(.*)/.test(originalUrl)) {
    // When PIN is on, use target domain; when PIN is off, use original domain
    if (currentInstances.disable_youtube) {
      return null; // PIN is off, don't redirect
    } else {
      // Use the target domain (which may already be set to custom domain)
      const targetDomain = currentInstances.youtube;

      return {
        redirectUrl: replaceUrl(
          originalUrl,
          /(https?):\/\/(youtube.com|m.youtube.com|www.youtube.com|youtu.be)\/(.*)/,
          targetDomain
        )
      };
    }
  }

  // Reddit -> Old Reddit
  if (!currentInstances.disable_reddit && /(https?):\/\/(reddit.com|www.reddit.com)\/(.*)/.test(originalUrl)) {
    // When PIN is on, use target domain; when PIN is off, use original domain
    if (currentInstances.disable_reddit) {
      return null; // PIN is off, don't redirect
    } else {
      // Use the target domain (which may already be set to custom domain)
      const targetDomain = currentInstances.reddit;

      return {
        redirectUrl: replaceUrl(
          originalUrl,
          /(https?):\/\/(reddit.com|www.reddit.com)\/(.*)/,
          targetDomain
        )
      };
    }
  }

  return null;
}

// Load settings from storage
browser.storage.local.get().then((res) => {
  if (Object.keys(res).length !== 0) {
    currentInstances = res;
  }
});

// Listen for web requests
browser.webRequest.onBeforeRequest.addListener(
  redirect,
  {
    urls: [...twitterUrls, ...instagramUrls, ...redditUrls, ...youtubeUrls],
    types: ["main_frame"],
  },
  ["blocking"]
);

// Listen for messages from popup
browser.runtime.onMessage.addListener((message) => {
  if (message.type === "bg_update_instances") {
    currentInstances = message.instancesSelected;
  }
});