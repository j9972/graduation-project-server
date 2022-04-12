module.exports = (sequelize, DataTypes) => {
  const Visitor = sequelize.define(
    "Visitor",
    {
      ip: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "IP 주소",
      },
      totalCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "총 방문자수",
      },
      todayCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "오늘 방문자 수",
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "오늘 날짜",
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      timestamps: false, // createAt & updateAt 비활성화
    }
  );

  return Visitor;
};
