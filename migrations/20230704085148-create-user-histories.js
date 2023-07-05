'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserHistories', {
      userHistoryId: {
        allowNull: false, // NOT NULL
        primaryKey: true, // Primary Key (기본키)
        type: Sequelize.UUID, // UUID의 최댓값으로 타입을 지정합니다.
        defaultValue: Sequelize.UUIDV4, // UUID를 기본 값으로 설정합니다.
      },
      UserId: {
        allowNull: false, // NOT NULL
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // Users 모델을 참조합니다.
          key: 'userId', // Users 모델의 userId를 참조합니다.
        },
        onDelete: 'CASCADE', // 만약 Users 모델의 userId가 삭제되면, UserHistories 모델의 데이터가 삭제됩니다.
      },
      beforeName: {
        allowNull: false, // NOT NULL
        type: Sequelize.STRING,
      },
      afterName: {
        allowNull: false, // NOT NULL
        type: Sequelize.STRING,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserHistories');
  },
};
