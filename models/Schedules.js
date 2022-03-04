module.exports = (sequelize, DataTypes) => {
  const Schedules = sequelize.define(
    "Schedules",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: "고유번호 UUID",
      },
      eachDay: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "여행 날짜별 Day",
      },
      titleOfTrip: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "여행 제목",
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "일정 계획",
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
      paranoid: true, // timestamps 가 활성화 되어야 사용 가능 > deleteAt 옵션 on
    }
  );

  Schedules.associate = (models) => {
    Schedules.hasMany(models.Users, {
      onDelete: "cascade",
    });

    Schedules.hasMany(models.RecommendPlaces, {
      onDelete: "cascade",
    });

    Schedules.hasMany(models.RecommendHotels, {
      onDelete: "cascade",
    });
  };

  return Schedules;
};
