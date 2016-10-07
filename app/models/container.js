/*
 This model on the database contains a container_port collumn which is auto_incremented. The
 reason why the collumn is not present on the model is because of  the problem in using it.
 */
var workspace = require('./workspace');
module.exports = function (sequelize, DataTypes) {

  var Container = sequelize.define('Container', {
    registration_ID: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    name: { type: DataTypes.STRING},
    port: { type: DataTypes.INTEGER, primaryKey: true}
  }, {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
        // Article.hasMany(models.Comments);
        Container.hasMany(models.Workspace, { as: 'workspaces', foreignKey: 'registration_ID'});
      }
    }
  });

  return Container;
};
