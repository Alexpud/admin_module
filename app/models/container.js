/*
 This model on the database contains a container_port collumn which is auto_incremented. The
 reason why the collumn is not present on the model is because of  the problem in using it.
 */
module.exports = function (sequelize, DataTypes) {

  var Container = sequelize.define('Container', {
    registration_ID: { type: DataTypes.STRING, primaryKey: true},
    port: { type: DataTypes.INTEGER, primaryKey: true, unique: true},
    name: { type: DataTypes.STRING}

  }, {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
        // Article.hasMany(models.Comments);
        Container.hasMany(models.Workspace,{onDelete: 'CASCADE', hooks:true, foreignKey: 'owner_ID' });
        // Maybe this line causes error

      }
    }
  });

  return Container;
};

