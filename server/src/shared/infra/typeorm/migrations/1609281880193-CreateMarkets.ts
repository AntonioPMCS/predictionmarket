import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateMarkets1609281880193 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'markets',
        columns: [
          {
            name: 'internalId',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'id', type: 'varchar' },
          { name: 'state', type: 'varchar' },
          { name: 'title', type: 'varchar' },
          { name: 'creationDate', type: 'timestamp' },
          { name: 'endDate', type: 'timestamp' },
          { name: 'resolutionSource', type: 'varchar' },
          { name: 'description', type: 'varchar' },
          { name: 'marketMakerAddress', type: 'varchar' },
          { name: 'yesPositionID', type: 'varchar' },
          { name: 'noPositionID', type: 'varchar' },
          { name: 'questionId', type: 'varchar' },
          { name: 'oracle', type: 'varchar' },
          { name: 'tradeVolume', type: 'float8', default: 0 },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('markets');
  }
}
