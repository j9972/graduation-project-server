module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define(
    "Schedule",
    {
      day: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "여행 순서 - 날짜별",
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "여행 순서 - 같은 날짜 장소별",
      },
      placeTitle: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "장소 이름",
      },
      placeImage: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "장소 사진",
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
      //paranoid: true, // timestamps 가 활성화 되어야 사용 가능 > deleteAt 옵션 on
    }
  );

  return Schedule;
};
