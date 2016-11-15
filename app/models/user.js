/*
 This model on the database contains a container_port collumn which is auto_incremented. The
 reason why the collumn is not present on the model is because of  the problem in using it.
 */
var bcrypt = require('bcrypt-nodejs');

module.exports = function (sequelize, DataTypes)
{
  var User = sequelize.define('User', {
    admin: { type: DataTypes.BOOLEAN},
    login: { type: DataTypes.STRING,len: [12,12], allowNull: false, primaryKey: true},
    password: { type: DataTypes.STRING},
    token: { type: DataTypes.STRING}
  }, {
    classMethods:
    {
      associate: function (models)
      {
        // example on how to add relations
        // Article.hasMany(models.Comments);
        User.hasMany(models.Container, { foreignKey: 'name', onDelete: 'cascade', constraints: true})
      },
      validatePassword: function(passwordA,passwordB)
      {
        return bcrypt.compareSync(passwordA,passwordB);
      }
    },
    hooks:
    {
      beforeCreate: hashPassword
    }
  });

  var hashPassword = function(user,done)
  {
    bcrypt.genSalt(10, function (err, salt)
    {
      bcrypt.hash(user.password, salt, null, function (err, encrypted) {
        console.log('Using beforeCreate to generate encrypted password');
        if (err) return done(err);
        user.password = encrypted;
      });
    });
  };

  var updateToken = function(user,done)
  {
    bcrypt.genSalt(10, function (err, salt)
    {
      bcrypt.hash(user.token, salt, null, function (err, encrypted) {
        console.log('Using beforeCreate to generate encrypted password');
        if (err) return done(err);
        user.token = encrypted;
      });
    });
  };

  return User;
};

