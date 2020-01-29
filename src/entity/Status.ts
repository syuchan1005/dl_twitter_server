import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, BaseEntity } from "typeorm";
import { User } from './User';
import { Media } from './Media';
import { Status as TwitterStatus } from '../twitter';

@Entity()
export class Status extends BaseEntity {
  @PrimaryColumn()
  id!: number;

  @Column()
  text!: string;

  @Column()
  createdAt!: Date;

  @Column()
  raw!: string;

  @ManyToOne(type => User, user => user.statuses)
  // @ts-ignore
  user: User;

  @OneToMany(type => Media, media => media.status)
  // @ts-ignore
  media: Media[];

  @Column({
    type: 'datetime',
    nullable: true,
    default: null,
  })
  deletedAt: Date | null = null;

  static fromTwitter(status: TwitterStatus) {
    const s = new Status();
    s.id = status.id;
    s.text = status.text;
    s.createdAt = new Date(status.created_at);
    s.raw = JSON.stringify(status);
    return s;
  }

  static softDelete(id: string | string[]) {
    return Status.update(id, {
      deletedAt: new Date(),
    });
  }

  static restore(id: string | string[]) {
    return Status.update(id, {
      deletedAt: null,
    });
  }
}
