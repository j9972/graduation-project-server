module.exports = (sequelize, DataTypes) => {
  const RecommendHotels = sequelize.define(
    "RecommendHotels",
    {
      nameOfHotel: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "호텔 이름",
      },
      descriptionOfHotel: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "호텔 설명",
      },
      siteOfHotel: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "호텔 사이트",
      },
      numberOfHotel: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "호텔 전화번호",
      },
      photoOfHotel: {
        type: DataTypes.BLOB,
        allowNull: false,
        comment: "호텔 사진",
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "호텔 주소",
      },
      orderOfHotel: {
        type: DataTypes.STRING,
        allowNull: false,
        autoIncrement: true,
        comment: "호텔 순서",
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
      paranoid: true, // timestamps 가 활성화 되어야 사용 가능 > deleteAt 옵션 on
    }
  );

  RecommendHotels.associate = (models) => {
    RecommendHotels.hasMany(models.RecommendCourses, {
      onDelete: "cascade",
    });
  };

  return RecommendHotels;
};
