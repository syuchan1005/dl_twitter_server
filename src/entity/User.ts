import { Entity, Column, PrimaryColumn, OneToMany, BaseEntity } from "typeorm";
import { Status } from './Status';
import { User as TwitterUser } from '../twitter';

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id!: number;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 15 })
  screenName!: string;

  @Column()
  raw!: string;

  @OneToMany(type => Status, status => status.user)
  // @ts-ignore
  statuses: Status[];

  static fromTwitter(user: TwitterUser): User {
    const u = new User();
    u.id = user.id;
    u.name = user.name;
    u.screenName = user.screen_name;
    u.raw = JSON.stringify(user);
    return u;
  }
}
