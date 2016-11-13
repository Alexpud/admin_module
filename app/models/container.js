/*
 This model on the database contains a container_port collumn which is auto_incremented. The
 reason why the collumn is not present on the model is because of  the problem in using it.
 */
module.exports = function (sequelize, DataTypes) {

  var Container = sequelize.define('Container', {
    name: { type: DataTypes.STRING, primaryKey: true, allowNull: false, unique: true },
    port: { type: DataTypes.INTEGER,unique: true}
  }, {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
        // Article.hasMany(models.Comments);
        Container.hasMany(models.Workspace,{ foreignKey: 'containerName', constraints: true, onDelete: 'cascade', hooks: true});
        Container.belongsTo(models.User,{constraints: true});
        // Maybe this line causes error
      }
    }
  });

  return Container;
};

