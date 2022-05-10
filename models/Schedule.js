module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define(
    "Schedule",
    {
      area: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "여행 지역",
      },
      tripTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "여행 제목",
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "여행 설명",
      },
      startDay: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "여행 시작 날짜",
      },
      endDay: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "여행 끝 날짜",
      },
      day: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "여행 순서 - 날짜별",
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "여행 순서 - 같은 날짜 장소별",
      },
      placeTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "장소 이름",
      },
      placeImage: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
        comment: "장소 사진",
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
      paranoid: true, // timestamps 가 활성화 되어야 사용 가능 > deleteAt 옵션 on
    }
  );

  return Schedule;
};
