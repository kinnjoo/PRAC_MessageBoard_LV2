'use strict';
const { Model } = require('sequelize');
const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserHistories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // 1. UserHistories 모델에서
      this.belongsTo(models.Users, {
        // 2. Users 모델에게 N:1 관계 설정을 합니다.
        targetKey: 'userId', // 3. Users 모델의 userId 컬럼을
        foreignKey: 'UserId', // 4. UserHistories 모델의 UserId 컬럼과 연결합니다.
      });
    }
  }

  UserHistories.init(
    {
      userHistoryId: {
        allowNull: false, // NOT NULL
        primaryKey: true, // Primary Key (기본키)
        type: Sequelize.UUID, // UUID의 최댓값으로 타입을 지정합니다.
        defaultValue: Sequelize.UUIDV4, // UUID를 기본 값으로 설정합니다.
      },
      UserId: {
        allowNull: false, // NOT NULL
        type: DataTypes.INTEGER,
        references: {
          model: 'Users', // Users 모델을 참조합니다.
          key: 'userId', // Users 모델의 userId를 참조합니다.
        },
        onDelete: 'CASCADE', // 만약 Users 모델의 userId가 삭제되면, Comments 모델의 데이터가 삭제됩니다.
      },
      beforeName: {
        allowNull: false, // NOT NULL
        type: DataTypes.STRING,
      },
      afterName: {
        allowNull: false, // NOT NULL
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'UserHistories',
      timestamps: false, // createdAt, updatedAt 컬럼을 생성하지 않습니다.
    },
  );
  return UserHistories;
};
