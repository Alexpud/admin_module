/*
 This model on the database contains a container_port collumn which is auto_incremented. The
 reason why the collumn is not present on the model is because of  the problem in using it.
 */

module.exports = function (sequelize, DataTypes) {

  var User = sequelize.define('User', {
    login: { type: DataTypes.STRING,len: [12,12], allowNull: false, primaryKey: true},
    password: { type: DataTypes.STRING},
    token: { type: DataTypes.STRING},
    admin: { type: DataTypes.BOOLEAN}
  }, {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
        // Article.hasMany(models.Comments);
        User.hasMany(models.Container, { foreignKey: 'name', onDelete: 'cascade', constraints: true})
      }
    }
  });

  return User;
};

