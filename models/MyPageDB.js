module.exports = (sequelize, DataTypes) => {
  const MyPageDB = sequelize.define(
    "MyPageDB",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: "고유번호 UUID",
      },
      titleOfTrip: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "여행 제목",
      },
      MyPagePhoto: {
        type: DataTypes.BLOB,
        allowNull: false,
        comment: "일정 대표 사진",
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
      paranoid: true, // timestamps 가 활성화 되어야 사용 가능 > deleteAt 옵션 on
    }
  );

  MyPageDB.associate = (models) => {
    MyPageDB.hasMany(models.Users, {
      onDelete: "cascade",
    });
  };

  return MyPageDB;
};


스케쥴 db는 마이페이지에 있는 사진, 일정제목을 보여주는 디비
일정 생성에 대한 데이터 베이스는 사진, 장소 이름만 보여주면 됨