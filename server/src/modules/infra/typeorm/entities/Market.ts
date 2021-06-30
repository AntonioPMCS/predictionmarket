import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('markets')
class Market {
  @PrimaryGeneratedColumn('uuid')
  @Exclude()
  internalId: string;

  @Column()
  id: string;

  @Column()
  state: string;

  @Column()
  title: string;

  @Column('timestamp')
  creationDate: Date;

  @Column('timestamp')
  endDate: Date;

  @Column()
  resolutionSource: string;

  @Column()
  description: string;

  @Column()
  marketMakerAddress: string;

  @Column()
  yesPositionID: string;

  @Column()
  noPositionID: string;

  @Column()
  questionId: string;

  @Column()
  oracle: string;

  @Column('float8')
  tradeVolume: number;
}

export default Market;
