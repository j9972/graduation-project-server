module.exports = (sequelize, DataTypes) => {
  const RecommendPlaces = sequelize.define(
    "RecommendPlaces",
    {
      nameOfPlace: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "장소 이름",
      },
      descriptionOfPlace: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "장소 설명",
      },
      siteOfPlace: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "장소 사이트",
      },
      numberOfPlace: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "장소 전화번호",
      },
      photoOfPlace: {
        type: DataTypes.BLOB,
        allowNull: false,
        comment: "장소 사진",
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "장소 주소",
      },
      // orderOfPlaces: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      //   autoIncrement: true,
      //   comment: "장소 순서",
      //   primaryKey: true,
      // },
      timegapBetweenTwoPlaces: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "다음 장소까지의 시간차이",
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
      paranoid: true, // timestamps 가 활성화 되어야 사용 가능 > deleteAt 옵션 on
    }
  );

  RecommendPlaces.associate = (models) => {
    RecommendPlaces.hasMany(models.RecommendCourses, {
      onDelete: "cascade",
    });
  };

  return RecommendPlaces;
};
// 장소사이간의 차이는 추후 수정 요함
// orderOfPlaces 에 속성으로 autoIncrement : 숫자 자동 증가(default : false) 이거 고민
