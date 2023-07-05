const express = require('express');
const jwt = require('jsonwebtoken');
const { Users, UserInfos, UserHistories, sequelize } = require('../models');
const router = express.Router();
const { Transaction } = require('sequelize');
const authMiddleware = require('../middlewares/auth-middleware.js');

// 회원가입
router.post('/users', async (req, res) => {
  const { email, password, name, age, gender, profileImage } = req.body;
  const isExistUser = await Users.findOne({ where: { email } });

  if (isExistUser) {
    return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
  }

  // 1. 트랜젝션 객체를 할당
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED, // 격리 수준을 READ_COMMITTED로 설정
  });

  try {
    // Users 테이블에 사용자를 추가합니다.
    const user = await Users.create({ email, password }, { transaction });
    // UserInfos 테이블에 사용자 정보를 추가합니다.
    const userInfo = await UserInfos.create(
      {
        UserId: user.userId, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성합니다.
        name,
        age,
        gender: gender.toUpperCase(), // 성별을 대문자로 변환합니다.
        profileImage,
      },
      { transaction },
    );

    // 모든 로직이 완료된 경우 Commit
    await transaction.commit();
  } catch (transactionError) {
    // 트랜젝션 내에서 작업이 실패한 경우 : DB에 트랜젝션 내의 작업 내역을 취소
    await transaction.rollback();
    return res
      .status(400)
      .json({ errorMessage: '유저 생성에 실패하였습니다.' });
  }

  return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
});

// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
  } else if (user.password !== password) {
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  const token = jwt.sign(
    {
      userId: user.userId,
    },
    'customized_secret_key',
  );
  res.cookie('authorization', `Bearer ${token}`);
  return res.status(200).json({ message: '로그인 성공' });
});

// 사용자 조회
router.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  const user = await Users.findOne({
    attributes: ['userId', 'email', 'createdAt', 'updatedAt'],
    include: [
      {
        model: UserInfos, // 1:1 관계를 맺고있는 UserInfos 테이블을 조회합니다.
        attributes: ['name', 'age', 'gender', 'profileImage'],
      },
    ],
    where: { userId },
  });

  return res.status(200).json({ data: user });
});

// 사용자 이름 변경
router.put('/users/name', authMiddleware, async (req, res) => {
  const { name } = req.body; // 변경할 이름
  const { userId } = res.locals.user;

  const userInfo = await UserInfos.findOne({ where: { userId } });
  const beforeName = userInfo.name;

  // 트랜젝션으로 비즈니스 로직 수행
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  });

  try {
    // 사용자 정보 테이블에 있는 이름 변경
    await UserInfos.update(
      { name },
      {
        where: { userId },
        transaction, // 트랜젝션을 통해서 쿼리를 수행
      },
    );

    // 사용자의 변경된 이름 내역을 UserHistories 테이블에 삽입
    await UserHistories.create(
      {
        UserId: userId,
        beforeName,
        afterName: name,
      },
      { transaction }, // 트랜젝션을 통해서 쿼리를 수행
    );

    await transaction.commit(); // 모든 비즈니스 로직이 성공하였다면 DB에 반영
  } catch (transactionError) {
    console.error(transactionError);
    await transaction.rollback();
    return res
      .status(400)
      .json({ errorMessage: '유저 이름 변경에 실패하였습니다.' });
  }

  return res.status(200).json({ message: '유저 이름 변경에 성공하였습니다.' });
});

module.exports = router;
