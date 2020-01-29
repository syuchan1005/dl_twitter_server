import OTwitter from 'twitter';

export type User = {
  id: number;
  id_str: string;
  name: string;
  screen_name: string;
};
export type Media = {
  id: number;
  id_str: string;
  indices: number[];
  media_url: string;
  media_url_https: string;
  url: string;
  display_url: string;
  expanded_url: string;
  sizes: {
    [key in 'thumb' | 'small' | 'medium' | 'large']: {
      w: number;
      h: number;
      resize: 'fit' | 'crop';
    };
  };
} & ({
  type: 'photo';
  features: {
    [key in 'small' | 'medium' | 'large' | 'orig']: {
      faces: {
        w: number;
        h: number;
        x: number;
        y: number;
      }[];
    };
  };
} | {
  type: 'video';
  features: {};
  video_info: {
    aspect_ratio: [number, number];
    duration_millis: number;
    variants: ({
      content_type: 'video/mp4';
      bitrate: number;
      url: string;
    } | {
      content_type: 'video/x-mpegURL';
      url: string;
    })[];
  };
});
export type Status = {
  created_at: string;
  id: number;
  id_str: string;
  text: string;
  truncated: Boolean;
  entities: {
    hashtags: any[];
    symbols: any[];
    user_mentions: any[];
    url: any[];
    media: (Media & { type: 'photo' })[];
  },
  extended_entities: {
    media: Media[];
  };
  source: string;
  user: User;
};

export class Twitter {
  private twitter: OTwitter;
  protected _user: User | undefined;
  get user() { return this._user }

  constructor(config: OTwitter.AccessTokenOptions | OTwitter.BearerTokenOptions) {
    this.twitter = new OTwitter(config);
  }

  async accountVerifyCredentials(): Promise<User | undefined> {
    this.twitter.get('account/verify_credentials', {})
      .then((res) => {
        // @ts-ignore
        this._user = res;
      });
    return this._user;
  }

  async getStatus(id: string | number): Promise<Status | undefined> {
    // @ts-ignore
    return this.twitter.get(`statuses/show.json?id=${id}`, {});
  }
}
