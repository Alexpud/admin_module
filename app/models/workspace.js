/*
  This model on the database contains a container_port collumn which is auto_incremented. The
  reason why the collumn is not present on the model is because of  the problem in using it.
*/
module.exports = function (sequelize, DataTypes) {

  var Workspace = sequelize.define('Workspace', {
    owner_ID: { type: DataTypes.STRING, allowNull: false, primaryKey: true, references: { model:'Containers', key: 'registration_ID'} },
    workspace_name: { type: DataTypes.STRING, allowNull: false, primaryKey: true},
    workspace_id: { type: DataTypes.STRING, allowNul: false},
    stack: { type: DataTypes.STRING, allowNull:false}
  }, {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
        // Article.hasMany(models.Comments);
        Workspace.belongsTo(models.Container);
      }
    }
  }).sync();

  return Workspace;
};

