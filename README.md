# admin_module
This module is created to serve as an interface for management of eclipse che service. It creates a web interface through which the administrator will be able to manage the container and workspace creation.


##Version

* Node: 4.2.6
##How it works

Using a MySQL database, it stores the users, using their logins as primary keys. And through that, it uses to associate containers to each user, and each container may or may not have workspaces associated with it.

All is controlled by using a REST API which serves as a interface for using che REST API.

The reason for that is so we can hide the che from the user, for now we only thought of hiding che pages from the user, but that won't stop the user from using the REST API to issue commands to each container.

##How to run 

On the project folder execute the following commands:

```
  npm install
```

```
  bower install
```

Sometimes you may have problems with docker, saying you don't have written permission on /var/run/docker.sock. To fix that execute the following.

```
	sudo chmod 666 /var/run/docker.sock
```

Before running the project you need a configured MySQL server running, you can check the configuration on the project or you can run our MySQL configured container which is present on docker hub on the following lik.
https://hub.docker.com/r/spudin/mysql_nginx/

## Future implemenetation

  - Block external requests to containers, allowing only the localhost or the module to send requests to the container.

##Functionalities

 - Start / Stop / Delete containers.
 - Start / Stop / Delete workspaces.
 - Login system: admin and normal users.
