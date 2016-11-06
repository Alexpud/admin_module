/*
  This model on the database contains a container_port collumn which is auto_incremented. The
  reason why the collumn is not present on the model is because of  the problem in using it.
*/
module.exports = function (sequelize, DataTypes) {

  var Workspace = sequelize.define('Workspace', {
    containerName: { type: DataTypes.STRING, primaryKey:true},
    stack: { type: DataTypes.STRING, allowNull:false},
    workspaceName: { type: DataTypes.STRING, allowNull: false, primaryKey: true},
    workspaceID: { type: DataTypes.STRING, primaryKey: true, allowNul: false, unique: true}

  }, {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
        // Article.hasMany(models.Comments);
        Workspace.belongsTo(models.Container, { foreignKey: 'containerName', constraints:true });
      }
    }
  });

  return Workspace;
};

