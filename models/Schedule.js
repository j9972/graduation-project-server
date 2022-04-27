module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define(
    "Schedule",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: "고유번호 UUID",
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "장소 제목",
      },
      MyPagePhoto: {
        type: DataTypes.BLOB,
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

  Schedule.associate = (models) => {
    Schedule.hasMany(models.Users, {
      onDelete: "cascade",
    });
  };

  return Schedule;
};
