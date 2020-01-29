import { promises as fs, createWriteStream } from 'fs';
import { extname } from '../util';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import Axios from 'axios';
import { Status } from './Status';
import { Media as TwitterMedia } from '../twitter';

export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
}

@Entity()
export class Media extends BaseEntity {
  @PrimaryColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: '7'
  })
  type!: MediaType;

  @Column()
  url!: string;

  @Column()
  ext!: string;

  @Column()
  raw!: string;

  @CreateDateColumn()
  // @ts-ignore
  createdAt: Date;

  @ManyToOne(type => Status, status => status.media)
  // @ts-ignore
  status: Status;

  static fromTwitter(media: TwitterMedia) {
    const m = new Media();
    m.id = media.id;
    // @ts-ignore
    m.type = media.type;
    m.raw = JSON.stringify(media);
    if (media.type === MediaType.PHOTO) {
      m.url = `${media.media_url_https}:orig`;
    } else if (media.type === MediaType.VIDEO) {
      m.url = media.video_info.variants.reduce((a, b) => {
        // @ts-ignore
        return ((a?.bitrate ?? 0) > (b?.bitrate ?? 0)) ? a : b;
      }).url;
    }
    m.ext = extname(m.url);
    return m;
  }

  async saveMediaToLocal() {
    await fs.mkdir('public/media', { recursive: true }).catch(() => {});
    const writer = createWriteStream(`public/media/${this.id}${this.ext}`);
    const res = await Axios({
      url: this.url,
      method: 'GET',
      responseType: 'stream',
    });
    res.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
}
