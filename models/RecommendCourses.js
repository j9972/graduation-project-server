module.exports = (sequelize, DataTypes) => {
  const RecommendCourses = sequelize.define(
    "RecommendCourses",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: "고유번호 UUID",
      },
      // id와 코스 이름으로 코스 기간 알수있음 - 코스 이름에 기간도 작성 ex) 2박3일의 유쾌코스
      courseName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "코스 이름",
      },
      // 드롭바를 위해 지역명 컬럼 필요
      locationeName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "지역 이름",
      },
      coursePhoto: {
        type: DataTypes.BLOB,
        allowNull: false,
        comment: "코스 사진",
      },
      courseDescription: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "코스 설명",
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
      paranoid: true, // timestamps 가 활성화 되어야 사용 가능 > deleteAt 옵션 on
    }
  );
  // 추천 장소 호텔 연결은 이름 사진 설명을 가져오기 위함
  /*
  RecommendCourses.associate = (models) => {
    RecommendCourses.hasMany(models.RecommendHotels, {
      onDelete: "cascade",
    });
  };

  RecommendCourses.associate = (models) => {
    RecommendCourses.hasMany(models.RecommendPlaces, {
      onDelete: "cascade",
    });
  };
*/
  return RecommendCourses;
};
